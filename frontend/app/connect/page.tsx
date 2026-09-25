"use client";

import { ArrowRight, Check, FileCode2, Github, Upload, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { createRehearsal } from "@/lib/api";

export default function ConnectPage() {
	const [manifestReady, setManifestReady] = useState(false);
	const [starting, setStarting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function startRun() {
		setStarting(true);
		setError(null);
		try {
			const run = await createRehearsal();
			window.location.href = `/run/${run.run_id}`;
		} catch {
			setError("The backend did not accept the rehearsal request.");
			setStarting(false);
		}
	}

	return (
		<main className="connect-shell">
			<header className="connect-header">
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
				<div className="eyebrow eyebrow-inline">Connect / phase 01</div>
			</header>

			<div className="connect-intro">
				<div className="eyebrow">Ready the rehearsal</div>
				<h1 className="connect-title">Connect the change surface.</h1>
				<p className="connect-subtitle">Choose the repository, migration, and workload the shadow database should prove.</p>
			</div>

			<div className="connect-steps" aria-label="Rehearsal setup steps">
				<div className="connect-step is-complete" style={{ animationDelay: "0ms" }}>
					<div className="step-label"><Check size={14} /> 01 / CONNECT REPO</div>
					<div className="step-name">Repository connected</div>
					<div className="step-meta">Sarthak-madan334 / MRA</div>
				</div>
				<div className="connect-step is-active" style={{ animationDelay: "120ms" }}>
					<div className="step-label"><span className="step-dot" /> 02 / SELECT MIGRATION</div>
					<div className="step-name">phase0/add_status_index.sql</div>
					<div className="step-meta">PostgreSQL · +1 index</div>
				</div>
				<div className="connect-step is-upcoming" style={{ animationDelay: "240ms" }}>
					<div className="step-label">03 / SELECT MANIFEST</div>
					<div className="step-name">Representative workload</div>
					<div className="step-meta">One query · null pressure profile</div>
				</div>
			</div>

			<div className="file-grid">
				<section className="file-panel" style={{ animationDelay: "180ms" }}>
					<div className="file-panel-header">
						<div>
							<div className="panel-title">Migration file</div>
							<div className="panel-subtitle">Detected from the connected repository.</div>
						</div>
						<FileCode2 className="panel-icon" size={19} />
					</div>
					<div className="code-block">
						<div className="code-label">migrations / phase0 / add_status_index.sql</div>
						<div className="diff-line" style={{ animationDelay: "220ms" }}>+ CREATE INDEX orders_status_idx</div>
						<div className="diff-line" style={{ animationDelay: "300ms" }}>+ ON orders (status);</div>
					</div>
				</section>

				<section className="file-panel" style={{ animationDelay: "260ms" }}>
					<div className="file-panel-header">
						<div>
							<div className="panel-title">Query manifest</div>
							<div className="panel-subtitle">Use the Phase 0 workload for this rehearsal.</div>
						</div>
						<Upload className="panel-icon" size={19} />
					</div>
					<button
						className={`manifest-toggle ${manifestReady ? "is-ready" : ""}`}
						onClick={() => setManifestReady(!manifestReady)}
					>
						<span>
							<span className="manifest-file">sample_query_manifest.yaml</span>
							<span className="manifest-summary">SELECT COUNT(*) WHERE status IS NULL</span>
						</span>
						{manifestReady ? <Check className="manifest-check" size={18} /> : <span className="manifest-action">USE SAMPLE</span>}
					</button>
				</section>
			</div>

			<div className="connect-footer">
				<div className="footer-note"><Github size={15} /> OAuth is optional for the local rehearsal.</div>
				<button className="button-primary" disabled={!manifestReady || starting} onClick={startRun}>
					{starting ? "Starting rehearsal..." : "Run Rehearsal"}
					<ArrowRight size={16} />
				</button>
			</div>
			{error ? <div className="error-banner"><X size={14} /> {error}</div> : null}
		</main>
	);
}
