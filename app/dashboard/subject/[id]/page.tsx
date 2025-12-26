import { auth } from "@/auth"
import { getFiles, createFile, getSubject } from "@/app/actions/dashboard"
import Link from "next/link"
import { FileText, Plus, ArrowLeft } from "lucide-react"
import { redirect } from "next/navigation"
import { FileCard } from "@/components/dashboard/file-card"

export default async function SubjectPage({
    params
}: {
    params: { id: string }
}) {
    const session = await auth()
    if (!session) redirect("/login")

    const { id } = await params

    const subject = await getSubject(id)
    if (!subject) return <div className="p-8">Subject not found</div>

    const files = await getFiles(id)

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9 self-start"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h1 className="text-2xl font-bold tracking-tight">
                        <span className="text-muted-foreground font-normal text-lg">Subject / </span>
                        {subject.title}
                    </h1>
                    <form
                        action={async (formData) => {
                            "use server"
                            const title = formData.get("title") as string
                            await createFile(id, title)
                        }}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto"
                    >
                        <input
                            name="title"
                            placeholder="New File Name"
                            required
                            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 whitespace-nowrap"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add File
                        </button>
                    </form>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {files.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg border-dashed">
                        No files yet. Add one to start writing.
                    </div>
                ) : (
                    files.map((file) => (
                        <FileCard
                            key={file._id}
                            file={file}
                            subjectId={id}
                        />
                    ))
                )}
            </div>
        </div>
    )
}
