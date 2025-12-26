"use client"

import { useState } from "react"
import { Loader2, Clock, AlertCircle, CheckCircle, FileText } from "lucide-react"

interface ApiCallResult {
    type: string
    duration: number
    questionCount: number
    paragraphsSent?: number
    totalParagraphs?: number
    prompt?: string
    aiResponse?: string
    fullApiResponse?: string
    error?: string
    success: boolean
}

interface ChunkResult {
    chunkNumber: number
    content: string
    prompt?: string
    aiResponse?: string
    fullApiResponse?: string
    apiCalls?: ApiCallResult[]
    startTime: number
    endTime?: number
    duration?: number
    mcqCount?: number
    fillBlanksCount?: number
    solutionsCount?: number
    error?: string
}

export default function TestExamGenerationPage() {
    const [content, setContent] = useState("")
    const [selectedTypes, setSelectedTypes] = useState<string[]>(["mcq"])
    const [isGenerating, setIsGenerating] = useState(false)
    const [chunks, setChunks] = useState<string[]>([])
    const [results, setResults] = useState<ChunkResult[]>([])
    const [progress, setProgress] = useState<number>(0)
    const [overallStart, setOverallStart] = useState<number>(0)
    const [overallEnd, setOverallEnd] = useState<number>(0)
    const [error, setError] = useState<string>("")

    const EXAM_TYPES = [
        { id: "mcq", label: "MCQs" },
        { id: "fillBlanks", label: "Fill Blanks" },
        { id: "solutions", label: "Solutions" },
    ]

    const toggleType = (typeId: string) => {
        setSelectedTypes(prev =>
            prev.includes(typeId)
                ? prev.filter(id => id !== typeId)
                : [...prev, typeId]
        )
    }

    const chunkContent = (text: string, maxChars: number): string[] => {
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
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

        return chunks.length > 0 ? chunks : [text]
    }

    const handleGenerate = async () => {
        if (!content || content.trim().length === 0) {
            setError("Please enter some content")
            return
        }

        if (selectedTypes.length === 0) {
            setError("Please select at least one exam type")
            return
        }

        setError("")
        setIsGenerating(true)
        const startTime = Date.now()
        setOverallStart(startTime)

        try {
            // Split content into chunks
            const contentChunks = chunkContent(content, 3000)
            setChunks(contentChunks)

            const chunkResults: ChunkResult[] = []

            // Process each chunk
            for (let i = 0; i < contentChunks.length; i++) {
                const chunk = contentChunks[i]
                const chunkStartTime = Date.now()

                // Generate the prompt
                const typesMap: Record<string, string> = {
                    mcq: "Multiple Choice Questions (MCQs)",
                    fillBlanks: "Fill in the Blanks",
                    solutions: "Solving Solutions"
                }
                const selectedTypesText = selectedTypes.map(t => typesMap[t] || t).join(", ")
                const generatedPrompt = `Based on this content (chunk ${i + 1} of ${contentChunks.length}), create as many exam questions as possible:\n\n${chunk.substring(0, 200)}...\n\nGenerate the following types: ${selectedTypesText}\n\nIMPORTANT: Generate the MAXIMUM number of questions possible from this content.`

                const chunkResult: ChunkResult = {
                    chunkNumber: i + 1,
                    content: chunk,
                    prompt: generatedPrompt,
                    startTime: chunkStartTime
                }

                try {
                    const response = await fetch("/api/test-generate-exam", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            content: chunk,
                            examTypes: selectedTypes,
                            chunkNumber: i + 1,
                            totalChunks: contentChunks.length
                        })
                    })

                    const data = await response.json()
                    const chunkEndTime = Date.now()

                    if (!response.ok) {
                        throw new Error(data.error || "Failed to generate exam")
                    }

                    chunkResult.endTime = chunkEndTime
                    chunkResult.duration = chunkEndTime - chunkStartTime
                    chunkResult.mcqCount = data.data.mcqs?.length || 0
                    chunkResult.fillBlanksCount = data.data.fillBlanks?.length || 0
                    chunkResult.solutionsCount = data.data.solutions?.length || 0
                    chunkResult.apiCalls = data.apiCalls || []

                } catch (err: any) {
                    chunkResult.endTime = Date.now()
                    chunkResult.duration = chunkResult.endTime - chunkStartTime
                    chunkResult.error = err.message
                }

                chunkResults.push(chunkResult)
                setResults([...chunkResults])
                setProgress(Math.round(((i + 1) / contentChunks.length) * 100))
            }

            const endTime = Date.now()
            setOverallEnd(endTime)

        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsGenerating(false)
        }
    }

    const totalQuestions = results.reduce(
        (acc, r) => ({
            mcq: acc.mcq + (r.mcqCount || 0),
            fillBlanks: acc.fillBlanks + (r.fillBlanksCount || 0),
            solutions: acc.solutions + (r.solutionsCount || 0)
        }),
        { mcq: 0, fillBlanks: 0, solutions: 0 }
    )

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Exam Generation Test Page</h1>
                    <p className="text-muted-foreground mt-2">
                        Test the AI exam generation with detailed metrics
                    </p>
                </div>

                {/* Input Section */}
                <div className="space-y-4 border rounded-lg p-6 bg-card">
                    <div>
                        <label className="text-sm font-medium mb-2 block">Test Content</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Paste your content here to test exam generation..."
                            className="w-full h-40 p-4 rounded-md border bg-background font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {content.length} characters, {content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length} paragraphs
                        </p>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">Exam Types</label>
                        <div className="flex gap-3">
                            {EXAM_TYPES.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => toggleType(type.id)}
                                    disabled={isGenerating}
                                    className={`px-4 py-2 rounded-md border transition-colors ${selectedTypes.includes(type.id)
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background border-input hover:bg-accent"
                                        } disabled:opacity-50`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 disabled:opacity-50"
                    >
                        {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isGenerating ? "Generating..." : "Generate Exam"}
                    </button>

                    {error && (
                        <div className="flex items-center gap-2 text-destructive text-sm">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                {isGenerating && (
                    <div className="border rounded-lg p-6 bg-card space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Processing...</h2>
                            <span className="text-2xl font-bold text-primary">{progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-primary h-full transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Processing chunk {results.length} of {chunks.length}
                        </p>
                    </div>
                )}

                {/* Overall Summary */}
                {overallEnd > 0 && (
                    <div className="border rounded-lg p-6 bg-card space-y-4">
                        <h2 className="text-xl font-semibold">Overall Summary</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="border rounded p-3">
                                <div className="text-sm text-muted-foreground">Total Time</div>
                                <div className="text-2xl font-bold">{((overallEnd - overallStart) / 1000).toFixed(2)}s</div>
                            </div>
                            <div className="border rounded p-3">
                                <div className="text-sm text-muted-foreground">Chunks</div>
                                <div className="text-2xl font-bold">{chunks.length}</div>
                            </div>
                            <div className="border rounded p-3">
                                <div className="text-sm text-muted-foreground">Total Questions</div>
                                <div className="text-2xl font-bold">
                                    {totalQuestions.mcq + totalQuestions.fillBlanks + totalQuestions.solutions}
                                </div>
                            </div>
                            <div className="border rounded p-3">
                                <div className="text-sm text-muted-foreground">Errors</div>
                                <div className="text-2xl font-bold text-destructive">
                                    {results.filter(r => r.error).length}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="border rounded p-3 bg-blue-500/10">
                                <div className="text-sm text-muted-foreground">MCQs</div>
                                <div className="text-xl font-bold">{totalQuestions.mcq}</div>
                            </div>
                            <div className="border rounded p-3 bg-green-500/10">
                                <div className="text-sm text-muted-foreground">Fill Blanks</div>
                                <div className="text-xl font-bold">{totalQuestions.fillBlanks}</div>
                            </div>
                            <div className="border rounded p-3 bg-purple-500/10">
                                <div className="text-sm text-muted-foreground">Solutions</div>
                                <div className="text-xl font-bold">{totalQuestions.solutions}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Chunk Results */}
                {results.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Chunk Processing Details</h2>
                        {results.map((result) => (
                            <div key={result.chunkNumber} className="border rounded-lg p-6 bg-card space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        <h3 className="font-semibold">Chunk {result.chunkNumber}</h3>
                                        {result.error ? (
                                            <AlertCircle className="h-4 w-4 text-destructive" />
                                        ) : (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        {result.duration ? `${(result.duration / 1000).toFixed(2)}s` : "Processing..."}
                                    </div>
                                </div>

                                <div className="bg-muted p-3 rounded text-sm font-mono max-h-32 overflow-y-auto">
                                    {result.content.substring(0, 300)}
                                    {result.content.length > 300 && "..."}
                                </div>

                                <div className="text-xs text-muted-foreground">
                                    {result.content.length} characters
                                </div>

                                {result.apiCalls && result.apiCalls.length > 0 && (
                                    <div className="space-y-3 mt-3">
                                        <h4 className="text-sm font-medium">API Calls ({result.apiCalls.length})</h4>
                                        {result.apiCalls.map((call, idx) => (
                                            <div key={idx} className="border rounded p-3 space-y-2 bg-muted/30">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium capitalize">{call.type}</span>
                                                    <div className="flex items-center gap-3 text-xs">
                                                        <span className={call.success ? "text-green-600" : "text-destructive"}>
                                                            {call.success ? `${call.questionCount} questions` : "Failed"}
                                                        </span>
                                                        {call.paragraphsSent !== undefined && call.totalParagraphs !== undefined && (
                                                            <span className="text-blue-600">
                                                                {call.paragraphsSent}/{call.totalParagraphs} paragraphs
                                                            </span>
                                                        )}
                                                        <span className="text-muted-foreground">{call.duration}ms</span>
                                                    </div>
                                                </div>

                                                {call.prompt && (
                                                    <details className="group">
                                                        <summary className="cursor-pointer text-xs font-medium text-primary hover:underline">
                                                            View Prompt
                                                        </summary>
                                                        <div className="mt-2 bg-background p-2 rounded text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto border">
                                                            {call.prompt}
                                                        </div>
                                                    </details>
                                                )}

                                                {call.aiResponse && (
                                                    <details className="group">
                                                        <summary className="cursor-pointer text-xs font-medium text-green-600 hover:underline">
                                                            View AI Response
                                                        </summary>
                                                        <div className="mt-2 bg-green-50 dark:bg-green-950 p-2 rounded text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto border border-green-200">
                                                            {call.aiResponse}
                                                        </div>
                                                    </details>
                                                )}

                                                {call.fullApiResponse && (
                                                    <details className="group">
                                                        <summary className="cursor-pointer text-xs font-medium text-purple-600 hover:underline">
                                                            View Full API Response
                                                        </summary>
                                                        <div className="mt-2 bg-purple-50 dark:bg-purple-950 p-2 rounded text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto border border-purple-200">
                                                            {call.fullApiResponse}
                                                        </div>
                                                    </details>
                                                )}

                                                {call.error && (
                                                    <div className="text-xs text-destructive p-2 bg-destructive/10 rounded">
                                                        {call.error}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {result.error ? (
                                    <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>{result.error}</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-2">
                                        {selectedTypes.includes("mcq") && (
                                            <div className="text-sm">
                                                <span className="font-medium">MCQs:</span> {result.mcqCount || 0}
                                            </div>
                                        )}
                                        {selectedTypes.includes("fillBlanks") && (
                                            <div className="text-sm">
                                                <span className="font-medium">Fill Blanks:</span> {result.fillBlanksCount || 0}
                                            </div>
                                        )}
                                        {selectedTypes.includes("solutions") && (
                                            <div className="text-sm">
                                                <span className="font-medium">Solutions:</span> {result.solutionsCount || 0}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
