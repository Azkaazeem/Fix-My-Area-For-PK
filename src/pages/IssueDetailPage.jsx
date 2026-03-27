import clsx from "clsx";
import { MapPin, MessageSquareWarning, PhoneCall, ShieldCheck, Siren, Sparkles, TimerReset } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { explainPriority, issuesApi } from "../lib/supabase";
import { useAuth } from "../providers/AuthProvider";

export const IssueDetailPage = () => {
  const { issueId } = useParams();
  const { user } = useAuth();
  const [issue, setIssue] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadIssue = async () => {
      setIsLoading(true);
      const { data } = await issuesApi.fetchIssueById(issueId, user?.id);
      if (active) {
        setIssue(data ?? null);
        setIsLoading(false);
      }
    };

    void loadIssue();

    return () => {
      active = false;
    };
  }, [issueId, user?.id]);

  if (isLoading) {
    return (
      <section className="section-shell py-10 md:py-16">
        <div className="glass-panel rounded-[34px] p-10 text-center">
          <h1 className="font-display text-4xl font-semibold text-text">Loading report...</h1>
        </div>
      </section>
    );
  }

  if (!issue) {
    return (
      <section className="section-shell py-10 md:py-16">
        <div className="glass-panel rounded-[34px] p-10 text-center">
          <h1 className="font-display text-4xl font-semibold text-text">Report not found</h1>
          <p className="mt-4 text-base leading-8 text-muted">There are no reports available right now, or the report you selected has been removed.</p>
          <Link to="/all-reports" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 font-semibold text-white shadow-glow">
            Go to All Reports
          </Link>
        </div>
      </section>
    );
  }

  const priority = explainPriority(issue);
  const summaryItems = [
    { label: "Reporter", value: issue.reporterName },
    { label: "Reported from", value: issue.location },
    { label: "Neighborhood", value: issue.neighborhood },
    { label: "Unresolved time", value: `${issue.unresolvedDays} day(s)` }
  ];
  const statCards = [
    { label: "Votes", value: priority.breakdown.voteScore, tone: "bg-primary/10 text-primary" },
    { label: "Days", value: priority.breakdown.unresolvedBonus, tone: "bg-secondary/10 text-secondary" },
    { label: "Severity", value: priority.breakdown.categoryScore, tone: "bg-accent/10 text-accent" },
    { label: "Emergency", value: priority.breakdown.emergencyBonus, tone: "bg-danger/10 text-danger" }
  ];

  return (
    <section className="section-shell py-10 md:py-16">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.28fr)_380px] xl:items-start">
        <div className="space-y-6">
          <div className="glass-panel overflow-hidden rounded-[34px]">
            <div className="relative">
              <img src={issue.imageUrl} alt={issue.title} className="h-[360px] w-full object-cover sm:h-[430px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/10 to-transparent" />
              <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-primary/90 px-4 py-2 text-sm font-semibold text-white shadow-glow">{issue.category}</span>
                <span className={clsx("rounded-full px-4 py-2 text-sm font-semibold", issue.status === "Resolved" ? "bg-success text-white" : issue.status === "In Progress" ? "bg-primary text-white" : "bg-accent text-white")}>
                  {issue.status}
                </span>
                {issue.isEmergency && (
                  <span className="rounded-full bg-danger/90 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_24px_rgb(var(--danger)_/_0.22)]">
                    <Siren className="mr-2 inline h-4 w-4" />
                    Verified emergency route
                  </span>
                )}
              </div>
              <div className="absolute bottom-5 left-5 inline-flex items-center rounded-full bg-black/35 px-4 py-2 text-sm text-white backdrop-blur-md">
                <MapPin className="mr-2 h-4 w-4" />
                {issue.location}
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-primary/80">Public issue report</p>
                  <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-text sm:text-[2.8rem]">{issue.title}</h1>
                  <p className="mt-4 max-w-3xl text-base leading-8 text-muted">{issue.description}</p>
                </div>

                <div className="grid gap-3 rounded-[28px] border border-border/12 bg-surface/35 p-4">
                  <div className="rounded-[22px] bg-surface/55 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted">Priority score</p>
                    <p className="mt-2 font-display text-3xl font-semibold text-text">{priority.score}</p>
                  </div>
                  <div className="rounded-[22px] bg-surface/55 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted">Votes</p>
                    <p className="mt-2 text-lg font-semibold text-text">{issue.votes}</p>
                  </div>
                  <div className="rounded-[22px] bg-surface/55 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted">Reported</p>
                    <p className="mt-2 text-sm font-semibold text-text">{new Date(issue.reportedAt).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full bg-surface/45 px-4 py-2 text-muted">Authority: <span className="font-semibold text-text">{issue.authority}</span></span>
                <span className="rounded-full bg-surface/45 px-4 py-2 text-muted">Neighborhood: <span className="font-semibold text-text">{issue.neighborhood}</span></span>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-[34px] p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold text-text">Status timeline</h2>
                <p className="mt-1 text-sm text-muted">Follow how this report is moving through the platform.</p>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              {issue.timeline.map((event, index) => (
                <div key={`${event.timestamp}-${index}`} className="grid grid-cols-[18px_minmax(0,1fr)] gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-4 w-4 rounded-full bg-primary shadow-[0_0_0_6px_rgb(var(--primary)_/_0.12)]" />
                    {index !== issue.timeline.length - 1 && <div className="mt-3 h-full w-px bg-border/25" />}
                  </div>
                  <div className="rounded-[24px] border border-border/12 bg-surface/35 px-5 py-4">
                    <p className="text-xs uppercase tracking-[0.26em] text-primary">{event.timestamp}</p>
                    <h3 className="mt-2 text-lg font-semibold text-text">{event.label}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted">{event.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6 xl:sticky xl:top-24">
          <div className="glass-panel rounded-[34px] p-6 sm:p-8">
            <h2 className="font-display text-2xl font-semibold text-text">Priority intelligence</h2>
            <p className="mt-3 text-sm leading-7 text-muted">This issue is ranked using a balanced urgency score, not raw votes alone.</p>

            <div className="mt-6 rounded-[28px] border border-border/12 bg-surface/35 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">Computed score</p>
              <p className="mt-2 font-display text-4xl font-semibold text-text">{priority.score}</p>
              <p className="mt-3 text-sm leading-7 text-muted">{priority.formula}</p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {statCards.map((item) => (
                <div key={item.label} className="rounded-[24px] border border-border/12 bg-surface/35 p-4 text-center">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-muted">{item.label}</p>
                  <div className={clsx("mt-3 rounded-2xl px-3 py-3", item.tone)}>
                    <p className="font-display text-2xl font-semibold">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3">
              <button className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-4 font-semibold text-white shadow-glow transition hover:opacity-95">
                <ShieldCheck className="mr-2 h-5 w-5" />
                Verified Case
              </button>
              <button className="inline-flex items-center justify-center rounded-2xl border border-border/20 bg-elevated/50 px-5 py-4 font-semibold text-text transition hover:border-primary/35">
                <PhoneCall className="mr-2 h-5 w-5 text-accent" />
                Request Contact
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-[34px] p-6 sm:p-8">
            <h2 className="font-display text-2xl font-semibold text-text">Field summary</h2>
            <div className="mt-6 grid gap-3">
              {summaryItems.map((item) => (
                <div key={item.label} className="rounded-[22px] border border-border/12 bg-surface/35 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold text-text">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[28px] border border-danger/18 bg-danger/8 p-5">
              <div className="flex items-start gap-3">
                <MessageSquareWarning className="mt-1 h-5 w-5 text-danger" />
                <div>
                  <p className="font-semibold text-text">Protected contact flow</p>
                  <p className="mt-2 text-sm leading-7 text-muted">Contact details remain hidden until a critical case request is approved, reducing misuse and protecting citizen privacy.</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center text-sm text-muted">
              <TimerReset className="mr-2 h-4 w-4 text-primary" />
              Last feed refresh reflects latest urgency order.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
