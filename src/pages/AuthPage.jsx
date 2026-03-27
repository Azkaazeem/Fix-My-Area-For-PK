import clsx from "clsx";
import gsap from "gsap";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Camera,
  CheckCircle2,
  CreditCard,
  ImagePlus,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  XCircle
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { OAuthButtons } from "../components/auth/OAuthButtons";
import { authApi, supabase } from "../lib/supabase";
import { useAuth } from "../providers/AuthProvider";
import { formatCnic } from "../utils/cnic";
import { useNavigate } from "react-router-dom";

const signUpSteps = [
  { id: 0, label: "Identity" },
  { id: 1, label: "Contact" },
  { id: 2, label: "Access" }
];

const emptyProfileForm = {
  fullName: "",
  email: "",
  phoneNumber: "",
  cnicNumber: "",
  dateOfBirth: "",
  provider: "email"
};

const formatDateLabel = (value) => {
  if (!value) return "Add your date of birth";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

export const AuthPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("signup");
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileImageSrc, setProfileImageSrc] = useState("");
  const [preview, setPreview] = useState("");
  const [toast, setToast] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [signUpForm, setSignUpForm] = useState({
    fullName: "",
    dateOfBirth: "",
    email: "",
    phoneNumber: "",
    cnicNumber: "",
    password: ""
  });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const panelRef = useRef(null);

  useEffect(() => {
    if (!panelRef.current) return;
    gsap.fromTo(panelRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" });
  }, []);

  useEffect(() => {
    if (!panelRef.current) return;
    gsap.fromTo(panelRef.current.querySelectorAll("[data-auth-pane]"), { opacity: 0, x: mode === "signup" ? 20 : -20 }, { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" });
  }, [mode, step, user]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      if (!user?.id) {
        if (active) {
          setProfile(null);
          setProfileForm(emptyProfileForm);
          setProfileImageSrc("");
        }
        return;
      }

      const { data } = await authApi.fetchCurrentProfile(user.id);
      if (!active) return;
      setProfile(data ?? null);
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || "",
        email: profile?.email || user?.email || user?.user_metadata?.email || "",
        phoneNumber: profile?.phone_number || user?.phone || "",
        cnicNumber: profile?.cnic_number || "",
        dateOfBirth: profile?.date_of_birth || "",
        provider: profile?.provider || user?.app_metadata?.provider || "email"
      });
    } else {
      setProfileForm(emptyProfileForm);
    }
  }, [profile, user]);

  useEffect(() => {
    let active = true;

    const loadImage = async () => {
      if (preview) {
        setProfileImageSrc(preview);
        return;
      }

      const rawImage = profile?.profile_picture_url;
      if (!rawImage) {
        setProfileImageSrc("");
        return;
      }

      const resolved = await authApi.resolveProfileImageUrl(rawImage);
      if (active) {
        setProfileImageSrc(resolved || rawImage);
      }
    };

    void loadImage();

    return () => {
      active = false;
    };
  }, [preview, profile?.profile_picture_url]);

  const showToast = (type, title, description) => setToast({ type, title, description });

  const onPreviewChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setProfileFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await authApi.signUp({ ...signUpForm, profilePicture: profileFile });
      if (error) throw error;
      showToast("success", "Account created", "Your account was created successfully. Check your email if confirmation is required.");
    } catch (error) {
      showToast("error", "Signup failed", error.message || "Something went wrong while creating the account.");
    } finally {
      setIsLoading(false);
    }
  };

