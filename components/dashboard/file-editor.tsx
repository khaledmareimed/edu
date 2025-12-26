"use client"

import { updateFile } from "@/app/actions/dashboard"
import { useState, useRef } from "react"
import { Save, Loader2, ArrowLeft, Upload, FileText, Download } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ExamTypeModal } from "./exam-type-modal"

export function FileEditor({
    file,
    subjectId
}: {
    file: any
    subjectId: string
}) {
    const [content, setContent] = useState(file.content || "")
    const [isSaving, setIsSaving] = useState(false)
    const [isExtracting, setIsExtracting] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [isExamModalOpen, setIsExamModalOpen] = useState(false)
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const result = await updateFile(file._id, content)
            if (result.error) {
                toast.error("Failed to save", {
                    description: result.error
                })
            } else {
                setLastSaved(new Date())
                toast.success("Saved successfully!", {
                    description: "Your changes have been saved."
                })
                router.refresh()
            }
        } catch (e) {
            toast.error("Failed to save", {
                description: "Please try again."
            })
        } finally {
            setIsSaving(false)
        }
    }

    const extractTextFromPDF = async (file: File): Promise<string> => {
        // Dynamically import PDF.js only when needed (client-side only)
        const pdfjsLib = await import("pdfjs-dist")

        // Set worker path to use our local copy (no CORS issues)
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

        let fullText = ""

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(" ")
            fullText += pageText + "\n\n"
        }

        return fullText.trim()
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        if (selectedFile.type !== "application/pdf") {
            alert("Please upload a PDF file")
            return
        }

        setIsExtracting(true)
        try {
            const extractedText = await extractTextFromPDF(selectedFile)
            setContent(extractedText)
        } catch (error) {
            console.error("Error extracting PDF:", error)
            alert("Failed to extract text from PDF. Please try another file.")
        } finally {
            setIsExtracting(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    const handleDownloadPdf = async () => {
        setIsDownloadingPdf(true)
        const toastId = toast.loading("Generating PDF...", {
            description: "Creating your exam document"
        })

        try {
            const response = await fetch("/api/export-exam-pdf", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fileId: file._id
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate PDF")
            }

            // Open PDF in new tab
            window.open(data.pdfUrl, '_blank')

            toast.success("PDF generated successfully!", {
                id: toastId,
                description: `${data.pages} page(s), ${Math.round(data.size / 1024)}KB`
            })
        } catch (error: any) {
            console.error("Error generating PDF:", error)
            toast.error("Failed to generate PDF", {
                id: toastId,
                description: error.message || "Please try again later"
            })
        } finally {
            setIsDownloadingPdf(false)
        }
    }

    // Show upload UI when content is empty
    if (content === "" && !isExtracting) {
        return (
            <div className="flex flex-col h-[calc(100vh-10rem)] gap-4">
                <div className="flex items-center gap-4 border-b pb-4">
                    <Link
                        href={`/dashboard/subject/${subjectId}`}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <h1 className="text-xl font-bold">{file.title}</h1>
                </div>

                <div className="flex-1 flex items-center justify-center">
                    <div className="max-w-md w-full space-y-6 text-center">
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <FileText className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">Empty File</h2>
                            <p className="text-sm text-muted-foreground mt-2">
                                Upload a PDF to extract its text, or start typing below.
                            </p>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="pdf-upload"
                        />

                        <div className="flex flex-col gap-3">
                            <label
                                htmlFor="pdf-upload"
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 cursor-pointer"
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Upload PDF
                            </label>

                            <button
                                onClick={() => setContent(" ")}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                or start typing manually
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Show loading state while extracting
    if (isExtracting) {
        return (
            <div className="flex flex-col h-[calc(100vh-10rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Extracting text from PDF...</p>
            </div>
        )
    }

    // Normal editor view
    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] gap-4">
            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/dashboard/subject/${subjectId}`}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold">{file.title}</h1>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                                {lastSaved
                                    ? `Saved at ${lastSaved.toLocaleTimeString()}`
                                    : "Unsaved changes"}
                            </span>
                            <span className="text-primary font-medium">
                                {content.trim() === ""
                                    ? "0 paragraphs"
                                    : `${content.trim().split(/\n\s*\n/).filter((p: string) => p.trim().length > 0).length} paragraphs`}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {content.trim() !== "" && (
                        <>
                            <button
                                onClick={() => {
                                    toast.info("Feature Coming Soon", {
                                        description: "Create slides from your content"
                                    })
                                }}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                Create Slides
                            </button>
                            <button
                                onClick={() => setIsExamModalOpen(true)}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                Create Exam
                            </button>
                            <button
                                onClick={() => {
                                    toast.info("Feature Coming Soon", {
                                        description: "Generate flash cards from your content"
                                    })
                                }}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                Create Flash Cards
                            </button>
                            {file.exams && (file.exams.mcqs?.length > 0 || file.exams.fillBlanks?.length > 0 || file.exams.solutions?.length > 0) && (
                                <button
                                    onClick={handleDownloadPdf}
                                    disabled={isDownloadingPdf}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDownloadingPdf ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="mr-2 h-4 w-4" />
                                            Download PDF
                                        </>
                                    )}
                                </button>
                            )}
                        </>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 min-w-[100px]"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save
                            </>
                        )}
                    </button>
                </div>
            </div>

            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 w-full p-4 rounded-md border bg-background font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Start typing your content here..."
                spellCheck={false}
            />

            <ExamTypeModal
                isOpen={isExamModalOpen}
                onClose={() => setIsExamModalOpen(false)}
                fileId={file._id}
                content={content}
            />
        </div>
    )
}
