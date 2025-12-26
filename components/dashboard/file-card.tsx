"use client"

import Link from "next/link"
import { FileText, Trash2 } from "lucide-react"
import { DeleteConfirm } from "./delete-confirm"
import { deleteFile } from "@/app/actions/dashboard"
import { toast } from "sonner"

interface FileCardProps {
    file: any
    subjectId: string
}

export function FileCard({ file, subjectId }: FileCardProps) {
    return (
        <div className="group relative flex flex-col gap-2 rounded-lg border p-4 bg-card text-card-foreground shadow-sm hover:shadow-md transition-all hover:border-primary/50">
            <Link
                href={`/dashboard/file/${file._id}`}
                className="flex-1"
            >
                <div className="flex items-center gap-2">
                    <FileText className="h-8 w-8 text-primary/80 flex-shrink-0" />
                    <div className="flex-1 truncate font-semibold">
                        {file.title}
                    </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2 truncate">
                    {file.content ? "Contains content" : "Empty file"}
                </div>
            </Link>

            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DeleteConfirm
                    itemName={file.title}
                    itemType="file"
                    onConfirm={async () => {
                        await deleteFile(file._id, subjectId)
                        toast.success("File deleted", {
                            description: `"${file.title}" has been removed.`
                        })
                    }}
                    trigger={
                        <button className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    }
                />
            </div>
        </div>
    )
}