const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await authApi.signIn(loginForm.email, loginForm.password);
      if (error) throw error;
      showToast("success", "Welcome back", "You are now logged in to your account.");
      
      // --- REDIRECT LOGIC ---
      // Agar admin ka email hai toh dashboard par bhej dein
      if (loginForm.email.toLowerCase() === "admin@gmail.com") {
        navigate("/admin");
      } else {
        navigate("/"); 
      }

    } catch (error) {
      showToast("error", "Login failed", error.message || "Please check your credentials and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePictureUpdate = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await authApi.updateProfilePicture(user.id, file);
      if (error) throw error;
      setPreview("");
      setProfile(data);
      showToast("success", "Profile updated", "Your new profile picture has been saved.");
    } catch (error) {
      showToast("error", "Update failed", error.message || "Could not update the profile picture.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const payload = { ...profileForm, cnicNumber: formatCnic(profileForm.cnicNumber) };
      const { data, error } = await authApi.updateProfileDetails(user.id, payload);
      if (error) throw error;
      setProfile(data);
      showToast("success", "Profile saved", "Your account details are now updated and visible across the app.");
    } catch (error) {
      showToast("error", "Save failed", error.message || "We could not save your profile details right now.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    showToast("success", "Logged out", "You have been signed out successfully.");
  };

  const accountSnapshot = useMemo(() => {
    if (!user) return [];

    return [
      { label: "Phone", value: profile?.phone_number || user?.phone || "Add your phone number" },
      { label: "CNIC", value: profile?.cnic_number || "Add your CNIC" },
      { label: "Date of Birth", value: formatDateLabel(profile?.date_of_birth || "") },
      { label: "Provider", value: profile?.provider || user?.app_metadata?.provider || "email" }
    ];
  }, [profile, user]);

  return (
    <section className="section-shell py-10 md:py-16">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            className={`fixed right-5 top-5 z-[120] w-full max-w-sm rounded-[24px] border px-5 py-4 shadow-2xl backdrop-blur-xl ${
              toast.type === "success" ? "border-secondary/20 bg-elevated/95" : "border-danger/20 bg-elevated/95"
            }`}
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

      <div ref={panelRef} className="grid overflow-hidden rounded-[36px] border border-border/15 bg-elevated/70 shadow-panel lg:grid-cols-[0.88fr_1.12fr]">
        <div className="border-b border-border/10 p-8 lg:border-b-0 lg:border-r lg:p-12">
          <div className="max-w-md">
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Account</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-balance">Manage your profile with a cleaner, easier account view.</h1>
            <p className="mt-5 text-base leading-8 text-muted">
              Update your details, keep your profile picture current, and make sure your account is ready whenever you report an issue.
            </p>

            <div className="mt-8 space-y-3">
              {[
                "Your latest account details stay available for future reports.",
                "Only your newest profile picture is shown on the page.",
                "Complete identity details make account verification smoother."
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-border/12 bg-surface/35 px-4 py-4 text-sm leading-6 text-muted">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-12">
          {isAuthenticated ? (
            <div data-auth-pane className="space-y-6">
              <div className="rounded-[30px] border border-border/12 bg-surface/45 p-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/12 bg-surface/80">
                      {profileImageSrc ? (
                        <img
                          src={profileImageSrc}
                          alt="Profile"
                          className="h-full w-full object-cover"
                          onError={() => setProfileImageSrc(profile?.profile_picture_url || "")}
                        />
                      ) : (
                        <UserRound className="h-9 w-9 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.28em] text-primary/80">Citizen profile</p>
                      <p className="mt-1 truncate font-display text-[2rem] font-semibold leading-none text-text">{profileForm.fullName || user?.email}</p>
                      <p className="mt-2 truncate text-sm text-muted">{profileForm.email || user?.email}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 md:min-w-[190px]">
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95">
                      <ImagePlus className="mr-2 h-4 w-4" />
                      Update picture
                      <input type="file" accept="image/*" className="hidden" onChange={handleProfilePictureUpdate} />
                    </label>
                    <button type="button" onClick={handleLogout} className="rounded-full border border-border/15 bg-transparent px-4 py-2.5 text-sm font-semibold text-text transition hover:border-border/30">
                      Log out
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {accountSnapshot.map((item) => (
                  <motion.div key={item.label} whileHover={{ y: -3 }} transition={{ duration: 0.18 }} className="rounded-[24px] border border-border/12 bg-surface/42 p-5">
                    <p className="text-xs uppercase tracking-[0.25em] text-muted">{item.label}</p>
                    <p className="mt-4 break-words text-lg font-semibold leading-7 text-text">{item.value}</p>
                  </motion.div>
                ))}
              </div>

              <motion.form onSubmit={handleProfileSave} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-[30px] border border-border/12 bg-surface/45 p-6 sm:p-8">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-primary/80">Edit details</p>
                  <h2 className="mt-2 font-display text-3xl font-semibold text-text">Update your account information</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Review the information below and save any missing details to keep your account complete.</p>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <InputField icon={UserRound} label="Full Name" value={profileForm.fullName} onChange={(value) => setProfileForm((current) => ({ ...current, fullName: value }))} />
                  <InputField icon={Mail} type="email" label="Email" value={profileForm.email} onChange={(value) => setProfileForm((current) => ({ ...current, email: value }))} />
                  <InputField icon={Phone} label="Phone Number" value={profileForm.phoneNumber} onChange={(value) => setProfileForm((current) => ({ ...current, phoneNumber: value }))} />
                  <InputField icon={CreditCard} label="CNIC Number" value={profileForm.cnicNumber} onChange={(value) => setProfileForm((current) => ({ ...current, cnicNumber: formatCnic(value) }))} />
                  <InputField icon={CalendarDays} type="date" label="Date of Birth" value={profileForm.dateOfBirth} onChange={(value) => setProfileForm((current) => ({ ...current, dateOfBirth: value }))} />
                  <ReadOnlyField icon={ShieldCheck} label="Provider" value={profileForm.provider || "email"} />
                </div>

                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-2xl text-sm leading-6 text-muted">Your latest saved values are shown here and synced with your Supabase user table.</p>
                  <button type="submit" disabled={isLoading} className="rounded-2xl bg-primary px-6 py-4 font-semibold text-white transition hover:opacity-95 disabled:opacity-60">
                    {isLoading ? "Saving profile..." : "Save account details"}
                  </button>
                </div>
              </motion.form>
            </div>
          ) : (
            <>
              <div className="mb-6 flex rounded-full border border-border/15 bg-surface/45 p-1">
                {["signup", "login"].map((item) => (
                  <button key={item} onClick={() => setMode(item)} className={clsx("flex-1 rounded-full px-4 py-3 text-sm font-semibold capitalize transition", mode === item ? "bg-primary text-white shadow-glow" : "text-muted")}>
                    {item}
                  </button>
                ))}
              </div>

              {mode === "signup" ? (
                <form data-auth-pane className="space-y-5" onSubmit={handleSignUp}>
                  <div className="flex gap-2 rounded-full border border-border/15 bg-surface/35 p-2">
                    {signUpSteps.map((item) => (
                      <button key={item.id} type="button" onClick={() => setStep(item.id)} className={clsx("flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition", step === item.id ? "bg-primary text-white shadow-glow" : "text-muted")}>
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {step === 0 && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <InputField icon={UserRound} label="Full Name" value={signUpForm.fullName} onChange={(value) => setSignUpForm((current) => ({ ...current, fullName: value }))} />
                      <InputField icon={CalendarDays} type="date" label="Date of Birth" value={signUpForm.dateOfBirth} onChange={(value) => setSignUpForm((current) => ({ ...current, dateOfBirth: value }))} />
                      <label className="block rounded-[24px] border border-border/15 bg-surface/40 p-4 md:col-span-2">
                        <span className="mb-3 flex items-center text-sm font-medium text-muted"><Camera className="mr-2 h-4 w-4 text-primary" />Profile Picture Upload</span>
                        <input type="file" accept="image/*" className="hidden" onChange={onPreviewChange} />
                        <div className="flex items-center gap-4">
                          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-primary/10">{preview ? <img src={preview} alt="Profile preview" className="h-full w-full object-cover" /> : <Camera className="h-8 w-8 text-primary" />}</div>
                          <div>
                            <p className="font-semibold">Upload a profile image</p>
                            <p className="text-sm text-muted">A clearer identity builds trust when urgent reports need verification.</p>
                          </div>
                        </div>
                      </label>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <InputField icon={Mail} type="email" label="Email" value={signUpForm.email} onChange={(value) => setSignUpForm((current) => ({ ...current, email: value }))} />
                      <InputField icon={Phone} label="Phone Number" value={signUpForm.phoneNumber} onChange={(value) => setSignUpForm((current) => ({ ...current, phoneNumber: value }))} />
                      <InputField icon={CreditCard} label="CNIC Number" value={signUpForm.cnicNumber} onChange={(value) => setSignUpForm((current) => ({ ...current, cnicNumber: formatCnic(value) }))} />
                      <div className="rounded-[24px] border border-border/15 bg-surface/40 p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="mt-1 h-5 w-5 text-secondary" />
                          <div>
                            <p className="font-semibold text-text">Pakistan-ready input handling</p>
                            <p className="mt-1 text-sm leading-6 text-muted">CNIC is auto-formatted as `XXXXX-XXXXXXX-X` to keep onboarding clear and consistent.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="grid gap-4">
                      <InputField icon={LockKeyhole} type="password" label="Password" value={signUpForm.password} onChange={(value) => setSignUpForm((current) => ({ ...current, password: value }))} />
                      <div className="rounded-[24px] border border-border/15 bg-surface/40 p-4">
                        <p className="font-semibold text-text">Continue with identity providers</p>
                        <p className="mt-2 text-sm leading-6 text-muted">Choose OAuth or create a password-based account. Both paths land in the same verified citizen profile.</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} className="inline-flex items-center rounded-full border border-border/20 px-4 py-3 text-sm font-semibold text-text transition hover:border-primary/35">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </button>
                    {step < 2 ? (
                      <button type="button" onClick={() => setStep((current) => Math.min(2, current + 1))} className="inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-glow">
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    ) : (
                      <button type="submit" disabled={isLoading} className="rounded-2xl bg-primary px-6 py-4 font-semibold text-white shadow-glow disabled:opacity-60">
                        {isLoading ? "Creating account..." : "Create your account"}
                      </button>
                    )}
                  </div>
                  <OAuthButtons />
                </form>
              ) : (
                <form data-auth-pane className="space-y-5" onSubmit={handleLogin}>
                  <InputField icon={Mail} type="email" label="Email or Username" value={loginForm.email} onChange={(value) => setLoginForm((current) => ({ ...current, email: value }))} />
                  <InputField icon={LockKeyhole} type="password" label="Password" value={loginForm.password} onChange={(value) => setLoginForm((current) => ({ ...current, password: value }))} />
                  <div className="text-right"><button type="button" className="text-sm font-medium text-primary">Forgot Password?</button></div>
                  <button type="submit" disabled={isLoading} className="w-full rounded-2xl bg-primary px-6 py-4 font-semibold text-white shadow-glow disabled:opacity-60">
                    {isLoading ? "Logging in..." : "Login to dashboard"}
                  </button>
                  <OAuthButtons />
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

const InputField = ({ icon: Icon, label, value, onChange, type = "text" }) => (
  <label className="block rounded-[20px] border border-border/12 bg-surface/32 p-4 transition hover:border-border/20 hover:bg-surface/44">
    <span className="mb-3 flex items-center text-sm font-medium text-muted"><Icon className="mr-2 h-4 w-4 text-primary" />{label}</span>
    <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full bg-transparent text-base text-text outline-none placeholder:text-muted/70" placeholder={label} />
  </label>
);

const ReadOnlyField = ({ icon: Icon, label, value }) => (
  <div className="rounded-[20px] border border-border/12 bg-surface/32 p-4">
    <span className="mb-3 flex items-center text-sm font-medium text-muted"><Icon className="mr-2 h-4 w-4 text-primary" />{label}</span>
    <p className="text-base font-medium capitalize text-text">{value}</p>
  </div>
);