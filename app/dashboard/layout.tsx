import { auth } from "@/auth"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardFooter } from "@/components/dashboard/footer"
import { redirect } from "next/navigation"
import { Toaster } from "sonner"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    return (
        <div className="flex min-h-screen flex-col">
            <DashboardHeader user={session.user} />
            <main className="flex-1 container px-4 md:px-6 lg:px-8 py-6 md:py-8">
                {children}
            </main>
            <DashboardFooter />
            <Toaster richColors position="bottom-right" />
        </div>
    )
}
