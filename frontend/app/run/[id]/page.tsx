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
	const [refreshing, setRefreshing] = useState(false);

	async function refreshStatus() {
		setRefreshing(true);
		try {
			const next = await getRunStatus(id);
			setStatus(next);
			setError(false);
		} catch {
			setError(true);
		} finally {
			window.setTimeout(() => setRefreshing(false), 400);
		}
	}

	useEffect(() => {
		let active = true;
		const poll = async () => {
			try {
				const next = await getRunStatus(id);
				if (active) {
					setStatus(next);
					setError(false);
				}
			} catch {
				if (active) setError(true);
			}
		};
		poll();
		const timer = window.setInterval(poll, 1800);
		return () => {
			active = false;
			window.clearInterval(timer);
		};
	}, [id]);

	const visibleStage: RunStage = error ? "queued" : status.stage;
	const log = error ? [{ ts: "now", level: "warn" as const, message: "Run status is not available from the Phase 0 backend yet." }] : status.log;
	const progressValue = Math.min(Math.max(status.progress_pct ?? 0, 0), 100);

	return (
		<main className="run-shell">
			<header className="run-header">
				<Link className="brand-link" href="/">
					<span className="brand-mark" aria-hidden="true">
						<svg viewBox="0 0 80 80" role="img">
							<g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
								<path d="M40 8v64M8 40h64M18 18l44 44M18 62l44-44" strokeWidth="4.5" opacity="0.9" />
								<circle cx="40" cy="40" r="11" strokeWidth="3" opacity="0.8" />
							</g>
						</svg>
					</span>
					<span className="brand-text">MIGRATION REHEARSAL</span>
				</Link>
				<div className="run-id">RUN / {id.slice(0, 8)}</div>
			</header>

			<div className="run-headline-row">
				<div>
					<div className="eyebrow">Live rehearsal run</div>
					<h1 className="run-title">Watching the migration under pressure.</h1>
					<p className="run-subtitle">The pipeline records each state change. The verdict comes after the workload finishes.</p>
				</div>
				<div className="progress-summary" aria-live="polite">
					<div className="progress-ring" style={{ background: `conic-gradient(var(--accent-focus) ${progressValue * 3.6}deg, rgba(148, 163, 184, 0.18) 0deg)` }}>
						<span>{progressValue}%</span>
					</div>
					<div className="progress-copy">
						<div className="progress-label">Pipeline progress</div>
						<div className="progress-meta">{error ? "Awaiting backend signal" : "Live status stream"}</div>
					</div>
				</div>
			</div>

			<div className="run-panels">
				<section className="panel run-panel pipeline-panel">
					<div className="panel-head">
						<div className="panel-kicker">Execution pipeline</div>
						<button
							type="button"
							className="refresh-button"
							title="Refresh pipeline status"
							onClick={refreshStatus}
							aria-label="Refresh pipeline status"
						>
							<RefreshCw className={refreshing ? "spin-refresh" : ""} size={15} />
						</button>
					</div>
					<PipelineStages stage={visibleStage} />
				</section>
				<LiveLogPanel lines={log} />
			</div>

			{status.stage === "done" ? (
				<div className="run-footer">
					<Link className="button-primary" href={`/run/${id}/report`}>
						Open results <ArrowRight size={16} />
					</Link>
				</div>
			) : null}
		</main>
	);
}
