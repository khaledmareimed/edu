import NextAuth from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import Google from "next-auth/providers/google"
import clientPromise from "@/lib/mongodb"
import { authConfig } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: MongoDBAdapter(clientPromise),
    ...authConfig,
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub!
                session.user.email = token.email!
                session.user.name = token.name!
                session.user.image = token.picture!
            }
            return session
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
    },
})
