import { createClient } from "@supabase/supabase-js";
import { calculateIssuePriority, getPriorityBreakdown } from "../utils/priority";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const EMERGENCY_CATEGORIES = ["Fire", "Severe Accident", "Theft"];
const PROFILE_BUCKET = "FixMyAreaProfielPicBucket";
const PROFILE_TABLE = "FixMyAreaUserTable";
const REPORT_TABLE = "FixMyAreaReportTable";
const REPORT_BUCKET = "FixMyAreaReportBucket";
const VOTE_TABLE = "FixMyAreaVoteTable";

const getPublicUrl = (bucket, path) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

const createPlaceholderImage = (category = "Report") => {
  const label = encodeURIComponent(category);
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient></defs><rect width="1200" height="800" fill="url(%23g)"/><circle cx="980" cy="160" r="140" fill="rgba(255,255,255,0.08)"/><circle cx="200" cy="620" r="180" fill="rgba(34,197,94,0.12)"/><text x="90" y="390" fill="white" font-size="74" font-family="Arial, sans-serif" font-weight="700">${label}</text><text x="90" y="470" fill="rgba(255,255,255,0.72)" font-size="34" font-family="Arial, sans-serif">Fix My Area civic report</text></svg>`;
};

const extractBucketPath = (value, bucket) => {
  if (!value) return "";
  if (!value.startsWith("http")) return value;

  const marker = `${bucket}/`;
  const markerIndex = value.indexOf(marker);
  if (markerIndex === -1) return "";

  return decodeURIComponent(value.slice(markerIndex + marker.length).split("?")[0]);
};

const resolveBucketAssetUrl = async (bucket, value) => {
  if (!supabase || !value) return null;
  if (value.startsWith("blob:") || value.startsWith("data:")) return value;

  const path = extractBucketPath(value, bucket);
  if (!path) return value;

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) return value;
  return data.signedUrl;
};

const uploadProfilePicture = async (userId, file) => {
  if (!supabase || !file) return null;

  const path = `profiles/${userId}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const { error } = await supabase.storage.from(PROFILE_BUCKET).upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  return getPublicUrl(PROFILE_BUCKET, path);
};

const uploadIssueImages = async (files = [], userId = "public") => {
  if (!supabase || files.length === 0) return [];

  return Promise.all(
    files.map(async (file) => {
      const path = `reports/${userId}/${crypto.randomUUID()}-${file.name.replace(/\s+/g, "-")}`;
      const { error } = await supabase.storage.from(REPORT_BUCKET).upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      return getPublicUrl(REPORT_BUCKET, path);
    })
  );
};

const syncUserProfile = async (userId, payload, profilePictureUrl = null) => {
  if (!supabase || !userId) return null;

  const row = {
    id: userId,
    full_name: payload.fullName,
    date_of_birth: payload.dateOfBirth || null,
    email: payload.email,
    phone_number: payload.phoneNumber || null,
    cnic_number: payload.cnicNumber || null,
    provider: payload.provider || "email",
    is_profile_complete: true
  };

  if (profilePictureUrl) row.profile_picture_url = profilePictureUrl;

  const { data, error } = await supabase.from(PROFILE_TABLE).upsert(row, { onConflict: "id" }).select().single();
  if (error) throw error;
  return data;
};

