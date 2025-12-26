import { Brain, Cpu, Globe } from "lucide-react"

export function Features() {
    return (
        <section className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24 px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl font-bold">
                    Features
                </h2>
                <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                    Our platform provides everything you need to master artificial intelligence concepts.
                </p>
            </div>
            <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
                <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                    <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                        <Brain className="h-12 w-12 text-primary" />
                        <div className="space-y-2">
                            <h3 className="font-bold">Interactive AI</h3>
                            <p className="text-sm text-muted-foreground">
                                Run models directly in your browser with our optimized engine.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                    <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                        <Cpu className="h-12 w-12 text-primary" />
                        <div className="space-y-2">
                            <h3 className="font-bold">Real-time Feedback</h3>
                            <p className="text-sm text-muted-foreground">
                                Get instant analysis of your code and model parameters.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                    <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                        <Globe className="h-12 w-12 text-primary" />
                        <div className="space-y-2">
                            <h3 className="font-bold">Global Community</h3>
                            <p className="text-sm text-muted-foreground">
                                Connect with learners and experts from around the world.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
