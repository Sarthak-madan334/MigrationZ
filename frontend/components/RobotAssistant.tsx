"use client";

import { ArrowRight, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "mra-robot-assistant-dismissed";

export default function RobotAssistant() {
  const [isMounted, setIsMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const hasDismissed = window.sessionStorage.getItem(STORAGE_KEY) === "true";
    if (hasDismissed) {
      return;
    }

    const mountTimer = window.setTimeout(() => setIsMounted(true), 1200);
    const bubbleTimer = window.setTimeout(() => setShowBubble(true), 2200);

    return () => {
      window.clearTimeout(mountTimer);
      window.clearTimeout(bubbleTimer);
    };
  }, []);

  const dismiss = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(STORAGE_KEY, "true");
    }

    setIsExpanded(false);
    setShowBubble(false);
    setIsMounted(false);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className={`robot-assistant ${isExpanded ? "is-expanded" : ""}`} aria-live="polite">
      {!isExpanded && showBubble ? (
        <button type="button" className="robot-bubble" onClick={() => setIsExpanded(true)}>
          Need help getting started? <span aria-hidden="true">👋</span>
        </button>
      ) : null}

      <div className="robot-figure-wrap">
        <button
          type="button"
          className="robot-trigger"
          aria-label={isExpanded ? "Hide assistant" : "Open assistant"}
          onClick={() => setIsExpanded((value) => !value)}
        >
          <svg className="robot-svg" viewBox="0 0 180 180" role="img" aria-label="Friendly robot assistant">
            <defs>
              <linearGradient id="robot-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#81f7d0" />
                <stop offset="50%" stopColor="#00e5a0" />
                <stop offset="100%" stopColor="#7ab8ff" />
              </linearGradient>
            </defs>

            <ellipse cx="90" cy="146" rx="42" ry="12" fill="rgba(11,14,20,0.55)" />

            <g className="robot-body">
              <g className="robot-arm">
                <rect x="123" y="70" width="30" height="12" rx="6" fill="none" stroke="url(#robot-glow)" strokeWidth="3" />
                <circle cx="150" cy="76" r="5" fill="#7ab8ff" />
              </g>

              <rect x="56" y="58" width="68" height="58" rx="20" fill="rgba(10,14,20,0.18)" stroke="url(#robot-glow)" strokeWidth="3" />
              <circle cx="74" cy="86" r="5" fill="#8ef2d0" />
              <circle cx="98" cy="86" r="5" fill="#8ef2d0" />

              <rect x="63" y="106" width="54" height="28" rx="12" fill="rgba(10,14,20,0.12)" stroke="url(#robot-glow)" strokeWidth="3" />
              <circle cx="76" cy="119" r="4" fill="#9ec8ff" />
              <circle cx="96" cy="119" r="4" fill="#9ec8ff" />
            </g>
          </svg>
        </button>
      </div>

      {isExpanded ? (
        <div role="dialog" aria-label="Migration rehearsal assistant" className="robot-panel">
          <button type="button" className="robot-panel-close" aria-label="Close assistant" onClick={dismiss}>
            <X size={15} />
          </button>

          <div className="robot-panel-header">
            <div className="robot-panel-avatar" aria-hidden="true">
              <Sparkles size={14} />
            </div>
            <div>
              <div className="robot-panel-label">Agent</div>
              <div className="robot-panel-name">Migration assistant</div>
            </div>
          </div>

          <p className="robot-panel-copy">👋 Hello! I&apos;m here to help you rehearse your migration. Want a quick walkthrough?</p>

          <div className="robot-panel-actions">
            <Link href="/connect" className="button-primary robot-cta" onClick={dismiss}>
              <span>Start walkthrough</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
