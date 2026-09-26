export type RunStage = "queued" | "provisioning" | "seeding" | "migrating" | "querying" | "analyzing" | "bisecting" | "done" | "failed";

export type RunStatus = {
  run_id: string;
  stage: RunStage;
  log: { ts: string; level: "info" | "warn" | "error"; message: string }[];
  progress_pct: number;
};

export type QueryResult = {
  id: string;
  sql: string;
  latency_before_ms: number;
  latency_after_ms: number;
  regression_factor: number;
  verdict: "regressed" | "passed";
  plan_before: string;
  plan_after: string;
};

export type RehearsalResult = { run_id: string; verdict: "regressed" | "clean"; queries: QueryResult[] };
export type BisectResult = {
  query_id: string;
  minimal_condition: string;
  minimal_row_count: number;
  bisection_trail: number[];
  repro_script_url: string;
};
export type FaqTurn = { question: string; answer: string };

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export function createRehearsal() {
  return request<{ run_id: string; status: "queued" }>("/rehearsal/run", { method: "POST", body: JSON.stringify({ repo_id: "phase-0-demo", migration_path: "phase0/add_status_index.sql", query_manifest: null, corruption_profile: { null_pressure: 0.15, duplication_rate: 0, legacy_format_rate: 0, row_count_per_table: 50000 } }) });
}

export function getRunStatus(runId: string) { return request<RunStatus>(`/rehearsal/${runId}/status`); }
export function getRunResult(runId: string) { return request<RehearsalResult>(`/rehearsal/${runId}/result`); }
export function bisectQuery(runId: string, queryId: string) {
  return request<BisectResult>(`/rehearsal/${encodeURIComponent(runId)}/bisect`, {
    method: "POST",
    body: JSON.stringify({ query_id: queryId }),
  });
}
export function getReproScriptUrl(runId: string, queryId: string) {
  return `${apiBase}/rehearsal/${encodeURIComponent(runId)}/cause/${encodeURIComponent(queryId)}/repro.sql`;
}
export function askFaqQuestion(question: string, history: FaqTurn[] = []) { return request<{ answer: string }>("/faq/ask", { method: "POST", body: JSON.stringify({ question, history }) }); }