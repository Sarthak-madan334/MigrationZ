import { Check, Circle, Database, FileSearch, FlaskConical, GitCommit, Search } from "lucide-react";
import type { RunStage } from "@/lib/api";

type Props = { stage: RunStage; regressionCount?: number };
const stages: { key: RunStage; label: string; detail: string; icon: typeof Database }[] = [
  { key: "provisioning", label: "Provisioning shadow DB", detail: "isolated Postgres instance", icon: Database },
  { key: "seeding", label: "Generating adversarial dataset", detail: "null-pressure profile applied", icon: FlaskConical },
  { key: "migrating", label: "Applying migration", detail: "schema change under rehearsal", icon: GitCommit },
  { key: "querying", label: "Running query manifest", detail: "representative workload", icon: Search },
  { key: "analyzing", label: "Analyzing results", detail: "latency and plan comparison", icon: FileSearch }
];
const order: RunStage[] = ["queued", "provisioning", "seeding", "migrating", "querying", "analyzing", "done"];

export function PipelineStages({ stage, regressionCount = 0 }: Props) {
  const current = order.indexOf(stage);
  return <div className="relative pl-2">
    <div className="absolute left-[19px] top-6 bottom-6 w-px bg-border" />
    {stages.map((item, index) => {
      const itemPosition = order.indexOf(item.key);
      const complete = stage === "done" || current > itemPosition;
      const active = stage === item.key;
      const Icon = item.icon;
      return <div className="relative flex gap-4 pb-8 last:pb-0" key={item.key}>
        <div className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${complete ? "border-signal bg-signal text-primary" : active ? "node-active border-focus bg-primary text-focus" : "border-border bg-primary text-muted"}`}>
          {complete ? <Check size={16} strokeWidth={2.5} /> : active ? <Icon size={16} /> : <Circle size={10} />}
        </div>
        <div className="min-w-0 pt-0.5">
          <div className={`font-display text-base ${active || complete ? "text-ink" : "text-muted"}`}>{item.label}</div>
          <div className="mt-1 font-mono text-xs text-muted">{item.detail}{item.key === "analyzing" && regressionCount > 0 ? <span className="ml-3 text-alert">{regressionCount} regression found</span> : null}</div>
        </div>
      </div>;
    })}
  </div>;
}