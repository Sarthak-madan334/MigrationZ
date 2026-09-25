"use client";

import { ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { LiveLogPanel } from "@/components/LiveLogPanel";
import { PipelineStages } from "@/components/PipelineStages";
import { getRunStatus, type RunStage, type RunStatus } from "@/lib/api";

const fallbackLogs = [{ ts: "--:--:--", level: "info" as const, message: "Waiting for the orchestration stream..." }];
export default function RunPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	return <RunContent id={id} />;
}

function RunContent({ id }: { id: string }) {
	const [status, setStatus] = useState<RunStatus>({ run_id: id, stage: "queued", log: fallbackLogs, progress_pct: 0 });
	const [error, setError] = useState(false);
	useEffect(() => { let active = true; const poll = async () => { try { const next = await getRunStatus(id); if (active) { setStatus(next); setError(false); } } catch { if (active) setError(true); } }; poll(); const timer = window.setInterval(poll, 1800); return () => { active = false; window.clearInterval(timer); }; }, [id]);
	const visibleStage: RunStage = error ? "queued" : status.stage;
	const log = error ? [{ ts: "now", level: "warn" as const, message: "Run status is not available from the Phase 0 backend yet." }] : status.log;
	return <main className="shell"><header className="mb-14 flex items-center justify-between"><Link className="flex items-center gap-3 font-display text-sm font-semibold tracking-wide" href="/"><span className="flex h-8 w-8 items-center justify-center border border-focus text-focus"><span className="h-2 w-2 bg-signal" /></span> MIGRATION REHEARSAL</Link><div className="font-mono text-xs text-muted">RUN / {id.slice(0, 8)}</div></header><div className="mb-10 flex items-end justify-between gap-5"><div><div className="eyebrow mb-4">Live rehearsal run</div><h1 className="font-display text-4xl tracking-[-0.03em]">Watching the migration under pressure.</h1><p className="mt-3 text-muted">The pipeline records each state change. The verdict comes after the workload finishes.</p></div><div className="hidden text-right md:block"><div className="font-mono text-3xl text-mono">{status.progress_pct}%</div><div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">pipeline progress</div></div></div><div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"><section className="panel p-7"><div className="mb-8 flex items-center justify-between border-b border-border pb-5"><div className="font-mono text-xs uppercase tracking-[0.14em] text-muted">Execution pipeline</div><RefreshCw className={error ? "text-warn" : "animate-spin text-focus"} size={15} /></div><PipelineStages stage={visibleStage} /></section><LiveLogPanel lines={log} /></div>{status.stage === "done" ? <div className="mt-8 flex justify-end"><Link className="button-primary" href={`/run/${id}/report`}>Open results <ArrowRight size={16} /></Link></div> : null}</main>;
}
