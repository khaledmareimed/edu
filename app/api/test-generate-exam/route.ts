import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
        "X-Title": process.env.SITE_NAME || "AI Edu App",
    },
})

interface TestExamRequest {
    content: string
    examTypes: string[]
    chunkNumber: number
    totalChunks: number
}

export async function POST(req: NextRequest) {
    try {
        const body: TestExamRequest = await req.json()
        const { content, examTypes, chunkNumber, totalChunks } = body

        if (!content || !examTypes || examTypes.length === 0) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const result = await generateExamForChunk(content, examTypes, chunkNumber, totalChunks)

        return NextResponse.json({
            success: true,
            data: result.data,
            apiCalls: result.apiCalls
        })

    } catch (error: any) {
        console.error("Error in test exam generation:", error)
        return NextResponse.json(
            { error: error.message || "Failed to generate exam" },
            { status: 500 }
        )
    }
}

async function generateExamForChunk(
    chunk: string,
    examTypes: string[],
    chunkNumber: number,
    totalChunks: number
): Promise<any> {
    const result = {
        mcqs: [] as any[],
        fillBlanks: [] as any[],
        solutions: [] as any[]
    }

    const apiCalls: any[] = []

    // Make separate API call for each exam type
    for (const examType of examTypes) {
        const callStartTime = Date.now()

        try {
            const typeResult = await generateSingleExamType(chunk, examType, chunkNumber, totalChunks)
            const callEndTime = Date.now()

            // Merge results
            if (examType === "mcq" && typeResult.questions) {
                result.mcqs = typeResult.questions
            } else if (examType === "fillBlanks" && typeResult.questions) {
                result.fillBlanks = typeResult.questions
            } else if (examType === "solutions" && typeResult.questions) {
                result.solutions = typeResult.questions
            }

            // Store API call info
            apiCalls.push({
                type: examType,
                duration: callEndTime - callStartTime,
                questionCount: typeResult.questions?.length || 0,
                paragraphsSent: typeResult.paragraphsSent || 0,
                totalParagraphs: typeResult.totalParagraphs || 0,
                prompt: typeResult.prompt,
                aiResponse: typeResult.aiResponse,
                fullApiResponse: typeResult.fullApiResponse,
                success: true
            })

            console.log(`✅ ${examType}: Generated ${typeResult.questions?.length || 0} questions in ${callEndTime - callStartTime}ms`)

        } catch (error: any) {
            const callEndTime = Date.now()
            console.error(`❌ Error generating ${examType}:`, error.message)

            apiCalls.push({
                type: examType,
                duration: callEndTime - callStartTime,
                questionCount: 0,
                error: error.message,
                success: false
            })
        }
    }

    const total = result.mcqs.length + result.fillBlanks.length + result.solutions.length
    console.log(`✅ Chunk ${chunkNumber}: Total ${total} questions`)

    return {
        data: result,
        apiCalls
    }
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

    // Limit content to 1000 characters but preserve paragraph boundaries
    const paragraphs = chunk.split(/\n\s*\n/).filter(p => p.trim().length > 0)
    let truncatedChunk = ""
    let paragraphCount = 0

    for (const paragraph of paragraphs) {
        const potentialLength = truncatedChunk.length + paragraph.length + (truncatedChunk ? 2 : 0) // +2 for \n\n
        if (potentialLength <= 3000) {
            truncatedChunk += (truncatedChunk ? "\n\n" : "") + paragraph
            paragraphCount++
        } else if (truncatedChunk.length === 0) {
            // If first paragraph is too long, take it anyway but truncate it
            truncatedChunk = paragraph.substring(0, 3000)
            paragraphCount = 1
            break
        } else {
            break
        }
    }

    const wasTruncated = truncatedChunk.length < chunk.length

    const prompt = `Create ${config.name} from this content (chunk ${chunkNumber}/${totalChunks})${wasTruncated ? ` [${paragraphCount} of ${paragraphs.length} paragraphs, ${truncatedChunk.length} chars]` : ''}:

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

    console.log(`\n📝 Generating ${config.name} for chunk ${chunkNumber}... (${paragraphCount}/${paragraphs.length} paragraphs, ${truncatedChunk.length} chars)`)

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
    console.log(`📦 Response length: ${responseText.length} characters`)

    const parsed = JSON.parse(responseText)
    const questions = Array.isArray(parsed[config.arrayName]) ? parsed[config.arrayName] : []

    return {
        questions,
        paragraphsSent: paragraphCount,
        totalParagraphs: paragraphs.length,
        prompt,
        aiResponse: responseText,
        fullApiResponse: JSON.stringify(completion)
    }
}
