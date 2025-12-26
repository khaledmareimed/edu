export interface Subject {
    _id: string
    title: string
    color: string
    icon: string
    userEmail: string
    createdAt: Date
}

export interface ExamGeneration {
    chunksProcessed: number
    error: string | null
    startedAt: Date
    status: "pending" | "processing" | "completed" | "failed" | "generating"
    totalChunks: number
    completedAt?: Date
}

export interface File {
    _id: string
    title: string
    content: string
    subjectId: string
    userEmail: string
    createdAt: Date
    updatedAt?: Date
    examGeneration?: ExamGeneration
    exams?: {
        mcqs?: any[]
        fillBlanks?: any[]
        solutions?: any[]
    }
}
