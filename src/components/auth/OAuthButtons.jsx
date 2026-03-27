import { FaFacebookF, FaGoogle } from "react-icons/fa";
import { authApi } from "../../lib/supabase";

export const OAuthButtons = () => {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => void authApi.signInWithOAuth("google")}
        className="inline-flex items-center justify-center rounded-2xl border border-border/20 bg-elevated/55 px-4 py-3.5 font-medium text-text transition hover:-translate-y-0.5 hover:border-primary/35"
      >
        <FaGoogle className="mr-2 text-[#ea4335]" />
        Continue with Google
      </button>
      <button
        type="button"
        onClick={() => void authApi.signInWithOAuth("facebook")}
        className="inline-flex items-center justify-center rounded-2xl border border-border/20 bg-elevated/55 px-4 py-3.5 font-medium text-text transition hover:-translate-y-0.5 hover:border-primary/35"
      >
        <FaFacebookF className="mr-2 text-[#1877f2]" />
        Continue with Facebook
      </button>
    </div>
  );
};
