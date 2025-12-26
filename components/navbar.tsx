"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { Moon, Sun, Brain, LogOut, User as UserIcon } from "lucide-react"
import { useState, useEffect } from "react"
import type { User } from "next-auth"
import { signOut } from "next-auth/react"

interface NavbarProps {
    user?: User
}

export function Navbar({ user }: NavbarProps) {
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center px-4 md:px-6">
                <Link href="/" className="mr-6 flex items-center space-x-2">
                    <Brain className="h-6 w-6" />
                    <span className="hidden font-bold sm:inline-block">AI Edu</span>
                </Link>
                <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
                    <Link href="/courses" className="transition-colors hover:text-foreground/80 text-foreground/60">
                        Courses
                    </Link>
                    <Link href="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">
                        About
                    </Link>
                </nav>
                <div className="flex items-center space-x-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                {user.image ? (
                                    <img src={user.image} alt={user.name || "User"} className="h-8 w-8 rounded-full" />
                                ) : (
                                    <UserIcon className="h-8 w-8 p-1 rounded-full border" />
                                )}
                                <span className="text-sm font-medium hidden sm:inline-block">{user.name}</span>
                            </div>
                            <button
                                onClick={() => signOut()}
                                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center"
                            >
                                <LogOut className="h-4 w-4 mr-1" />
                                Logout
                            </button>
                        </div>
                    ) : (
                        <nav className="flex items-center space-x-1">
                            <Link
                                href="/login"
                                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Login
                            </Link>
                        </nav>
                    )}
                    <div className="flex items-center space-x-2">
                        {mounted && (
                            <button
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
                            >
                                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                <span className="sr-only">Toggle theme</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
