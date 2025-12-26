"use client"

import Link from "next/link"
import {
    Folder, Book, Calculator, FlaskConical, Globe,
    Music, Laptop, Palette, Dumbbell, Gavel
} from "lucide-react"
import { DeleteConfirm } from "./delete-confirm"
import { deleteSubject } from "@/app/actions/dashboard"
import type { Subject } from "@/types/dashboard"
import { toast } from "sonner"

// Icon mapping
const ICON_MAP: Record<string, any> = {
    Folder, Book, Calculator,
    "Science": FlaskConical,
    Globe, Music, Laptop,
    "Art": Palette,
    "Sports": Dumbbell,
    "Law": Gavel
}

interface SubjectCardProps {
    subject: Subject
}

export function SubjectCard({ subject }: SubjectCardProps) {
    const colorClass = subject.color || "bg-blue-500"
    const Icon = ICON_MAP[subject.icon] || Folder

    return (
        <div className="group relative flex flex-col justify-between rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-all hover:scale-[1.02] duration-200">
            <Link
                href={`/dashboard/subject/${subject._id}`}
                className="p-6 flex-1 space-y-4"
            >
                <div className={`w-12 h-12 rounded-lg ${colorClass} bg-opacity-10 flex items-center justify-center`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg tracking-tight line-clamp-1">
                        {subject.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        View files &rarr;
                    </p>
                </div>
            </Link>

            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <DeleteConfirm
                    itemName={subject.title}
                    itemType="subject"
                    onConfirm={async () => {
                        await deleteSubject(subject._id)
                        toast.success("Subject deleted", {
                            description: `"${subject.title}" has been removed.`
                        })
                    }}
                />
            </div>

            {/* Decorative gradient strip at bottom */}
            <div className={`h-1.5 w-full rounded-b-xl ${colorClass} opacity-80`} />
        </div>
    )
}
