import { ArrowLeft, Copy, Download, FileWarning } from "lucide-react";
import Link from "next/link";

export default async function CausePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return <main className="shell"><header className="mb-14 flex items-center justify-between"><Link className="flex items-center gap-2 font-mono text-xs text-muted hover:text-ink" href={`/run/${id}/report`}><ArrowLeft size={14} /> Back to results</Link><div className="eyebrow">Investigation / computed cause</div></header><div className="panel flex min-h-[480px] flex-col items-center justify-center px-6 text-center"><FileWarning className="mb-5 text-warn" size={28} /><h1 className="font-display text-2xl">The root cause is not computed yet.</h1><p className="mt-3 max-w-lg text-sm leading-6 text-muted">This view will render the delta-debugging trail and minimal condition returned by the backend bisector. It does not invent a condition before that computation exists.</p><div className="mt-7 flex gap-3"><button className="button-secondary"><Download size={15} /> Download minimal repro</button><button className="button-secondary"><Copy size={15} /> Copy PR comment</button></div></div></main>;
}
