"use client"

import { useState } from "react"
import { X, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ExamTypeModalProps {
    isOpen: boolean
    onClose: () => void
    fileId: string
    content: string
}

const EXAM_TYPES = [
    { id: "mcq", label: "Multiple Choice Questions (MCQ)", description: "Questions with multiple options" },
    { id: "fillBlanks", label: "Fill in the Blanks", description: "Complete missing words or phrases" },
    { id: "solutions", label: "Solving Solutions", description: "Step-by-step problem solving" },
]

export function ExamTypeModal({ isOpen, onClose, fileId, content }: ExamTypeModalProps) {
    const [selectedTypes, setSelectedTypes] = useState<string[]>([])
    const [isGenerating, setIsGenerating] = useState(false)

    const toggleType = (typeId: string) => {
        setSelectedTypes(prev =>
            prev.includes(typeId)
                ? prev.filter(id => id !== typeId)
                : [...prev, typeId]
        )
    }

    const handleGenerate = async () => {
        if (selectedTypes.length === 0) {
            toast.error("No exam type selected", {
                description: "Please select at least one exam type"
            })
            return
        }

        if (!content || content.trim().length === 0) {
            toast.error("No content", {
                description: "The file has no content to generate questions from"
            })
            return
        }

        setIsGenerating(true)
        const toastId = toast.loading("Starting exam generation...", {
            description: "Initializing AI processing"
        })

        try {
            const response = await fetch("/api/generate-exam", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fileId,
                    examTypes: selectedTypes
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to start exam generation")
            }

            toast.success("Exam generation started!", {
                id: toastId,
                description: "AI is generating questions in the background. This may take a few minutes. You can close this page - generation will continue.",
                duration: 6000
            })

            onClose()
            setSelectedTypes([])
        } catch (error: any) {
            console.error("Error starting exam generation:", error)
            toast.error("Failed to start exam generation", {
                id: toastId,
                description: error.message || "Please try again later"
            })
        } finally {
            setIsGenerating(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-background rounded-lg shadow-lg border p-6 space-y-6 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Create Exam</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Select one or more exam types to generate
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isGenerating}
                        className="rounded-full p-2 hover:bg-accent transition-colors disabled:opacity-50"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="space-y-3">
                    {EXAM_TYPES.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => toggleType(type.id)}
                            disabled={isGenerating}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all disabled:opacity-50 ${selectedTypes.includes(type.id)
                                ? "border-primary bg-primary/5"
                                : "border-input hover:border-primary/50 hover:bg-accent/50"
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${selectedTypes.includes(type.id)
                                    ? "border-primary bg-primary"
                                    : "border-input"
                                    }`}>
                                    {selectedTypes.includes(type.id) && (
                                        <Check className="h-3 w-3 text-primary-foreground" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium">{type.label}</div>
                                    <div className="text-sm text-muted-foreground mt-0.5">
                                        {type.description}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                    <button
                        onClick={onClose}
                        disabled={isGenerating}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 disabled:opacity-50"
                    >
                        {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isGenerating ? "Generating..." : "Generate Exam"}
                    </button>
                </div>
            </div>
        </div>
    )
}
