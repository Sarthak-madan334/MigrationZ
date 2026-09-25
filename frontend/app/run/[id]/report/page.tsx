"use client";

import { ArrowLeft, Download, FileWarning } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { QueryResultsTable } from "@/components/QueryResultsTable";
import { VerdictBanner } from "@/components/VerdictBanner";
import { getRunResult, type RehearsalResult } from "@/lib/api";

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	return <ReportContent id={id} />;
}

function ReportContent({ id }: { id: string }) {
	const [result, setResult] = useState<RehearsalResult | null>(null);
	useEffect(() => { getRunResult(id).then(setResult).catch(() => setResult(null)); }, [id]);
	return <main className="shell"><header className="mb-14 flex items-center justify-between"><Link className="flex items-center gap-2 font-mono text-xs text-muted hover:text-ink" href={`/run/${id}`}><ArrowLeft size={14} /> Back to live run</Link><div className="eyebrow">Results / computed report</div></header>{result ? <><div className="mb-8"><div className="eyebrow mb-4">Rehearsal verdict</div><h1 className="font-display text-4xl tracking-[-0.03em]">The workload has been measured.</h1></div><VerdictBanner regressed={result.queries.filter((query) => query.verdict === "regressed").length} total={result.queries.length} /><div className="mt-8 flex items-center justify-between"><div><div className="font-display text-xl">Query results</div><div className="mt-1 text-sm text-muted">Before and after measurements from the shadow database.</div></div><button className="button-secondary"><Download size={15} /> Export reproducible case</button></div><div className="mt-4"><QueryResultsTable queries={result.queries} runId={id} /></div></> : <UnavailableReport />}</main>;
}

function UnavailableReport() { return <div className="panel flex min-h-[360px] flex-col items-center justify-center px-6 text-center"><FileWarning className="mb-5 text-warn" size={28} /><h1 className="font-display text-2xl">No computed result is available yet.</h1><p className="mt-3 max-w-md text-sm leading-6 text-muted">The report page only renders measurements returned by the rehearsal backend. Complete the run before opening this view.</p><Link className="button-secondary mt-7" href="/connect">Start a rehearsal</Link></div>; }
