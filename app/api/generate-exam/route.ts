import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { auth } from "@/auth"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

const openai = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
        "X-Title": process.env.SITE_NAME || "AI Edu App",
    },
})

interface ExamRequest {
    fileId: string
    examTypes: string[]
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body: ExamRequest = await req.json()
        const { fileId, examTypes } = body

        if (!fileId || !examTypes || examTypes.length === 0) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Fetch file from database
        const client = await clientPromise
        const db = client.db("edu_app")
        const file = await db.collection("files").findOne({
            _id: new ObjectId(fileId),
            userEmail: session.user.email
        })

        if (!file) {
            return NextResponse.json({ error: "File not found" }, { status: 404 })
        }

        const content = file.content as string
        if (!content || content.trim().length === 0) {
            return NextResponse.json({ error: "File has no content" }, { status: 400 })
        }

        // Initialize exam generation status
        await db.collection("files").updateOne(
            { _id: new ObjectId(fileId) },
            {
                $set: {
                    "examGeneration.status": "generating",
                    "examGeneration.startedAt": new Date(),
                    "examGeneration.chunksProcessed": 0,
                    "examGeneration.totalChunks": 0,
                    "examGeneration.error": null
                },
                $setOnInsert: {
                    "exams.mcqs": [],
                    "exams.fillBlanks": [],
                    "exams.solutions": []
                }
            },
            { upsert: true }
        )

        // Start background processing (fire-and-forget)
        generateExamsInBackground(fileId, content, examTypes, session.user.email).catch(err => {
            console.error("Background exam generation error:", err)
        })

        // Return immediately
        return NextResponse.json({
            success: true,
            message: "Exam generation started in background",
            fileId
        })

    } catch (error: any) {
        console.error("Error starting exam generation:", error)
        return NextResponse.json(
            { error: error.message || "Failed to start exam generation" },
            { status: 500 }
        )
    }
}

async function generateExamsInBackground(
    fileId: string,
    content: string,
    examTypes: string[],
    userEmail: string
) {
    const client = await clientPromise
    const db = client.db("edu_app")

    try {
        // Split content into chunks
        const chunks = chunkContent(content, 3000)

        await db.collection("files").updateOne(
            { _id: new ObjectId(fileId) },
            { $set: { "examGeneration.totalChunks": chunks.length } }
        )

        // Process each chunk
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i]

            // Make separate API call for each exam type
            for (const examType of examTypes) {
                try {
                    const result = await generateSingleExamType(chunk, examType, i + 1, chunks.length)

                    // Save to database immediately
                    await saveExamResults(db, fileId, examType, result.questions || [])

                    console.log(`✅ Saved ${result.questions?.length || 0} ${examType} questions for chunk ${i + 1}`)

                } catch (error: any) {
                    console.error(`❌ Error generating ${examType} for chunk ${i + 1}:`, error.message)
                    // Continue processing other types/chunks
                }
            }

            // Update progress
            await db.collection("files").updateOne(
                { _id: new ObjectId(fileId) },
                { $set: { "examGeneration.chunksProcessed": i + 1 } }
            )
        }

        // Mark as completed
        await db.collection("files").updateOne(
            { _id: new ObjectId(fileId) },
            {
                $set: {
                    "examGeneration.status": "completed",
                    "examGeneration.completedAt": new Date()
                }
            }
        )

        console.log(`✅ Exam generation completed for file ${fileId}`)

    } catch (error: any) {
        console.error(`❌ Fatal error in background generation for file ${fileId}:`, error)

        await db.collection("files").updateOne(
            { _id: new ObjectId(fileId) },
            {
                $set: {
                    "examGeneration.status": "failed",
                    "examGeneration.error": error.message,
                    "examGeneration.completedAt": new Date()
                }
            }
        )
    }
}

async function saveExamResults(db: any, fileId: string, examType: string, questions: any[]) {
    if (!questions || questions.length === 0) return

    const fieldMap: Record<string, string> = {
        mcq: "exams.mcqs",
        fillBlanks: "exams.fillBlanks",
        solutions: "exams.solutions"
    }

    const field = fieldMap[examType]
    if (!field) return

    await db.collection("files").updateOne(
        { _id: new ObjectId(fileId) },
        {
            $push: {
                [field]: { $each: questions }
            },
            $set: {
                updatedAt: new Date()
            }
        }
    )
}

