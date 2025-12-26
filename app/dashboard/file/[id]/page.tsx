import { auth } from "@/auth"
import { getFile } from "@/app/actions/dashboard"
import { redirect } from "next/navigation"
import { FileEditor } from "@/components/dashboard/file-editor"

export default async function FilePage({
    params
}: {
    params: { id: string }
}) {
    const session = await auth()
    if (!session) redirect("/login")

    const { id } = await params
    const file = await getFile(id)

    if (!file) {
        return <div className="p-8">File not found</div>
    }

    return (
        <FileEditor file={file} subjectId={file.subjectId} />
    )
}
