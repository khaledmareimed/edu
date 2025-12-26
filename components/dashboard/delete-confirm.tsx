"use client"

import { useState } from "react"
import { Trash2, Loader2, AlertTriangle } from "lucide-react"

interface DeleteConfirmProps {
    itemName: string
    itemType: "subject" | "file"
    onConfirm: () => Promise<void>
    trigger?: React.ReactNode
}

export function DeleteConfirm({ itemName, itemType, onConfirm, trigger }: DeleteConfirmProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await onConfirm()
            setIsOpen(false)
        } catch (e) {
            alert("Failed to delete")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <>
            <div onClick={() => setIsOpen(true)}>
                {trigger || (
                    <button className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors">
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-background rounded-lg shadow-lg border p-6 space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-semibold">Delete {itemType}?</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Are you sure you want to delete <span className="font-medium text-foreground">"{itemName}"</span>?
                                    {itemType === "subject" && " This will also delete all files within this subject."}
                                    {" "}This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => setIsOpen(false)}
                                disabled={isDeleting}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-4"
                            >
                                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
