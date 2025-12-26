import { auth } from "@/auth"
import { getSubjects } from "@/app/actions/dashboard"
import { Folder } from "lucide-react"
import { redirect } from "next/navigation"
import { SubjectModal } from "@/components/dashboard/subject-modal"
import { SubjectCard } from "@/components/dashboard/subject-card"

export default async function DashboardPage() {
    const session = await auth()
    if (!session) redirect("/login")

    const subjects = await getSubjects()

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Your Subjects</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your courses and study materials.
                    </p>
                </div>
                <SubjectModal />
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {subjects.length === 0 ? (
                    <div className="col-span-full py-16 text-center border-2 border-dashed rounded-xl bg-card/50">
                        <div className="mx-auto w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-4">
                            <Folder className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">No subjects yet</h3>
                        <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
                            Get started by creating your first subject to organize your notes and files.
                        </p>
                    </div>
                ) : (
                    subjects.map((subject) => (
                        <SubjectCard
                            key={subject._id}
                            subject={subject}
                        />
                    ))
                )}
            </div>
        </div>
    )
}
