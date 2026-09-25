import { ArrowRight, Github, Search, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

function BrandMark() {
	return (
		<span className="brand-mark" aria-hidden="true">
			<svg viewBox="0 0 80 80" role="img">
				<g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
					<path d="M40 8v64M8 40h64M18 18l44 44M18 62l44-44" strokeWidth="4.5" opacity="0.9" />
					<circle cx="40" cy="40" r="11" strokeWidth="3" opacity="0.8" />
				</g>
			</svg>
		</span>
	);
}

export default function LandingPage() {
	const InteractiveBotElement = "interactive-bot" as any;

	return <main className="min-h-screen">
		<header className="hero-header">
			<Link className="brand-link" href="/">
				<BrandMark />
				<span className="brand-text">MIGRATION REHEARSAL</span>
			</Link>
			<a className="repo-link" href="https://github.com/Sarthak-madan334/MRA">
				<Github size={15} />
				<span>Sarthak-madan334/MRA</span>
			</a>
		</header>
		<section className="hero-shell">
			<div className="hero-spotlight" aria-hidden="true" />
			<div className="hero-copy">
				<div className="eyebrow">Database change intelligence / local rehearsal</div>
				<h1 className="hero-title">
					Your migration passes on normal data.<br />
					<span className="highlight-callout">We find the 2% that doesn&apos;t.</span>
				</h1>
				<p className="hero-subtitle">Run schema changes against data engineered to expose the conditions production quietly accumulated.</p>
				<div className="hero-actions">
					<Link className="button-primary" href="/connect">
						<span>Connect a Repo</span>
						<ArrowRight size={16} />
					</Link>
					<Link className="button-secondary" href="/run/demo">
						<span>View rehearsal surface</span>
						<Search size={16} />
					</Link>
				</div>
			</div>
			<div className="feature-grid">
				<div className="feature-item">
					<Sparkles className="feature-icon focus" size={19} />
					<div>
						<div className="feature-label">Generate hostile data</div>
						<div className="feature-copy">Shape the edge cases.</div>
					</div>
				</div>
				<div className="feature-item">
					<ShieldCheck className="feature-icon signal" size={19} />
					<div>
						<div className="feature-label">Rehearse the change</div>
						<div className="feature-copy">Run the real workload.</div>
					</div>
				</div>
				<div className="feature-item">
					<Search className="feature-icon alert" size={19} />
					<div>
						<div className="feature-label">Prove the finding</div>
						<div className="feature-copy">Leave a reproducible case.</div>
					</div>
				</div>
			</div>
			<InteractiveBotElement greeting="Hello! 👋" aria-label="AI assistant" />
		</section>
	</main>;
}
