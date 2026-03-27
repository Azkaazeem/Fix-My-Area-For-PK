import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, CircleAlert, Lock, LocateFixed, MapPinned, SendHorizonal, Sparkles, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CategoryPicker } from "../components/report/CategoryPicker";
import { Dropzone } from "../components/report/Dropzone";
import { issuesApi } from "../lib/supabase";
import { useAuth } from "../providers/AuthProvider";

const initialForm = { title: "", description: "", location: "", neighborhood: "", authority: "" };

export const ReportPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [category, setCategory] = useState("Water");
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const isDisabled = !isAuthenticated || isLoading || isSubmitting;

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user?.id) return;

    setIsSubmitting(true);
    const { error } = await issuesApi.createIssue({ ...form, category, images: files, userId: user.id });

    if (error) {
      setToast({ type: "error", title: "Report not submitted", description: error.message || "Something went wrong while sending your report." });
      setIsSubmitting(false);
      return;
    }

    setForm(initialForm);
    setFiles([]);
    setCategory("Water");
    setToast({ type: "success", title: "Report submitted", description: "Your report is now live in All Reports and can receive community support." });
    setIsSubmitting(false);
  };

  return (
    <section className="section-shell py-10 md:py-16">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            className={`fixed right-5 top-5 z-[120] w-full max-w-sm rounded-[24px] border px-5 py-4 shadow-2xl backdrop-blur-xl ${toast.type === "success" ? "border-secondary/20 bg-elevated/95" : "border-danger/20 bg-elevated/95"}`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${toast.type === "success" ? "bg-secondary/12 text-secondary" : "bg-danger/12 text-danger"}`}>
                {toast.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              </div>
              <div>
                <p className="font-semibold text-text">{toast.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted">{toast.description}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8 grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.35em] text-primary">Report</p>
          <h1 className="heading-lg mt-3">Submit a new civic report</h1>
          <p className="mt-4 text-base leading-8 text-muted">
            Describe the issue clearly and send it to the public feed. The platform handles urgency scoring automatically in the background.
          </p>
        </div>
        <div className="glass-panel rounded-[32px] p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-text">Submit first, manage later</p>
              <p className="mt-1 text-sm leading-7 text-muted">After submission, the same report will also appear in your personal My Reports section for editing or deletion.</p>
            </div>
          </div>
        </div>
      </div>

      {!isAuthenticated && !isLoading && (
        <div className="glass-panel mb-6 rounded-[32px] border border-accent/20 bg-accent/10 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-text">You need to sign up or log in before submitting a report.</p>
                <p className="mt-1 text-sm leading-7 text-muted">This page is visible to everyone, but report submission is only available for authenticated users.</p>
              </div>
            </div>
            <Link to="/auth" className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-glow">
              Sign Up / Log In
            </Link>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className={`glass-panel rounded-[32px] p-6 sm:p-8 ${isDisabled ? "opacity-60" : ""}`}>
            <h2 className="font-display text-2xl font-semibold">Choose issue category</h2>
            <p className="mt-2 text-sm leading-7 text-muted">Normal and emergency categories are styled separately for instant clarity.</p>
            <div className="mt-6"><CategoryPicker value={category} onChange={setCategory} disabled={isDisabled} /></div>
          </div>
          <div className={`glass-panel rounded-[32px] p-6 sm:p-8 ${isDisabled ? "opacity-60" : ""}`}>
            <h2 className="font-display text-2xl font-semibold">Issue details</h2>
            <div className="mt-6 grid gap-4">
              <TextField label="Issue Title" value={form.title} disabled={isDisabled} onChange={(value) => setForm((current) => ({ ...current, title: value }))} />
              <TextField label="Location / Area" icon={<MapPinned className="h-4 w-4 text-primary" />} value={form.location} disabled={isDisabled} onChange={(value) => setForm((current) => ({ ...current, location: value }))} />
              <div className="grid gap-4 md:grid-cols-2">
                <TextField label="Neighborhood / Block" icon={<LocateFixed className="h-4 w-4 text-secondary" />} value={form.neighborhood} disabled={isDisabled} onChange={(value) => setForm((current) => ({ ...current, neighborhood: value }))} />
                <TextField label="Authority to notify" value={form.authority} disabled={isDisabled} onChange={(value) => setForm((current) => ({ ...current, authority: value }))} />
              </div>
              <label className="block rounded-[24px] border border-border/15 bg-surface/40 p-4">
                <span className="mb-3 block text-sm font-medium text-muted">Detailed Description</span>
                <textarea
                  rows={6}
                  disabled={isDisabled}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="w-full resize-none bg-transparent text-base text-text outline-none placeholder:text-muted/70 disabled:cursor-not-allowed"
                  placeholder="Describe what happened, where it is, and what danger or disruption people are facing."
                />
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`glass-panel rounded-[32px] p-6 sm:p-8 ${isDisabled ? "opacity-60" : ""}`}>
            <Dropzone files={files} onChange={setFiles} disabled={isDisabled} />
          </div>
          <div className={`glass-panel rounded-[32px] p-6 sm:p-8 ${isDisabled ? "opacity-60" : ""}`}>
            <div className="inline-flex rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm text-accent"><CircleAlert className="mr-2 h-4 w-4" />Smart priority handled automatically</div>
            <p className="mt-4 text-sm leading-7 text-muted">No manual severity selector is shown here. Emergency category signals and community engagement determine the urgency score server-side.</p>
            <div className="mt-5 rounded-[28px] bg-surface/45 p-5 text-sm text-muted">
              <p className="font-semibold text-text">Priority formula</p>
              <p className="mt-2 leading-7">Vote weight + unresolved time + category severity + emergency weight</p>
            </div>
            <button type="submit" disabled={isDisabled} className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-primary px-6 py-4 font-semibold text-white shadow-glow disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? "Submitting report..." : "Submit Issue Report"}
              <SendHorizonal className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};

const TextField = ({ label, value, onChange, icon, disabled = false }) => (
  <label className="block rounded-[24px] border border-border/15 bg-surface/40 p-4">
    <span className="mb-3 flex items-center gap-2 text-sm font-medium text-muted">{icon}{label}</span>
    <input value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="w-full bg-transparent text-base text-text outline-none placeholder:text-muted/70 disabled:cursor-not-allowed" placeholder={label} />
  </label>
);
