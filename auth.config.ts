import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    providers: [],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    trustHost: true,
} satisfies NextAuthConfig
