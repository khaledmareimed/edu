"use client"

import Link from "next/link"
import { Brain, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

export function DashboardHeader({ user }: { user: any }) {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center px-4 md:px-6">
                <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
                    <Brain className="h-6 w-6" />
                    <span className="hidden font-bold sm:inline-block">AI Edu Admin</span>
                </Link>
                <div className="flex flex-1 items-center justify-end space-x-4">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-muted-foreground">
                            {user?.email}
                        </span>
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="text-sm font-medium text-red-500 transition-colors hover:text-red-600 flex items-center"
                        >
                            <LogOut className="h-4 w-4 mr-1" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}
