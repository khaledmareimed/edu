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
    // #region agent log
    const fs = await import('fs'); fs.appendFileSync('/teamspace/studios/this_studio/edu/.cursor/debug.log', JSON.stringify({location:'file-page.tsx:13',message:'Auth check',data:{hasSession:!!session,userEmail:session?.user?.email},timestamp:Date.now(),sessionId:'debug-session',runId:'mobile-debug',hypothesisId:'H2'})+'\n');
    // #endregion
    if (!session) redirect("/login")

    const { id } = await params
    // #region agent log
    fs.appendFileSync('/teamspace/studios/this_studio/edu/.cursor/debug.log', JSON.stringify({location:'file-page.tsx:19',message:'Params parsed',data:{fileId:id,idType:typeof id,idLength:id?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'mobile-debug',hypothesisId:'H1'})+'\n');
    // #endregion
    const file = await getFile(id)
    // #region agent log
    fs.appendFileSync('/teamspace/studios/this_studio/edu/.cursor/debug.log', JSON.stringify({location:'file-page.tsx:23',message:'File fetch result',data:{fileIsNull:file===null,fileIsUndefined:file===undefined,fileId:file?._id,fileHasContent:file?.content?.length>0},timestamp:Date.now(),sessionId:'debug-session',runId:'mobile-debug',hypothesisId:'H3,H5'})+'\n');
    // #endregion

    if (!file) {
        return <div className="p-8">File not found</div>
    }

    return (
        <FileEditor file={file} subjectId={file.subjectId} />
    )
}
