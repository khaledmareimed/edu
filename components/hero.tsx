import Link from "next/link"

export function Hero() {
    return (
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
            <div className="container mx-auto flex max-w-[64rem] flex-col items-center gap-4 text-center px-4 md:px-6">
                <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                    Master AI with <span className="text-primary">Interactive Lessons</span>
                </h1>
                <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                    Unlock the future of technology. Learn machine learning, neural networks, and prompt engineering through our hands-on educational platform.
                </p>
                <div className="space-x-4">
                    <Link
                        href="/login"
                        className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                        Get Started
                    </Link>

                </div>
            </div>
        </section>
    )
}
