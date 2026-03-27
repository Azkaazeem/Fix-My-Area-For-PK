import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import clsx from "clsx";
import gsap from "gsap";
import { ArrowUp, Clock3, Flame, Siren, Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { useTiltHover } from "../../hooks/useTiltHover";
import { explainPriority } from "../../lib/supabase";

const descriptionClampStyle = {
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden"
};

export const IssueCard = ({ issue, onVote, isVoting, canVote, hasVoted }) => {
  const ref = useTiltHover();
  const priority = explainPriority(issue);

  const [localVoted, setLocalVoted] = useState(hasVoted);
  const [localVotes, setLocalVotes] = useState(issue.votes || 0);

  useEffect(() => {
    setLocalVoted(hasVoted);
    setLocalVotes(issue.votes || 0);
  }, [hasVoted, issue.votes]);

  const handleUpvote = async () => {
    if (!canVote || isVoting) return;

    const isNowVoting = !localVoted;

    setLocalVoted(isNowVoting);
    setLocalVotes(prev => isNowVoting ? prev + 1 : prev - 1);

    const element = ref.current;
    if (element) {
      gsap.fromTo(element, { scale: 0.985 }, { scale: 1, duration: 0.3, ease: "back.out(2.5)" });
    }

    if (isNowVoting) {
      confetti({
        particleCount: 20,
        spread: 50,
        startVelocity: 18,
        origin: { x: 0.78, y: 0.18 },
        colors: ["#3b82f6", "#22c55e", "#f59e0b"]
      });
    }

    await onVote?.(issue.id, isNowVoting);
  };

  return (
    <div ref={ref} className="glass-panel break-inside-avoid rounded-[30px] p-4 transition-transform" style={{ transformStyle: "preserve-3d" }}>
      <div className="relative overflow-hidden rounded-[24px]">
        <img src={issue.imageUrl} alt={issue.title} className="h-56 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/15 to-transparent" />
        {issue.isEmergency && (
          <div className="absolute left-4 top-4 inline-flex items-center rounded-full border border-danger/40 bg-danger/15 px-3 py-1.5 text-xs font-semibold text-danger shadow-[0_0_30px_rgb(var(--danger)_/_0.22)]">
            <Siren className="mr-1.5 h-4 w-4" />
            Emergency / Critical
          </div>
        )}
        <div className="absolute bottom-4 left-4 max-w-[80%] truncate rounded-full bg-black/35 px-3 py-1.5 text-xs text-white backdrop-blur-md">
          {issue.location}
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">{issue.category}</p>
            <h3 className="mt-2 text-balance font-display text-xl font-semibold">{issue.title}</h3>
          </div>
          <span
            className={clsx(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold",
              issue.status === "Resolved" && "bg-success/12 text-success",
              issue.status === "Pending" && "bg-accent/12 text-accent",
              issue.status === "In Progress" && "bg-primary/12 text-primary"
            )}
          >
            {issue.status}
          </span>
        </div>

        <p className="break-words text-sm leading-7 text-muted" style={descriptionClampStyle}>{issue.description}</p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            onClick={handleUpvote}
            disabled={!canVote || isVoting}
            className={clsx(
              "inline-flex items-center rounded-full px-4 py-2.5 text-sm font-semibold transition",
              !canVote || isVoting 
                ? "cursor-not-allowed border border-border/15 bg-surface/45 text-muted" 
                : localVoted 
                  ? "border border-primary bg-primary text-white"
                  : "border border-primary/25 bg-primary/10 text-primary"
            )}
          >
            <ArrowUp className="mr-2 h-4 w-4" />
            {!canVote 
              ? `Login to vote ${localVotes}` 
              : localVoted 
                ? `Voted ${localVotes}` 
                : isVoting 
                  ? "Voting..." 
                  : `Upvote ${localVotes}`}
          </button>
          <Link to={`/issues/${issue.id}`} className="rounded-full border border-border/20 px-4 py-2.5 text-sm font-semibold text-text transition hover:border-primary/35">
            View details
          </Link>
        </div>
      </div>
    </div>
  );
};