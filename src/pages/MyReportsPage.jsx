import { AnimatePresence, motion } from "framer-motion";
import { Camera, CheckCircle2, ImagePlus, Pencil, Trash2, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { issuesApi } from "../lib/supabase";
import { useAuth } from "../providers/AuthProvider";

const initialEditState = {
  id: "",
  title: "",
  description: "",
  category: "Water",
  location: "",
  neighborhood: "",
  authority: "",
  votes: 0,
  unresolvedDays: 0,
  imageUrl: ""
};

const categoryOptions = ["Water", "Gas", "Electricity", "Road", "Garbage", "Fire", "Severe Accident", "Theft"];

export const MyReportsPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [issues, setIssues] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [editForm, setEditForm] = useState(initialEditState);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // --- Image Update State ---
  const [editFile, setEditFile] = useState(null);
  const [editPreview, setEditPreview] = useState("");
  // -------------------------

  const issueCountLabel = useMemo(() => `${issues.length} report${issues.length === 1 ? "" : "s"}`, [issues.length]);
  const isEditOpen = Boolean(editForm.id);
  const isDeleteOpen = Boolean(deleteTarget?.id);

  const loadIssues = async () => {
    if (!user?.id) {
      setIssues([]);
      setIsPageLoading(false);
      return;
    }

    setIsPageLoading(true);
    const { data, error } = await issuesApi.fetchUserIssues(user.id);
    if (error) {
      setToast({ type: "error", title: "Could not load reports", description: error.message || "Something went wrong while loading your reports." });
      setIssues([]);
    } else {
      setIssues(data ?? []);
    }
    setIsPageLoading(false);
  };

  useEffect(() => {
    void loadIssues();
  }, [user?.id]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const openEditModal = (issue) => {
    setEditPreview(issue.imageUrl); 
    setEditFile(null);

    setEditForm({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      category: issue.category,
      location: issue.location,
      neighborhood: issue.neighborhood === "Area not added" ? "" : issue.neighborhood,
      authority: issue.authority === "Municipal response team" ? "" : issue.authority,
      votes: issue.votes,
      unresolvedDays: issue.unresolvedDays,
      imageUrl: issue.imageUrl
    });
  };

  const closeEditModal = () => {
    setEditForm(initialEditState);
    setEditPreview("");
    setEditFile(null);
  };
  
  const closeDeleteModal = () => setDeleteTarget(null);

  const onEditImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setEditFile(file);
    setEditPreview(URL.createObjectURL(file));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!user?.id || !editForm.id) return;

    setIsSaving(true);
    const { error } = await issuesApi.updateIssue(editForm.id, user.id, editForm, editFile);
    if (error) {
      setToast({ type: "error", title: "Report not updated", description: error.message || "Something went wrong while saving your report." });
      setIsSaving(false);
      return;
    }

    await loadIssues();
    closeEditModal();
    setToast({ type: "success", title: "Report updated", description: "Your report changes have been saved successfully." });
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!user?.id || !deleteTarget?.id) return;

    setIsSaving(true);
    const { error } = await issuesApi.deleteIssue(deleteTarget.id, user.id);
    if (error) {
      setToast({ type: "error", title: "Report not deleted", description: error.message || "Something went wrong while deleting your report." });
      setIsSaving(false);
      return;
    }

    await loadIssues();
    closeDeleteModal();
    setToast({ type: "success", title: "Report deleted", description: "The report has been removed from your list and the public feed." });
    setIsSaving(false);
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

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-4xl">
          <p className="text-sm uppercase tracking-[0.35em] text-primary">My Reports</p>
          <h1 className="heading-lg mt-3">Manage every report you have submitted</h1>
          <p className="mt-4 text-base leading-8 text-muted">Your submitted reports appear here in the same card style as the public feed, with quick edit and delete controls at the top of each card.</p>
        </div>
        <div className="glass-panel rounded-[28px] px-5 py-4 text-sm text-muted">{issueCountLabel}</div>
      </div>

      {!isAuthenticated && !isLoading ? (
        <div className="glass-panel rounded-[32px] p-10 text-center">
          <h2 className="font-display text-3xl font-semibold text-text">Log in to manage your own reports</h2>
          <p className="mt-3 text-sm leading-7 text-muted">After you sign in, the reports you submitted will appear here with edit and delete options.</p>
          <Link to="/auth" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 font-semibold text-white shadow-glow">Go to Account</Link>
        </div>
      ) : isPageLoading ? (
        <div className="glass-panel rounded-[32px] p-10 text-center">
          <h2 className="font-display text-3xl font-semibold text-text">Loading your reports...</h2>
        </div>
      ) : issues.length === 0 ? (
        <div className="glass-panel rounded-[32px] p-10 text-center">
          <h2 className="font-display text-3xl font-semibold text-text">No reports submitted yet</h2>
          <p className="mt-3 text-sm leading-7 text-muted">Once you submit a report from the Report page, it will appear here automatically.</p>
          <Link to="/report" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 font-semibold text-white shadow-glow">Go to Report</Link>
        </div>
      ) : (
        <div className="columns-1 gap-5 md:columns-2 xl:columns-3">
          {issues.map((issue) => (
            <div key={issue.id} className="mb-5 break-inside-avoid rounded-[30px] border border-border/20 bg-elevated/60 p-4 shadow-panel backdrop-blur-2xl">
              <div className="mb-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(issue)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary transition hover:bg-primary/15"
                  aria-label="Edit report"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(issue)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-danger/20 bg-danger/10 text-danger transition hover:bg-danger/15"
                  aria-label="Delete report"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="relative overflow-hidden rounded-[24px]">
                <img src={issue.imageUrl} alt={issue.title} className="h-56 w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/15 to-transparent" />
                <div className="absolute bottom-4 left-4 max-w-[80%] truncate rounded-full bg-black/35 px-3 py-1.5 text-xs text-white backdrop-blur-md">
                  {issue.location}
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted">{issue.category}</p>
                    <h3 className="mt-2 font-display text-xl font-semibold text-text">{issue.title}</h3>
                  </div>
                  <span className="shrink-0 rounded-full bg-surface/55 px-3 py-1.5 text-xs font-semibold text-muted">{issue.status}</span>
                </div>

                <p
                  className="text-sm leading-7 text-muted"
                  style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                >
                  {issue.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-3 text-xs text-muted">
                  <span className="inline-flex items-center rounded-full bg-surface/55 px-3 py-2">Priority: {issue.smartPriority}</span>
                  <span className="inline-flex items-center rounded-full bg-surface/55 px-3 py-2">Votes: {issue.votes}</span>
                  <span className="inline-flex items-center rounded-full bg-surface/55 px-3 py-2">Area: {issue.neighborhood}</span>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <Link to={`/issues/${issue.id}`} className="rounded-full border border-border/20 px-4 py-2.5 text-sm font-semibold text-text transition hover:border-primary/35">
                    View details
                  </Link>
                  <p className="text-xs text-muted">{new Date(issue.reportedAt).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isEditOpen && (
          <SweetModal onClose={closeEditModal}>
            <form onSubmit={handleSave} className="space-y-3 sm:space-y-4 scroll-smooth">
              <div className="text-center">
                <p className="text-sm uppercase tracking-[0.28em] text-primary">Edit Report</p>
                <h2 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-text">Update your report</h2>
                <p className="mt-1 text-sm leading-7 text-muted">Review the information below and save the updated version.</p>
              </div>

              {/* --- IMAGE UPDATE UI SECTION --- */}
              <label className="block rounded-[20px] sm:rounded-[24px] border border-border/15 bg-surface/40 p-3 sm:p-4">
                <span className="mb-2 sm:mb-3 flex items-center text-sm font-medium text-muted">
                  <Camera className="mr-2 h-4 w-4 text-primary" /> Report image
                </span>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Preview Area */}
                  <div className="flex h-32 sm:h-24 w-full sm:w-40 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface/65">
                    {editPreview ? (
                      <img src={editPreview} alt="Report preview" className="h-full w-full object-cover" />
                    ) : (
                      <ImagePlus className="h-8 w-8 text-muted/60" />
                    )}
                  </div>
                  
                  {/* Change Button */}
                  <div className="w-full">
                    <p className="font-semibold text-text">Update report picture</p>
                    <p className="text-sm text-muted">A clear image helps authorities verify and resolve the issue faster.</p>
                    
                    <label className="mt-3 inline-flex cursor-pointer items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-2.5 text-xs font-semibold text-primary transition hover:bg-primary/15">
                      <ImagePlus className="mr-1.5 h-3.5 w-3.5" />
                      {editFile ? "Change selected image" : "Change image"}
                      <input type="file" accept="image/*" className="hidden" onChange={onEditImageChange} />
                    </label>
                  </div>
                </div>
              </label>
              {/* ------------------------------ */}

              <Field label="Issue Title" value={editForm.title} onChange={(value) => setEditForm((current) => ({ ...current, title: value }))} />
              <Field label="Location / Area" value={editForm.location} onChange={(value) => setEditForm((current) => ({ ...current, location: value }))} />
              
              <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                <Field label="Neighborhood / Block" value={editForm.neighborhood} onChange={(value) => setEditForm((current) => ({ ...current, neighborhood: value }))} />
                <Field label="Authority to notify" value={editForm.authority} onChange={(value) => setEditForm((current) => ({ ...current, authority: value }))} />
              </div>
              
              <label className="block rounded-[20px] sm:rounded-[24px] border border-border/15 bg-surface/40 p-3 sm:p-4">
                <span className="mb-2 sm:mb-3 block text-sm font-medium text-muted">Category</span>
                <select value={editForm.category} onChange={(event) => setEditForm((current) => ({ ...current, category: event.target.value }))} className="w-full bg-transparent text-base text-text outline-none">
                  {categoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              
              <label className="block rounded-[20px] sm:rounded-[24px] border border-border/15 bg-surface/40 p-3 sm:p-4">
                <span className="mb-2 sm:mb-3 block text-sm font-medium text-muted">Description</span>
                <textarea rows={4} value={editForm.description} onChange={(event) => setEditForm((current) => ({ ...current, description: event.target.value }))} className="w-full resize-none bg-transparent text-base text-text outline-none" />
              </label>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={closeEditModal} className="inline-flex items-center justify-center rounded-2xl border border-border/20 px-5 py-3 sm:py-4 font-semibold text-text transition hover:bg-surface/50">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 sm:py-4 font-semibold text-white shadow-glow disabled:opacity-60 transition hover:opacity-95">
                  {isSaving ? "Saving..." : "OK, Update Report"}
                </button>
              </div>
            </form>
          </SweetModal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteOpen && (
          <SweetModal onClose={closeDeleteModal}>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger">
                <Trash2 className="h-7 w-7" />
              </div>
              <p className="mt-5 text-sm uppercase tracking-[0.28em] text-danger">Delete Report</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-text">Remove this report?</h2>
              <p className="mt-3 text-sm leading-7 text-muted">This action will remove the report from your list and from the public feed.</p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={closeDeleteModal} className="inline-flex items-center justify-center rounded-2xl border border-border/20 px-5 py-4 font-semibold text-text transition hover:bg-surface/50">
                Cancel
              </button>
              <button type="button" onClick={handleDelete} disabled={isSaving} className="inline-flex items-center justify-center rounded-2xl bg-danger px-5 py-4 font-semibold text-white disabled:opacity-60 transition hover:opacity-95">
                {isSaving ? "Deleting..." : "OK, Delete"}
              </button>
            </div>
          </SweetModal>
        )}
      </AnimatePresence>
    </section>
  );
};

const Field = ({ label, value, onChange }) => (
  <label className="block rounded-[20px] sm:rounded-[24px] border border-border/15 bg-surface/40 p-3 sm:p-4">
    <span className="mb-2 sm:mb-3 block text-sm font-medium text-muted">{label}</span>
    <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full bg-transparent text-base text-text outline-none" placeholder={label} />
  </label>
);

const SweetModal = ({ children, onClose }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[140] flex items-center justify-center bg-black/45 px-4 backdrop-blur-md" onClick={onClose}>
    <motion.div 
      initial={{ opacity: 0, y: 26, scale: 0.96 }} 
      animate={{ opacity: 1, y: 0, scale: 1 }} 
      exit={{ opacity: 0, y: 18, scale: 0.96 }} 
      transition={{ duration: 0.25, ease: "easeOut" }} 
      className="w-full max-w-2xl max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] rounded-[34px] border border-border/15 bg-elevated/95 p-6 shadow-2xl sm:p-8" 
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </motion.div>
  </motion.div>
);