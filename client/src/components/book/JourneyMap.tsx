import { Link } from "react-router-dom";
import {
  JOURNEY_STAGES,
  JOURNEY_NODES,
  BOOK_TITLE,
  BOOK_TOTAL_NODES,
  type JourneyNode,
} from "@shared/bookCompanion";
import {
  BookOpen,
  Gamepad2,
  Upload,
  ShoppingBag,
  History,
  Trophy,
  ChevronRight,
  Award,
} from "lucide-react";

const tierBadgeClass: Record<string, string> = {
  Bronze: "text-amber-300 border-amber-300/30 bg-amber-300/10",
  Silver: "text-slate-300 border-slate-300/30 bg-slate-300/10",
  Gold: "text-yellow-300 border-yellow-300/30 bg-yellow-300/10",
  Platinum: "text-cyan-300 border-cyan-300/30 bg-cyan-300/10",
};

function actionMeta(node: JourneyNode) {
  if (node.deepLink.startsWith("/play")) {
    return { label: "Start skill game", icon: Gamepad2 };
  }
  if (node.deepLink === "/upload") {
    return { label: "Start assessment", icon: Upload };
  }
  if (node.deepLink === "/marketplace/publish") {
    return { label: "Publish SPC", icon: ShoppingBag };
  }
  if (node.deepLink === "/ark/history") {
    return { label: "View Ledger", icon: History };
  }
  return { label: "Go", icon: ChevronRight };
}

function JourneyNodeCard({ node }: { node: JourneyNode }) {
  const action = actionMeta(node);
  const ActionIcon = action.icon;

  return (
    <div
      className="group glass-card rounded-xl border border-white/10 hover:border-primary/40 transition-all hover:scale-[1.01] p-5 flex flex-col"
      data-testid={`journey-node-${node.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground">
            {node.chapterLabel}
          </p>
          <h3 className="font-display font-bold text-lg text-white mt-1 leading-tight">
            {node.title}
          </h3>
          {node.ccLevel && (
            <p className="text-[10px] font-mono text-muted-foreground mt-1 uppercase tracking-wider">
              {node.ccLevel}
            </p>
          )}
        </div>
        <span
          className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wider border ${
            tierBadgeClass[node.tierArt] ?? "text-muted-foreground border-white/10 bg-white/5"
          }`}
        >
          <Trophy className="h-3 w-3" />
          {node.tierArt}
        </span>
      </div>

      <ul className="mt-4 space-y-2 flex-1">
        {node.quest.map((step, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="mt-1.5 h-1 w-1 rounded-full bg-primary/60 shrink-0" />
            <span>{step}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
          <Award className="h-3.5 w-3.5 text-primary/70" />
          <span className="truncate max-w-[140px]">{node.badge}</span>
        </div>
        <Link
          to={node.deepLink}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-[11px] uppercase tracking-wider border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          data-testid={`journey-action-${node.id}`}
        >
          <ActionIcon className="h-3.5 w-3.5" />
          {action.label}
        </Link>
      </div>
    </div>
  );
}

export function JourneyMap() {
  const stages = JOURNEY_STAGES.map((stage) => ({
    ...stage,
    nodes: JOURNEY_NODES.filter((node) => node.stage === stage.id),
  }));

  return (
    <div className="space-y-12" data-testid="journey-map">
      {stages.map((stage) => (
        <section key={stage.id} className="space-y-4">
          <div className="flex items-end justify-between flex-wrap gap-2 border-b border-white/10 pb-3">
            <div>
              <h2 className="text-xl md:text-2xl font-display font-bold text-white uppercase tracking-wider">
                {stage.label}
              </h2>
              <p className="text-sm text-muted-foreground font-mono mt-1">{stage.blurb}</p>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              {stage.nodes.length} chapter{stage.nodes.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {stage.nodes.map((node) => (
              <JourneyNodeCard key={node.id} node={node} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function JourneyHeader() {
  return (
    <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
      <div className="flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-primary" />
        <h2 className="text-2xl md:text-3xl font-display font-bold text-white uppercase tracking-wider">
          Book Companion
        </h2>
      </div>
      <p className="text-muted-foreground font-mono text-sm mt-1">
        {BOOK_TITLE} · {BOOK_TOTAL_NODES} journey nodes
      </p>
    </div>
  );
}
