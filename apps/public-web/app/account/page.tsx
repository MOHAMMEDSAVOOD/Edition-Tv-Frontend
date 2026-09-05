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
    userId: session?.username || "reader",
    fullName: session?.username || "Standard Subscriber",
    email: `${session?.username || "reader"}@editiontv.com`,
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    bio: "Verified Edition TV subscriber.",
    subscriptionTier: "Digital Premium Subscriber",
    renewalDate: "2027-01-15",
    createdAt: "",
    updatedAt: "",
  };

  return (
    <div className="min-h-screen bg-slate-50  py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {notice && (
          <div className="p-4 bg-emerald-50  border border-emerald-200  text-emerald-800  text-sm font-semibold rounded-xl">
            {notice}
          </div>
        )}

        <div className="bg-white  rounded-2xl border border-slate-200  p-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100  pb-6">
            <div className="flex items-center gap-4">
              {activeUser.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeUser.avatarUrl}
                  alt={activeUser.fullName}
                  className="w-16 h-16 rounded-full object-cover border border-slate-200 "
                />
              ) : null}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block px-3 py-0.5 bg-emerald-100  text-emerald-800  rounded-full text-xs font-semibold uppercase tracking-wider">
                    Active Subscriber
                  </span>
                  <span className="text-xs font-mono text-slate-400">@{session?.username || activeUser.userId}</span>
                </div>
                <h1 className="text-3xl font-serif font-bold text-slate-900 ">
                  {activeUser.fullName}
                </h1>
                <p className="text-slate-500 text-sm">{activeUser.email}</p>
                {activeUser.bio && (
                  <p className="text-slate-600  text-xs mt-1 italic">
                    {activeUser.bio}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditing(!editing)}
                className="px-4 py-2 bg-slate-900  text-white  text-sm font-semibold rounded-lg hover:opacity-90 transition"
              >
                {editing ? "Cancel Edit" : "Edit Profile"}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 border border-slate-300  text-slate-600  rounded-lg hover:bg-slate-100 :bg-slate-800 transition"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="space-y-4 pt-6">
              <div>
                <label className="block text-xs uppercase font-semibold text-slate-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300  bg-white  rounded-lg text-sm text-slate-900 "
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-semibold text-slate-500 mb-1">
                  Email Address (Read-only)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  readOnly
                  className="w-full px-3 py-2 border border-slate-200  bg-slate-100  rounded-lg text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-semibold text-slate-500 mb-1">
                  Bio / Tagline
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300  bg-white  rounded-lg text-sm text-slate-900  h-20"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-semibold text-slate-500 mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300  bg-white  rounded-lg text-sm text-slate-900 "
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50"
                >
                  {saving ? "Saving Changes..." : "Save Profile"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 border border-slate-300  text-slate-700  text-sm font-semibold rounded-lg hover:bg-slate-100 :bg-slate-800 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <div>
                <div className="text-xs uppercase text-slate-400 font-semibold mb-1">Plan</div>
                <div className="text-base font-bold text-slate-900 ">
                  {activeUser.subscriptionTier}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase text-slate-400 font-semibold mb-1">Renewal Date</div>
                <div className="text-base font-bold text-slate-900 ">
                  {activeUser.renewalDate}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase text-slate-400 font-semibold mb-1">Status</div>
                <div className="text-base font-bold text-emerald-600  flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" /> Auto-Renew Enabled
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white  rounded-2xl border border-slate-200  p-8 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-serif font-bold text-slate-900 ">
              Account Security & Credentials
            </h2>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-semibold text-sky-600 hover:text-sky-500"
            >
              Reset Account Password
            </Link>
          </div>
          <p className="text-slate-500 text-sm">
            Manage your credentials, security settings, or trigger a secure password reset request token.
          </p>
        </div>
      </div>
    </div>
  );
}
