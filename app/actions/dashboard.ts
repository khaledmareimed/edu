"use server"

import clientPromise from "@/lib/mongodb"
import { auth } from "@/auth"
import { ObjectId } from "mongodb"
import { revalidatePath } from "next/cache"
import type { Subject, File } from "@/types/dashboard"

const DB_NAME = "edu_app"
// Using different collection names to avoid conflict with Auth.js collections if any
const SUBJECT_COLLECTION = "subjects"
const FILE_COLLECTION = "files"

async function getDb() {
    const client = await clientPromise
    return client.db(DB_NAME)
}

async function getUser() {
    const session = await auth()
    if (!session?.user?.email) {
        throw new Error("Unauthorized")
    }
    return session.user
}

// --- Subjects ---

export async function getSubjects(): Promise<Subject[]> {
    try {
        const user = await getUser()
        const db = await getDb()
        const subjects = await db
            .collection(SUBJECT_COLLECTION)
            .find({ userEmail: user.email })
            .toArray()

        return subjects.map(sub => ({
            _id: sub._id.toString(),
            title: sub.title as string,
            color: sub.color as string,
            icon: sub.icon as string,
            userEmail: sub.userEmail as string,
            createdAt: sub.createdAt as Date
        }))
    } catch (e) {
        console.error(e)
        return []
    }
}

export async function createSubject(title: string, color: string = "bg-blue-500", icon: string = "Folder") {
    try {
        const user = await getUser()
        if (!title) return { error: "Title is required" }

        const db = await getDb()
        const result = await db.collection(SUBJECT_COLLECTION).insertOne({
            title,
            color,
            icon,
            userEmail: user.email,
            createdAt: new Date()
        })

        console.log(`✅ Subject created: ${title} (${icon}, ${color}) for ${user.email}`)
        console.log(`   MongoDB ID: ${result.insertedId}`)

        revalidatePath("/dashboard")
        return { success: true }
    } catch (e) {
        console.error("❌ Failed to create subject:", e)
        return { error: "Failed to create subject" }
    }
}

export async function deleteSubject(id: string) {
    try {
        const user = await getUser()
        const db = await getDb()

        await db.collection(SUBJECT_COLLECTION).deleteOne({
            _id: new ObjectId(id),
            userEmail: user.email
        })

        // Also delete associated files
        await db.collection(FILE_COLLECTION).deleteMany({
            subjectId: id,
            userEmail: user.email
        })

        revalidatePath("/dashboard")
        return { success: true }
    } catch (e) {
        return { error: "Failed to delete subject" }
    }
}

// --- Files ---

export async function getSubject(id: string): Promise<Subject | null> {
    try {
        const user = await getUser()
        const db = await getDb()
        const subject = await db.collection(SUBJECT_COLLECTION).findOne({
            _id: new ObjectId(id),
            userEmail: user.email
        })

        if (!subject) return null

        return {
            _id: subject._id.toString(),
            title: subject.title as string,
            color: subject.color as string,
            icon: subject.icon as string,
            userEmail: subject.userEmail as string,
            createdAt: subject.createdAt as Date
        }
    } catch (e) {
        return null
    }
}

export async function getFiles(subjectId: string): Promise<File[]> {
    try {
        const user = await getUser()
        const db = await getDb()
        const files = await db
            .collection(FILE_COLLECTION)
            .find({
                subjectId,
                userEmail: user.email
            })
            .toArray()

        return files.map(file => ({
            _id: file._id.toString(),
            title: file.title as string,
            content: file.content as string,
            subjectId: file.subjectId as string,
            userEmail: file.userEmail as string,
            createdAt: file.createdAt as Date,
            updatedAt: file.updatedAt as Date | undefined
        }))
    } catch (e) {
        return []
    }
}

export async function createFile(subjectId: string, title: string) {
    try {
        const user = await getUser()
        if (!title) return { error: "Title is required" }

        const db = await getDb()
        await db.collection(FILE_COLLECTION).insertOne({
            title,
            subjectId,
            content: "", // Empty initially
            userEmail: user.email,
            createdAt: new Date()
        })
        revalidatePath(`/dashboard/subject/${subjectId}`)
        return { success: true }
    } catch (e) {
        return { error: "Failed to create file" }
    }
}

export async function deleteFile(id: string, subjectId: string) {
    try {
        const user = await getUser()
        const db = await getDb()

        await db.collection(FILE_COLLECTION).deleteOne({
            _id: new ObjectId(id),
            userEmail: user.email
        })

        console.log(`🗑️ File deleted: ${id} for ${user.email}`)
        revalidatePath(`/dashboard/subject/${subjectId}`)
        return { success: true }
    } catch (e) {
        console.error("❌ Failed to delete file:", e)
        return { error: "Failed to delete file" }
    }
}

export async function getFile(id: string): Promise<File | null> {
    try {
        const user = await getUser()
        const db = await getDb()
        const file = await db.collection(FILE_COLLECTION).findOne({
            _id: new ObjectId(id),
            userEmail: user.email
        })

        if (!file) return null

        return {
            _id: file._id.toString(),
            title: file.title as string,
            content: file.content as string,
            subjectId: file.subjectId as string,
            userEmail: file.userEmail as string,
            createdAt: file.createdAt as Date,
            updatedAt: file.updatedAt as Date | undefined
        }
    } catch (e) {
        return null
    }
}

export async function updateFile(id: string, content: string) {
    try {
        const user = await getUser()
        const db = await getDb()

        await db.collection(FILE_COLLECTION).updateOne(
            {
                _id: new ObjectId(id),
                userEmail: user.email
            },
            { $set: { content, updatedAt: new Date() } }
        )

        const file = await db.collection(FILE_COLLECTION).findOne({ _id: new ObjectId(id) })
        if (file) {
            revalidatePath(`/dashboard/file/${id}`)
            // Also revalidate the subject page if needed, but not strictly necessary for content
        }

        return { success: true }
    } catch (e) {
        return { error: "Failed to save file" }
    }
}
