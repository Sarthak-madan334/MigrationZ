import { Terminal } from "lucide-react";

type LogLine = { ts: string; level: "info" | "warn" | "error"; message: string };
export function LiveLogPanel({ lines }: { lines: LogLine[] }) {
  return <section className="panel flex min-h-[390px] flex-col">
    <div className="flex items-center justify-between border-b border-border px-5 py-4"><div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-muted"><Terminal size={14} className="text-mono" /> Live event stream</div><span className="flex items-center gap-2 font-mono text-[11px] text-signal"><span className="h-1.5 w-1.5 rounded-full bg-signal" /> connected</span></div>
    <div className="flex-1 space-y-3 overflow-auto p-5 font-mono text-xs leading-relaxed">
      {lines.length ? lines.map((line, index) => <div className={line.level === "warn" || line.level === "error" ? "text-alert" : "text-mono"} key={`${line.ts}-${index}`}><span className="mr-3 text-muted">{line.ts}</span>{line.message}</div>) : <div className="text-muted">Waiting for the first backend event...</div>}
    </div>
  </section>;
}