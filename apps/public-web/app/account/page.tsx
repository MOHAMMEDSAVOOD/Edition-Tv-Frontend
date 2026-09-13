"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { userRepository, UserProfileData } from "@/repositories/userRepository";
import { authService, UserSession } from "@/services/authService";
import { LogOut, User, ShieldCheck } from "lucide-react";

export default function AccountPage() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    bio: "",
    avatarUrl: "",
  });
  const [notice, setNotice] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const activeSession = authService.getCurrentSession();
      setSession(activeSession);

      if (activeSession) {
        const data = await userRepository.fetchUserProfile();
        if (data) {
          setProfile(data);
          setFormData({
            fullName: data.fullName || "",
            email: data.email || "",
            bio: data.bio || "",
            avatarUrl: data.avatarUrl || "",
          });
        }
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotice("");
    const updated = await userRepository.updateUserProfile(formData);
    if (updated) {
      setProfile(updated);
      setEditing(false);
      setNotice("Profile updated successfully!");
    } else {
      setNotice("Failed to update profile. Please check connectivity.");
    }
    setSaving(false);
  };

  const handleLogout = () => {
    authService.logout();
    setProfile(null);
    setSession(null);
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50  py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-48 bg-white  rounded-2xl animate-pulse border border-slate-200  p-8" />
        </div>
      </div>
    );
  }

  if (!session && !profile) {
    return (
      <div className="min-h-screen bg-slate-50  py-16 px-4">
        <div className="max-w-md mx-auto bg-white  rounded-2xl border border-slate-200  p-8 shadow-sm text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100  text-slate-600 ">
            <User className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 ">Reader Account</h1>
          <p className="text-sm text-slate-500 ">
            Please log in with your Edition TV reader credentials to access your profile and security preferences.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/auth/login"
              className="w-full py-2.5 bg-primary text-black font-extrabold text-sm rounded-lg hover:opacity-90 transition text-center"
            >
              Sign In to Your Account
            </Link>
            <Link
              href="/auth/register"
              className="w-full py-2.5 border border-slate-300  text-slate-700  font-semibold text-sm rounded-lg hover:bg-slate-100 :bg-slate-800 transition text-center"
            >
              Create New Reader Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeUser = profile || {
    userId: session?.username || "",
    fullName: session?.username || "",
    email: "",
    avatarUrl: "",
    bio: "",
    subscriptionTier: "Standard Reader",
    renewalDate: "",
    createdAt: "",
    updatedAt: "",
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background py-6 sm:py-10 md:py-16 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {notice && (
          <div className="p-3.5 sm:p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold rounded-xl">
            {notice}
          </div>
        )}

        <div className="bg-white dark:bg-card rounded-2xl border border-slate-200 dark:border-border p-4 sm:p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 border-b border-slate-100 dark:border-border/60 pb-5 sm:pb-6">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              {activeUser.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeUser.avatarUrl}
                  alt={activeUser.fullName}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border border-slate-200 dark:border-border shrink-0"
                />
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-lg sm:text-xl font-serif border border-primary/20 shrink-0">
                  {(activeUser.fullName || activeUser.userId || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                  <span className="inline-block px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                    Active Subscriber
                  </span>
                  <span className="text-xs font-mono text-slate-400 dark:text-muted-foreground truncate">
                    @{session?.username || activeUser.userId}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate-900 dark:text-foreground truncate">
                  {activeUser.fullName}
                </h1>
                <p className="text-slate-500 dark:text-muted-foreground text-xs sm:text-sm truncate">
                  {activeUser.email}
                </p>
                {activeUser.bio && (
                  <p className="text-slate-600 dark:text-slate-300 text-xs mt-1 italic line-clamp-2">
                    {activeUser.bio}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-1 sm:pt-0">
              <button
                onClick={() => setEditing(!editing)}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-900 dark:bg-primary text-white dark:text-black text-xs sm:text-sm font-semibold rounded-lg hover:opacity-90 transition text-center"
              >
                {editing ? "Cancel Edit" : "Edit Profile"}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 border border-slate-300 dark:border-border text-slate-600 dark:text-muted-foreground rounded-lg hover:bg-slate-100 dark:hover:bg-muted transition shrink-0"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="space-y-4 pt-6">
              <div>
                <label className="block text-xs uppercase font-semibold text-slate-500 dark:text-muted-foreground mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-border bg-white dark:bg-background rounded-lg text-sm text-slate-900 dark:text-foreground focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-semibold text-slate-500 dark:text-muted-foreground mb-1">
                  Email Address (Read-only)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  readOnly
                  className="w-full px-3 py-2 border border-slate-200 dark:border-border bg-slate-100 dark:bg-muted/40 rounded-lg text-sm text-slate-500 dark:text-muted-foreground cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-semibold text-slate-500 dark:text-muted-foreground mb-1">
                  Bio / Tagline
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-border bg-white dark:bg-background rounded-lg text-sm text-slate-900 dark:text-foreground h-20 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-semibold text-slate-500 dark:text-muted-foreground mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-border bg-white dark:bg-background rounded-lg text-sm text-slate-900 dark:text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-primary text-black font-semibold text-sm rounded-lg transition disabled:opacity-50"
                >
                  {saving ? "Saving Changes..." : "Save Profile"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-border text-slate-700 dark:text-muted-foreground text-sm font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-muted transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 pt-5 sm:pt-6">
              <div className="p-3 sm:p-0 bg-slate-50 dark:bg-muted/30 sm:bg-transparent rounded-lg">
                <div className="text-[10px] sm:text-xs uppercase text-slate-400 dark:text-muted-foreground font-semibold mb-1">Plan</div>
                <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-foreground">
                  {activeUser.subscriptionTier}
                </div>
              </div>
              <div className="p-3 sm:p-0 bg-slate-50 dark:bg-muted/30 sm:bg-transparent rounded-lg">
                <div className="text-[10px] sm:text-xs uppercase text-slate-400 dark:text-muted-foreground font-semibold mb-1">Renewal Date</div>
                <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-foreground">
                  {activeUser.renewalDate}
                </div>
              </div>
              <div className="p-3 sm:p-0 bg-slate-50 dark:bg-muted/30 sm:bg-transparent rounded-lg">
                <div className="text-[10px] sm:text-xs uppercase text-slate-400 dark:text-muted-foreground font-semibold mb-1">Status</div>
                <div className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" /> Auto-Renew Enabled
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-card rounded-2xl border border-slate-200 dark:border-border p-4 sm:p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-3">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900 dark:text-foreground">
              Account Security & Credentials
            </h2>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-semibold text-primary hover:underline shrink-0"
            >
              Reset Account Password →
            </Link>
          </div>
          <p className="text-slate-500 dark:text-muted-foreground text-xs sm:text-sm leading-relaxed">
            Manage your credentials, security settings, or trigger a secure password reset request token.
          </p>
        </div>
      </div>
    </div>
  );
}