const buildTimeline = (issue) => {
  const reportedAt = issue.reported_at ?? issue.reportedAt ?? new Date().toISOString();
  const status = issue.status ?? "Pending";
  const timeline = [
    {
      timestamp: new Date(reportedAt).toLocaleString("en-PK", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
      label: "Report submitted",
      detail: "The issue was received and added to the public civic feed."
    }
  ];

  if (status === "In Progress" || status === "Resolved") {
    timeline.push({
      timestamp: "Latest update",
      label: "Assigned for review",
      detail: "The report has been picked up for inspection or routing."
    });
  }

  if (status === "Resolved") {
    timeline.push({
      timestamp: "Completed",
      label: "Issue resolved",
      detail: "The report has been marked resolved by the responsible team."
    });
  }

  return timeline;
};

const normalizeIssue = (issue, voteMap = new Map(), currentUserId = "") => {
  const images = Array.isArray(issue.image_urls) ? issue.image_urls : [];
  const reportedAt = issue.reported_at ?? issue.reportedAt ?? new Date().toISOString();
  const unresolvedDays = Math.max(0, Math.floor((Date.now() - new Date(reportedAt).getTime()) / 86400000));
  
  const votes = voteMap.has(issue.id) ? voteMap.get(issue.id).count : (issue.votes_count || 0);
  
  const isEmergency = issue.is_emergency ?? EMERGENCY_CATEGORIES.includes(issue.category);

  const normalized = {
    id: issue.id,
    userId: issue.user_id,
    title: issue.title,
    description: issue.description,
    category: issue.category,
    votes,
    unresolvedDays,
    isEmergency,
    status: issue.status ?? "Pending",
    reportedAt,
    reporterName: issue.reporter_name ?? "Citizen report",
    location: issue.location_text ?? issue.location ?? "Location not provided",
    imageUrl: images[0] || issue.image_url || issue.imageUrl || createPlaceholderImage(issue.category),
    gallery: images,
    timeline: issue.timeline ?? buildTimeline(issue),
    neighborhood: issue.city ?? issue.neighborhood ?? "Area not added",
    authority: issue.authority ?? "Municipal response team",
    hasUserVoted: Boolean(currentUserId && voteMap.get(issue.id)?.users?.has(currentUserId))
  };

  return {
    ...normalized,
    smartPriority: issue.smart_priority ?? calculateIssuePriority(normalized)
  };
};

const fetchVoteMap = async (issueIds = []) => {
  if (!supabase || issueIds.length === 0) return new Map();

  const { data, error } = await supabase.from(VOTE_TABLE).select("issue_id,user_id").in("issue_id", issueIds);
  if (error || !data) return new Map();

  return data.reduce((map, vote) => {
    const current = map.get(vote.issue_id) ?? { count: 0, users: new Set() };
    current.count += 1;
    current.users.add(vote.user_id);
    map.set(vote.issue_id, current);
    return map;
  }, new Map());
};

const refreshPriorityForIssue = async (issueId) => {
  if (!supabase || !issueId) return;

  const [{ data: report }, voteMap] = await Promise.all([
    supabase.from(REPORT_TABLE).select("*").eq("id", issueId).single(),
    fetchVoteMap([issueId])
  ]);

  if (!report) return;

  // FIX: Asli votes ka number nikalein aur usay database mein update karne ke liye pass karein
  const actualVotes = voteMap.has(issueId) ? voteMap.get(issueId).count : 0;
  report.votes_count = actualVotes; 

  const normalized = normalizeIssue(report, voteMap);
  const smartPriority = calculateIssuePriority(normalized);

  await supabase.from(REPORT_TABLE).update({
    votes_count: actualVotes, // Ab yahan hamesha sahi number save hoga (0 nahi)
    smart_priority: smartPriority,
    updated_at: new Date().toISOString()
  }).eq("id", issueId);
};

export const authApi = {
  async signUp(payload) {
    if (!supabase) return { data: null, error: new Error("Supabase env vars are not configured.") };

    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          full_name: payload.fullName,
          phone_number: payload.phoneNumber,
          cnic_number: payload.cnicNumber,
          date_of_birth: payload.dateOfBirth
        }
      }
    });

    if (error) return { data: null, error };

    if (data.user) {
      const profilePictureUrl = await uploadProfilePicture(data.user.id, payload.profilePicture);
      const profile = await syncUserProfile(data.user.id, payload, profilePictureUrl);
      return { data: { ...data, profile }, error: null };
    }

    return { data, error: null };
  },

  async signIn(email, password) {
    if (!supabase) return { data: null, error: new Error("Supabase env vars are not configured.") };
    return supabase.auth.signInWithPassword({ email, password });
  },

  async signInWithOAuth(provider) {
    if (!supabase) return { data: null, error: new Error("Supabase env vars are not configured.") };
    return supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/auth` } });
  },

  async fetchCurrentProfile(userId) {
    if (!supabase || !userId) return { data: null, error: null };
    return supabase.from(PROFILE_TABLE).select("*").eq("id", userId).maybeSingle();
  },

  async resolveProfileImageUrl(value) {
    return resolveBucketAssetUrl(PROFILE_BUCKET, value);
  },

  async updateProfilePicture(userId, file) {
    if (!supabase) return { data: null, error: new Error("Supabase env vars are not configured.") };
    const profilePictureUrl = await uploadProfilePicture(userId, file);
    return supabase.from(PROFILE_TABLE).update({ profile_picture_url: profilePictureUrl, updated_at: new Date().toISOString() }).eq("id", userId).select().single();
  },

  async updateProfileDetails(userId, payload) {
    if (!supabase) return { data: null, error: new Error("Supabase env vars are not configured.") };

    return supabase
      .from(PROFILE_TABLE)
      .upsert(
        {
          id: userId,
          full_name: payload.fullName,
          email: payload.email,
          phone_number: payload.phoneNumber || null,
          cnic_number: payload.cnicNumber || null,
          date_of_birth: payload.dateOfBirth || null,
          provider: payload.provider || "email",
          is_profile_complete: true,
          updated_at: new Date().toISOString()
        },
        { onConflict: "id" }
      )
      .select()
      .single();
  }
};

export const issuesApi = {
  async createIssue(payload) {
    if (!supabase) return { data: null, error: new Error("Supabase env vars are not configured.") };

    const uploadedImages = await uploadIssueImages(payload.images, payload.userId);
    const issueDraft = {
      category: payload.category,
      votes: 0,
      unresolvedDays: 0,
      isEmergency: EMERGENCY_CATEGORIES.includes(payload.category)
    };

    return supabase.from(REPORT_TABLE).insert({
      user_id: payload.userId,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      is_emergency: issueDraft.isEmergency,
      status: "Pending",
      votes_count: 0,
      smart_priority: calculateIssuePriority(issueDraft),
      image_urls: uploadedImages,
      location_text: payload.location,
      city: payload.neighborhood || null,
      reported_at: new Date().toISOString()
    });
  },

  async fetchIssueFeed({ limit, currentUserId } = {}) {
    if (!supabase) return { data: [], error: new Error("Supabase env vars are not configured.") };

    let query = supabase.from(REPORT_TABLE).select("*").order("smart_priority", { ascending: false }).order("reported_at", { ascending: false });
    if (limit) query = query.limit(limit);

    const response = await query;
    const reports = response.data ?? [];
    const voteMap = await fetchVoteMap(reports.map((item) => item.id));

    return {
      ...response,
      data: reports.map((item) => normalizeIssue(item, voteMap, currentUserId)).sort((left, right) => right.smartPriority - left.smartPriority)
    };
  },

  async fetchIssueById(issueId, currentUserId = "") {
    if (!supabase) return { data: null, error: new Error("Supabase env vars are not configured.") };

    const [{ data, error }, voteMap] = await Promise.all([
      supabase.from(REPORT_TABLE).select("*").eq("id", issueId).maybeSingle(),
      fetchVoteMap(issueId ? [issueId] : [])
    ]);

    return { data: data ? normalizeIssue(data, voteMap, currentUserId) : null, error };
  },

  async fetchUserIssues(userId) {
    if (!supabase) return { data: [], error: new Error("Supabase env vars are not configured.") };
    if (!userId) return { data: [], error: null };

    const response = await supabase.from(REPORT_TABLE).select("*").eq("user_id", userId).order("reported_at", { ascending: false });
    const reports = response.data ?? [];
    const voteMap = await fetchVoteMap(reports.map((item) => item.id));

    return {
      ...response,
      data: reports.map((item) => normalizeIssue(item, voteMap, userId)).sort((left, right) => new Date(right.reportedAt).getTime() - new Date(left.reportedAt).getTime())
    };
  },

  async updateIssue(issueId, userId, payload) {
    if (!supabase) return { data: null, error: new Error("Supabase env vars are not configured.") };
    if (!userId) return { data: null, error: new Error("You need to log in before editing a report.") };

    const issueDraft = {
      category: payload.category,
      votes: payload.votes ?? 0,
      unresolvedDays: payload.unresolvedDays ?? 0,
      isEmergency: EMERGENCY_CATEGORIES.includes(payload.category)
    };

    const response = await supabase
      .from(REPORT_TABLE)
      .update({
        title: payload.title,
        description: payload.description,
        category: payload.category,
        is_emergency: issueDraft.isEmergency,
        location_text: payload.location,
        city: payload.neighborhood || null,
        smart_priority: calculateIssuePriority(issueDraft),
        updated_at: new Date().toISOString()
      })
      .eq("id", issueId)
      .eq("user_id", userId)
      .select()
      .single();

    if (response.error) return response;
    await refreshPriorityForIssue(issueId);
    return response;
  },

  async deleteIssue(issueId, userId) {
    if (!supabase) return { data: null, error: new Error("Supabase env vars are not configured.") };
    if (!userId) return { data: null, error: new Error("You need to log in before deleting a report.") };

    await supabase.from(VOTE_TABLE).delete().eq("issue_id", issueId);
    return supabase.from(REPORT_TABLE).delete().eq("id", issueId).eq("user_id", userId);
  },

  async upvoteIssue(issueId, userId) {
    if (!supabase) return { data: null, error: new Error("Supabase env vars are not configured.") };
    if (!userId) return { data: null, error: new Error("You need to log in before voting.") };

    // Pehle check karein ke vote pehle se mojood hai ya nahi
    const existing = await supabase.from(VOTE_TABLE).select("id").eq("issue_id", issueId).eq("user_id", userId).maybeSingle();

    if (existing.data) {
      // Agar vote pehle se hai, toh isay REMOVE kar dein (Toggle Off)
      const deleteResponse = await supabase.from(VOTE_TABLE).delete().match({ issue_id: issueId, user_id: userId });
      if (deleteResponse.error) return deleteResponse;
    } else {
      // Agar vote nahi hai, toh NAYA ADD kar dein (Toggle On)
      const insertResponse = await supabase.from(VOTE_TABLE).insert({ issue_id: issueId, user_id: userId });
      if (insertResponse.error) return insertResponse;
    }

    // Is function ke zariye database mein total votes_count update hoga, jis se baqi sab users ki screen refresh ho jayegi
    await refreshPriorityForIssue(issueId);
    return { data: { success: true }, error: null };
  } ,

  async updateIssueStatus(issueId, newStatus) {
    if (!supabase) return { data: null, error: new Error("Supabase is not configured.") };
    
    const { data, error } = await supabase
      .from(REPORT_TABLE)
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", issueId)
      .select()
      .single();

    return { data, error };
  },

  async deleteIssueAsAdmin(issueId) {
    if (!supabase) return { data: null, error: new Error("Supabase is not configured.") };
    
    await supabase.from(VOTE_TABLE).delete().eq("issue_id", issueId);
    return supabase.from(REPORT_TABLE).delete().eq("id", issueId);
  }

  
};

export const priorityAlgorithmSql = `
create or replace function public.compute_issue_priority(votes_count int, unresolved_days int, is_emergency boolean)
returns int
language sql
as $$
  select (least(36, round(log(greatest(votes_count, 0) + 1) / log(2) * 12)))
    + (unresolved_days * 2)
    + (case when is_emergency then 45 else 0 end);
$$;
`;

export const explainPriority = (issue) => {
  const breakdown = getPriorityBreakdown(issue);
  return {
    score: breakdown.total,
    formula: breakdown.formula,
    breakdown
  };
};
