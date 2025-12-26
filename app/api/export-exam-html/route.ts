import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { generateExamHTML } from "@/func/generate-exam-html"

export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { fileId } = body

        if (!fileId) {
            return NextResponse.json({ error: "Missing fileId" }, { status: 400 })
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

        if (!file.exams || (!file.exams.mcqs?.length && !file.exams.fillBlanks?.length && !file.exams.solutions?.length)) {
            return NextResponse.json({ error: "No exams found for this file" }, { status: 400 })
        }

        // Generate HTML
        const html = generateExamHTML(
            file.title || "Exam",
            file.exams.mcqs || [],
            file.exams.fillBlanks || [],
            file.exams.solutions || []
        )

        return NextResponse.json({
            success: true,
            html
        })

    } catch (error: any) {
        console.error("Error generating HTML:", error)
        return NextResponse.json(
            { error: error.message || "Failed to generate HTML" },
            { status: 500 }
        )
    }
}

