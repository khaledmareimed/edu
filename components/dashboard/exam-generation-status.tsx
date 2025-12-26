"use client"

import { ExamGeneration } from "@/types/dashboard"
import { CheckCircle2, XCircle, Loader2, Clock, AlertCircle } from "lucide-react"

interface ExamGenerationStatusProps {
    examGeneration?: ExamGeneration
}

function formatTimeAgo(date: Date): string {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)
    
    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return new Date(date).toLocaleDateString()
}

export function ExamGenerationStatus({ examGeneration }: ExamGenerationStatusProps) {
    // #region agent log
    fetch('http://localhost:7242/ingest/6d091984-4bbd-46fb-90d3-336c16b7e90a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'exam-generation-status.tsx:23',message:'Function entry - examGeneration param',data:{examGeneration:examGeneration,isNull:examGeneration===null,isUndefined:examGeneration===undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1,H2,H4'})}).catch(()=>{});
    // #endregion
    if (!examGeneration) return null

    const { status: rawStatus, chunksProcessed, totalChunks, error, startedAt, completedAt } = examGeneration
    // #region agent log
    fetch('http://localhost:7242/ingest/6d091984-4bbd-46fb-90d3-336c16b7e90a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'exam-generation-status.tsx:28',message:'After destructuring - status value',data:{status:rawStatus,statusType:typeof rawStatus,statusValue:JSON.stringify(rawStatus),chunksProcessed:chunksProcessed,totalChunks:totalChunks},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H1,H2,H3'})}).catch(()=>{});
    // #endregion

    // Normalize status values - map database statuses to component statuses
    const normalizeStatus = (status: string): "pending" | "processing" | "completed" | "failed" => {
        if (status === "generating") return "processing"
        if (["pending", "processing", "completed", "failed"].includes(status)) {
            return status as "pending" | "processing" | "completed" | "failed"
        }
        // Default to processing for unknown statuses to avoid crashes
        return "processing"
    }

    const status = normalizeStatus(rawStatus)
    // #region agent log
    fetch('http://localhost:7242/ingest/6d091984-4bbd-46fb-90d3-336c16b7e90a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'exam-generation-status.tsx:42',message:'After status normalization',data:{rawStatus:rawStatus,normalizedStatus:status},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion

    const statusConfig = {
        pending: {
            icon: Clock,
            label: "Pending",
            description: "Exam generation queued",
            color: "text-gray-500 dark:text-gray-400",
            bgColor: "bg-gray-100 dark:bg-gray-800",
            borderColor: "border-gray-200 dark:border-gray-700"
        },
        processing: {
            icon: Loader2,
            label: "Processing",
            description: `Processing chunks: ${chunksProcessed}/${totalChunks}`,
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-50 dark:bg-blue-950",
            borderColor: "border-blue-200 dark:border-blue-800"
        },
        completed: {
            icon: CheckCircle2,
            label: "Completed",
            description: `Successfully processed ${totalChunks} chunks`,
            color: "text-green-600 dark:text-green-400",
            bgColor: "bg-green-50 dark:bg-green-950",
            borderColor: "border-green-200 dark:border-green-800"
        },
        failed: {
            icon: XCircle,
            label: "Failed",
            description: error || "Exam generation failed",
            color: "text-red-600 dark:text-red-400",
            bgColor: "bg-red-50 dark:bg-red-950",
            borderColor: "border-red-200 dark:border-red-800"
        }
    }

    // #region agent log
    fetch('http://localhost:7242/ingest/6d091984-4bbd-46fb-90d3-336c16b7e90a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'exam-generation-status.tsx:64',message:'Before config lookup',data:{status:status,statusConfigKeys:Object.keys(statusConfig),hasKey:status in statusConfig},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1,H3'})}).catch(()=>{});
    // #endregion
    const config = statusConfig[status]
    // #region agent log
    fetch('http://localhost:7242/ingest/6d091984-4bbd-46fb-90d3-336c16b7e90a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'exam-generation-status.tsx:68',message:'After config lookup',data:{config:config,isUndefined:config===undefined,configKeys:config?Object.keys(config):null},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1,H2,H3'})}).catch(()=>{});
    // #endregion
    const Icon = config.icon
    const isProcessing = status === "processing"
    const progress = totalChunks > 0 ? (chunksProcessed / totalChunks) * 100 : 0

    return (
        <div className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-4 space-y-3`}>
            <div className="flex items-start gap-3">
                <Icon 
                    className={`h-5 w-5 ${config.color} ${isProcessing ? 'animate-spin' : ''} flex-shrink-0 mt-0.5`} 
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className={`text-sm font-semibold ${config.color}`}>
                            Exam Generation: {config.label}
                        </h3>
                        {startedAt && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                Started {formatTimeAgo(startedAt)}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {config.description}
                    </p>

                    {/* Progress bar for processing status */}
                    {isProcessing && totalChunks > 0 && (
                        <div className="mt-2">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                <div 
                                    className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {Math.round(progress)}% complete
                            </p>
                        </div>
                    )}

                    {/* Completion time */}
                    {completedAt && status === "completed" && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Completed {formatTimeAgo(completedAt)}
                        </p>
                    )}

                    {/* Error details */}
                    {error && status === "failed" && (
                        <div className="mt-2 flex items-start gap-2 text-xs bg-white dark:bg-gray-900 rounded p-2 border border-red-200 dark:border-red-800">
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <span className="text-red-700 dark:text-red-300">
                                {error}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

