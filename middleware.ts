
import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isDashboard = req.nextUrl.pathname.startsWith("/dashboard")
    const isHome = req.nextUrl.pathname === "/"
    const isLogin = req.nextUrl.pathname === "/login"

    const adminEmails = process.env.ADMIN_EMAILS?.split(";") || []
    const userEmail = req.auth?.user?.email
    const isLoggedIn = !!req.auth
    const isAdmin = userEmail && adminEmails.includes(userEmail)

    // Login Page Redirect for Authenticated Users
    if (isLogin && isLoggedIn) {
        if (isAdmin) {
            return NextResponse.redirect(new URL("/dashboard", req.url))
        } else {
            return NextResponse.redirect(new URL("/", req.url))
        }
    }

    // Protected Dashboard Routes
    if (isDashboard) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/login", req.url))
        }
        if (!isAdmin) {
            return NextResponse.redirect(new URL("/", req.url))
        }
    }

    // Admin Redirection from Home
    if (isHome && isAdmin) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
    }
})

export const config = {
    matcher: ["/dashboard/:path*", "/", "/login"],
}