function chunkContent(content: string, maxChars: number): string[] {
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0)
    const chunks: string[] = []
    let currentChunk = ""

    for (const paragraph of paragraphs) {
        if (currentChunk.length + paragraph.length > maxChars && currentChunk.length > 0) {
            chunks.push(currentChunk.trim())
            currentChunk = paragraph
        } else {
            currentChunk += (currentChunk ? "\n\n" : "") + paragraph
        }
    }

    if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim())
    }

    return chunks.length > 0 ? chunks : [content]
}

async function generateSingleExamType(
    chunk: string,
    examType: string,
    chunkNumber: number,
    totalChunks: number
): Promise<any> {
    const typeConfig: Record<string, any> = {
        mcq: {
            name: "Multiple Choice Questions (MCQs)",
            arrayName: "mcqs",
            format: `{
  "mcqs": [
    {
      "question": "Clear question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "difficulty": "hard"
    }
  ]
}`,
            instructions: "- 4 options per question\n- correctAnswer is index (0-3)\n- Make distractors plausible"
        },
        fillBlanks: {
            name: "Fill in the Blanks",
            arrayName: "fillBlanks",
            format: `{
  "fillBlanks": [
    {
      "question": "Question with _____ blank",
      "answer": "correct answer",
      "difficulty": "medium"
    }
  ]
}`,
            instructions: "- Use _____ to mark the blank\n- Answer should be a single word or short phrase\n- Context should make answer clear"
        },
        solutions: {
            name: "Solving Solutions",
            arrayName: "solutions",
            format: `{
  "solutions": [
    {
      "problem": "Problem statement",
      "solution": "Final answer",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "difficulty": "hard"
    }
  ]
}`,
            instructions: "- Provide step-by-step breakdown\n- Each step should be clear and logical\n- Solution should be complete"
        }
    }

    const config = typeConfig[examType]
    if (!config) {
        throw new Error(`Unknown exam type: ${examType}`)
    }

    // Limit content to 3000 characters but preserve paragraph boundaries
    const paragraphs = chunk.split(/\n\s*\n/).filter(p => p.trim().length > 0)
    let truncatedChunk = ""
    let paragraphCount = 0

    for (const paragraph of paragraphs) {
        const potentialLength = truncatedChunk.length + paragraph.length + (truncatedChunk ? 2 : 0)
        if (potentialLength <= 3000) {
            truncatedChunk += (truncatedChunk ? "\n\n" : "") + paragraph
            paragraphCount++
        } else if (truncatedChunk.length === 0) {
            truncatedChunk = paragraph.substring(0, 3000)
            paragraphCount = 1
            break
        } else {
            break
        }
    }

    const prompt = `Create ${config.name} from this content (chunk ${chunkNumber}/${totalChunks}):

${truncatedChunk}

CRITICAL INSTRUCTIONS:
1. DO NOT think or reason - skip all analysis and directly generate questions
2. Generate MAXIMUM questions possible (aim for 15-25 questions)
3. Extract EVERY testable concept, fact, and detail
4. Make questions challenging and comprehensive
5. Return ONLY valid JSON in this exact format (NO explanations, NO reasoning):

${config.format}

Additional rules:
${config.instructions}
- Difficulty: vary between "easy", "medium", "hard"

Return ONLY the JSON, nothing else:`

    const completion = await openai.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
            {
                role: "system",
                content: `You are an expert exam creator specializing in ${config.name}. Do not think or show reasoning - directly return valid JSON only. Skip all analysis and immediately generate questions.`
            },
            { role: "user", content: prompt }
        ],
        temperature: 0.8,
        response_format: { type: "json_object" }
    })

    const responseText = completion.choices[0].message.content || "{}"
    const parsed = JSON.parse(responseText)
    const questions = Array.isArray(parsed[config.arrayName]) ? parsed[config.arrayName] : []

    return { questions }
}
