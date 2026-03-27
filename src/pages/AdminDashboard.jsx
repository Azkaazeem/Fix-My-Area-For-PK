import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, CheckCircle2, Clock3, ShieldAlert, Trash2, Search, X, UserRound, MapPin } from "lucide-react"; 
import { issuesApi, authApi, supabase } from "../lib/supabase";
import { useAuth } from "../providers/AuthProvider";

const ADMIN_EMAIL = "admin@gmail.com";

export const AdminDashboard = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const loadAllIssues = async () => {
    setIsLoading(true);
    const { data } = await issuesApi.fetchIssueFeed();
    setIssues(data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated && user?.email === ADMIN_EMAIL) {
      void loadAllIssues();

      const channel = supabase
        .channel('admin-reports-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'FixMyAreaReportTable' }, () => {
          loadAllIssues();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAuthenticated, user]);

  const stats = useMemo(() => {
    const total = issues.length;
    const pending = issues.filter(i => i.status === "Pending").length;
    const inProgress = issues.filter(i => i.status === "In Progress").length;
    const resolved = issues.filter(i => i.status === "Resolved").length;
    return { total, pending, inProgress, resolved };
  }, [issues]);

  const filteredIssues = useMemo(() => {
    if (!searchQuery) return issues;
    const q = searchQuery.toLowerCase();
    return issues.filter(issue => 
      issue.title?.toLowerCase().includes(q) ||
      issue.reporterName?.toLowerCase().includes(q) ||
      issue.location?.toLowerCase().includes(q) ||
      issue.category?.toLowerCase().includes(q) ||
      issue.status?.toLowerCase().includes(q)
    );
  }, [issues, searchQuery]);

  const handleStatusChange = async (e, issueId, newStatus) => {
    e.stopPropagation();
    setIssues(current => current.map(i => i.id === issueId ? { ...i, status: newStatus } : i));
    await issuesApi.updateIssueStatus(issueId, newStatus);
  };

  const handleDelete = async (e, issueId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this report permanently?")) return;
    setIssues(current => current.filter(i => i.id !== issueId));
    await issuesApi.deleteIssueAsAdmin(issueId);
  };

  const openModal = async (issue) => {
    setSelectedIssue(issue);
    setSelectedUser(null);
    if (issue.userId) {
      setLoadingUser(true);
      const { data } = await authApi.fetchCurrentProfile(issue.userId);
      setSelectedUser(data);
      setLoadingUser(false);
    }
  };

  if (authLoading) return <div className="py-20 text-center">Loading...</div>;

  if (!isAuthenticated || user?.email !== ADMIN_EMAIL) {
    return (
      <section className="section-shell py-16 text-center">
        <div className="glass-panel mx-auto max-w-lg rounded-[34px] p-10">
          <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-danger" />
          <h1 className="font-display text-3xl font-semibold text-text">Access Denied</h1>
          <p className="mt-3 text-sm text-muted">You do not have administrator privileges to view this page.</p>
          <Link to="/" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 font-semibold text-white">Go Home</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section-shell py-10 md:py-16">

      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-primary">Command Center</p>
          <h1 className="heading-lg mt-3">Admin Dashboard</h1>
          <p className="mt-2 text-muted">Manage civic reports, update statuses, and monitor community issues.</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
          <input
            type="text"
            placeholder="Search reports or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-border/20 bg-surface/40 py-3 pl-12 pr-4 text-sm outline-none transition focus:border-primary/50 focus:bg-surface/80 text-text"
          />
        </div>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Reports" value={stats.total} icon={Activity} color="text-primary" bg="bg-primary/10" />
        <StatCard title="Pending" value={stats.pending} icon={Clock3} color="text-accent" bg="bg-accent/10" />
        <StatCard title="In Progress" value={stats.inProgress} icon={Activity} color="text-secondary" bg="bg-secondary/10" />
        <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle2} color="text-success" bg="bg-success/10" />
      </div>

      <div className="glass-panel overflow-hidden rounded-[30px] p-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted">
            <thead className="border-b border-border/15 bg-surface/40 text-xs uppercase tracking-wider text-text">
              <tr>
                <th className="px-6 py-5 font-semibold">Report Info</th>
                <th className="px-6 py-5 font-semibold">Location</th>
                <th className="px-6 py-5 font-semibold">Priority</th>
                <th className="px-6 py-5 font-semibold text-center">Status Control</th>
                <th className="px-6 py-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {isLoading ? (
                <tr><td colSpan="5" className="py-10 text-center">Loading reports...</td></tr>
              ) : filteredIssues.length === 0 ? (
                <tr><td colSpan="5" className="py-10 text-center">No reports match your search.</td></tr>
              ) : (
                filteredIssues.map((issue) => (
                  <motion.tr 
                    key={issue.id} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    onClick={() => openModal(issue)}
                    className="cursor-pointer transition-colors hover:bg-surface/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={issue.imageUrl} alt="" className="h-12 w-12 rounded-xl object-cover" />
                        <div>
                          <p className="font-semibold text-text">{issue.title}</p>
                          <p className="text-xs">{issue.category} • by {issue.reporterName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{issue.location}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-surface/50 px-3 py-1 font-semibold text-text">{issue.smartPriority}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <select 
                        value={issue.status}
                        onChange={(e) => handleStatusChange(e, issue.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()} // Click karne pe modal na khule
                        className={`rounded-full border border-border/20 px-3 py-1.5 text-xs font-semibold outline-none transition ${
                          issue.status === "Pending" ? "bg-accent/10 text-accent" : 
                          issue.status === "In Progress" ? "bg-primary/10 text-primary" : 
                          "bg-success/10 text-success"
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={(e) => handleDelete(e, issue.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-danger/10 hover:text-danger">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedIssue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[34px] border border-border/20 bg-elevated p-6 sm:p-10 shadow-2xl"
            >
              <button 
                onClick={() => setSelectedIssue(null)}
                className="absolute right-6 top-6 inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface/80 text-muted transition hover:text-text hover:bg-border/20"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6 border-b border-border/10 pb-6">
                <h2 className="font-display text-2xl font-semibold text-text">Report Details</h2>
                <div className="mt-4 grid gap-6 sm:grid-cols-2 items-center">
                  <img src={selectedIssue.imageUrl} alt="Issue" className="h-40 w-full rounded-2xl object-cover border border-border/15" />
                  <div className="space-y-2 text-sm text-muted">
                    <p><strong className="text-text">Title:</strong> {selectedIssue.title}</p>
                    <p><strong className="text-text">Category:</strong> {selectedIssue.category}</p>
                    <p><strong className="text-text">Status:</strong> <span className={selectedIssue.status === 'Resolved' ? 'text-success' : 'text-primary'}>{selectedIssue.status}</span></p>
                    <p><strong className="text-text">Votes:</strong> {selectedIssue.votes}</p>
                    <p><strong className="text-text">Priority Score:</strong> {selectedIssue.smartPriority}</p>
                    <p className="flex gap-1"><MapPin className="h-4 w-4 text-primary shrink-0" /> {selectedIssue.location}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-muted bg-surface/40 p-4 rounded-2xl">
                    <strong className="text-text block mb-1">Description:</strong> {selectedIssue.description}
                </div>
              </div>

              <div>
                <h2 className="font-display text-xl font-semibold text-text flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-primary" /> Reporter Profile
                </h2>
                <div className="mt-4 rounded-[24px] bg-surface/40 p-5 text-sm text-muted">
                  {loadingUser ? (
                    <p className="animate-pulse">Loading user data...</p>
                  ) : selectedUser ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <p><strong className="text-text">Name:</strong> {selectedUser.full_name || 'Not provided'}</p>
                      <p><strong className="text-text">Email:</strong> {selectedUser.email}</p>
                      <p><strong className="text-text">Phone:</strong> {selectedUser.phone_number || 'Not provided'}</p>
                      <p><strong className="text-text">CNIC:</strong> {selectedUser.cnic_number || 'Not provided'}</p>
                      <p><strong className="text-text">DOB:</strong> {selectedUser.date_of_birth || 'Not provided'}</p>
                    </div>
                  ) : (
                    <p>This is a citizen report (No profile attached or user deleted).</p>
                  )}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

const StatCard = ({ title, value, icon: Icon, color, bg }) => (
  <div className="glass-panel flex items-center gap-4 rounded-[24px] p-6">
    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${bg} ${color}`}>
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <p className="text-sm font-medium text-muted">{title}</p>
      <p className="font-display text-2xl font-semibold text-text">{value}</p>
    </div>
  </div>
);