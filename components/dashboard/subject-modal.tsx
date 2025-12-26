"use client"

import { useState } from "react"
import { createSubject } from "@/app/actions/dashboard"
import {
    Folder, Book, Calculator, FlaskConical, Globe,
    Music, Laptop, Palette, Dumbbell, Gavel,
    Plus, X, Loader2
} from "lucide-react"
import { toast } from "sonner"

const ICONS = [
    { name: "Folder", icon: Folder },
    { name: "Book", icon: Book },
    { name: "Calculator", icon: Calculator },
    { name: "Science", icon: FlaskConical },
    { name: "Globe", icon: Globe },
    { name: "Music", icon: Music },
    { name: "Laptop", icon: Laptop },
    { name: "Art", icon: Palette },
    { name: "Sports", icon: Dumbbell },
    { name: "Law", icon: Gavel },
]

const COLORS = [
    { name: "Blue", value: "bg-blue-500", border: "border-blue-500", text: "text-blue-500" },
    { name: "Red", value: "bg-red-500", border: "border-red-500", text: "text-red-500" },
    { name: "Green", value: "bg-green-500", border: "border-green-500", text: "text-green-500" },
    { name: "Yellow", value: "bg-yellow-500", border: "border-yellow-500", text: "text-yellow-500" },
    { name: "Purple", value: "bg-purple-500", border: "border-purple-500", text: "text-purple-500" },
    { name: "Pink", value: "bg-pink-500", border: "border-pink-500", text: "text-pink-500" },
    { name: "Orange", value: "bg-orange-500", border: "border-orange-500", text: "text-orange-500" },
    { name: "Cyan", value: "bg-cyan-500", border: "border-cyan-500", text: "text-cyan-500" }
]

export function SubjectModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [title, setTitle] = useState("")
    const [selectedIcon, setSelectedIcon] = useState("Folder")
    const [selectedColor, setSelectedColor] = useState("bg-blue-500")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const result = await createSubject(title, selectedColor, selectedIcon)
            if (result.error) {
                toast.error("Failed to create subject", {
                    description: result.error
                })
            } else {
                toast.success("Subject created!", {
                    description: `"${title}" has been added successfully.`
                })
                setIsOpen(false)
                setTitle("")
                setSelectedIcon("Folder")
                setSelectedColor("bg-blue-500")
            }
        } catch (error) {
            toast.error("Something went wrong", {
                description: "Please try again later."
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
                <Plus className="mr-2 h-4 w-4" />
                Add Subject
            </button>
        )
    }

    const SelectedIconComponent = ICONS.find(i => i.name === selectedIcon)?.icon || Folder

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-background rounded-lg shadow-lg border p-6 space-y-6 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Create New Subject</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="rounded-full p-2 hover:bg-accent transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Subject Name</label>
                        <input
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Advanced Calculus"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Icon</label>
                        <div className="grid grid-cols-5 gap-2">
                            {ICONS.map(({ name, icon: Icon }) => (
                                <button
                                    key={name}
                                    type="button"
                                    onClick={() => setSelectedIcon(name)}
                                    className={`flex items-center justify-center p-2 rounded-md border transition-all hover:bg-accent ${selectedIcon === name
                                        ? "border-primary bg-accent ring-2 ring-primary ring-offset-2"
                                        : "border-input"
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Color</label>
                        <div className="grid grid-cols-8 gap-2">
                            {COLORS.map(({ name, value }) => (
                                <button
                                    key={name}
                                    type="button"
                                    onClick={() => setSelectedColor(value)}
                                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${value} ${selectedColor === value
                                        ? "ring-2 ring-offset-2 ring-primary scale-110"
                                        : ""
                                        }`}
                                    title={name}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
