import { Terminal } from "lucide-react";

type LogLine = { ts: string; level: "info" | "warn" | "error"; message: string };

export function LiveLogPanel({ lines }: { lines: LogLine[] }) {
  return (
    <section className="panel runtime-panel">
      <div className="panel-head log-header">
        <div className="panel-kicker log-kicker">
          <Terminal size={14} className="text-mono" />
          Live event stream
        </div>
        <span className="connection-pill">
          <span className="status-dot" aria-hidden="true" />
          connected
        </span>
      </div>

      <div className="log-console">
        {lines.length ? (
          lines.map((line, index) => (
            <div
              className={`log-line ${line.level === "warn" || line.level === "error" ? "is-warning" : "is-info"}`}
              key={`${line.ts}-${index}`}
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <span className="log-time">{line.ts}</span>
              <span className="log-message">{line.message}</span>
            </div>
          ))
        ) : (
          <div className="log-line is-empty">Waiting for the first backend event...</div>
        )}
      </div>
    </section>
  );
}