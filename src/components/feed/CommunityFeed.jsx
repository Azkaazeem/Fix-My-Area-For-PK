import { Search, Siren, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { issuesApi, supabase } from "../../lib/supabase";
import { useAuth } from "../../providers/AuthProvider";
import { sortIssuesByPriority } from "../../utils/priority";
import { useGsapReveal } from "../../hooks/useGsapReveal";
import { IssueCard } from "./IssueCard";

const FEED_MODES = [
  { id: "priority", label: "Smart Priority", icon: Sparkles, description: "Balanced by severity, time unresolved, and community support." },
  { id: "emergency", label: "Emergency Focus", icon: Siren, description: "Highlights the most critical reports first." },
  { id: "recent", label: "Latest Reports", icon: Search, description: "Shows the newest reports coming in from the community." }
];

export const CommunityFeed = ({ limit, compact = false, showViewAll = false, title, subtitle, eyebrow = "Community Feed" }) => {
  const ref = useGsapReveal();
  const { user, isAuthenticated } = useAuth();
  const [mode, setMode] = useState("priority");
  const [query, setQuery] = useState("");
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [votingId, setVotingId] = useState("");

  useEffect(() => {
    let active = true;

    const loadIssues = async () => {
      setIsLoading(true);
      const { data, error } = await issuesApi.fetchIssueFeed({ currentUserId: user?.id, limit: compact ? limit : undefined });
      if (!active) return;
      if (error) {
        setErrorMessage(error.message);
        setIssues([]);
      } else {
        setErrorMessage("");
        setIssues(data ?? []);
      }
      setIsLoading(false);
    };

    void loadIssues();

    const channel = supabase
      .channel('public-reports-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'FixMyAreaReportTable' }, () => {
        loadIssues();
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user?.id, compact, limit]);

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('realtime_reports')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'FixMyAreaReportTable' }, (payload) => {
        setIssues((currentIssues) =>
          currentIssues.map((issue) =>
            issue.id === payload.new.id
              ? { ...issue, votes: payload.new.votes_count, smartPriority: payload.new.smart_priority }
              : issue
          )
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const visibleIssues = useMemo(() => {
    const sorted = sortIssuesByPriority(issues);
    let base = sorted;

    if (mode === "emergency") {
      base = sorted.filter((issue) => issue.isEmergency);
    } else if (mode === "recent") {
      base = [...issues].sort((left, right) => new Date(right.reportedAt).getTime() - new Date(left.reportedAt).getTime());
    }

    const normalizedQuery = query.trim().toLowerCase();
    const filtered = !normalizedQuery
      ? base
      : base.filter((issue) =>
          [issue.title, issue.description, issue.category, issue.location, issue.reporterName, issue.neighborhood, issue.authority]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(normalizedQuery))
        );

    return compact && limit ? filtered.slice(0, limit) : filtered;
  }, [issues, mode, query, compact, limit]);

  const activeMode = FEED_MODES.find((item) => item.id === mode) ?? FEED_MODES[0];

  const handleVote = async (issueId, isNowVoting) => {
    if (!user?.id) return;
    setVotingId(issueId);

    setIssues((currentIssues) =>
      currentIssues.map((issue) => {
        if (issue.id === issueId) {
          return {
            ...issue,
            hasUserVoted: isNowVoting,
            votes: isNowVoting ? issue.votes + 1 : issue.votes - 1
          };
        }
        return issue;
      })
    );

    const { error } = await issuesApi.upvoteIssue(issueId, user.id);
    
    if (error) {
      const { data } = await issuesApi.fetchIssueFeed({ currentUserId: user.id, limit: compact ? limit : undefined });
      setIssues(data ?? []);
    }

    setVotingId("");
  };

  return (
    <section className={`section-shell ${compact ? "py-10 md:py-14" : "py-14 md:py-24"}`}>
      <div ref={ref}>
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.35em] text-primary">{eyebrow}</p>
            <h2 className="heading-lg mt-3">{title || "See which local issues are getting the most attention"}</h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              {subtitle || "Search reports by title, category, or location and support the ones that genuinely need attention."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="glass-panel rounded-[28px] p-4 lg:max-w-md">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <activeMode.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">{activeMode.label}</p>
                  <p className="text-xs leading-6 text-muted">{activeMode.description}</p>
                </div>
              </div>
            </div>
            {showViewAll && (
              <Link to="/all-reports" className="rounded-full border border-border/15 bg-elevated/45 px-5 py-3 text-sm font-semibold text-text transition hover:border-primary/25 hover:text-primary">
                See all reports
              </Link>
            )}
          </div>
        </div>

        {!compact && (
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-3">
              {FEED_MODES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  className={`inline-flex items-center rounded-full px-4 py-3 text-sm font-medium transition ${
                    mode === id ? "bg-primary text-white shadow-glow" : "border border-border/15 bg-elevated/45 text-muted hover:border-primary/25 hover:text-text"
                  }`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            <label className="flex min-w-full items-center gap-3 rounded-full border border-border/15 bg-elevated/45 px-4 py-3 text-sm text-muted lg:min-w-[360px]">
              <Search className="h-4 w-4 text-primary" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reports..." className="w-full bg-transparent text-text outline-none placeholder:text-muted/70" />
            </label>
          </div>
        )}

        {isLoading ? (
          <div className="glass-panel rounded-[32px] p-10 text-center">
            <h3 className="font-display text-2xl font-semibold text-text">Loading reports...</h3>
          </div>
        ) : errorMessage ? (
          <div className="glass-panel rounded-[32px] p-10 text-center">
            <h3 className="font-display text-2xl font-semibold text-text">Reports could not be loaded</h3>
            <p className="mt-3 text-sm leading-7 text-muted">{errorMessage}</p>
          </div>
        ) : visibleIssues.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${mode}-${query}-${visibleIssues.length}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className={`columns-1 gap-5 ${compact ? "xl:columns-3 md:columns-2" : "md:columns-2 xl:columns-3"}`}
              >
                {visibleIssues.map((issue) => (
                  <div key={issue.id} className="mb-5">
                    <IssueCard
                      issue={issue}
                      onVote={handleVote}
                      isVoting={votingId === issue.id}
                      canVote={isAuthenticated}
                      hasVoted={issue.hasUserVoted}
                    />
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>

            {visibleIssues.length === 0 && !isLoading && (
              <div className="glass-panel rounded-[32px] p-8 text-center">
                <h3 className="font-display text-2xl font-semibold text-text">No matching reports found</h3>
                <p className="mt-3 text-sm leading-7 text-muted">Try a different keyword, location, category, or authority name.</p>
              </div>
            )}
          </>
        ) : (
          <div className="glass-panel rounded-[32px] p-10 text-center">
            <h3 className="font-display text-2xl font-semibold text-text">No reports available right now</h3>
            <p className="mt-3 text-sm leading-7 text-muted">Newly submitted citizen reports will appear here automatically.</p>
          </div>
        )}

        {!isAuthenticated && !compact && (
          <p className="mt-5 text-sm text-muted">Only logged-in users can vote. Anonymous visitors can browse reports but cannot influence ranking.</p>
        )}
      </div>
    </section>
  );
};