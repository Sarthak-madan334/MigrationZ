import { Clock3, FileSearch } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
	return <main className="shell"><header className="mb-14 flex items-center justify-between"><Link className="flex items-center gap-3 font-display text-sm font-semibold tracking-wide" href="/"><span className="flex h-8 w-8 items-center justify-center border border-focus text-focus"><span className="h-2 w-2 bg-signal" /></span> MIGRATION REHEARSAL</Link><div className="eyebrow">History</div></header><div className="mb-10"><div className="eyebrow mb-4">Recorded rehearsals</div><h1 className="font-display text-4xl tracking-[-0.03em]">No runs recorded yet.</h1><p className="mt-3 text-muted">Completed backend runs will appear here with their migration and verdict.</p></div><div className="panel flex min-h-[280px] items-center justify-center"><div className="text-center"><Clock3 className="mx-auto mb-4 text-muted" size={25} /><div className="font-mono text-sm text-muted">RUN HISTORY IS EMPTY</div><Link className="button-secondary mt-6" href="/connect"><FileSearch size={15} /> Start first rehearsal</Link></div></div></main>;
}
