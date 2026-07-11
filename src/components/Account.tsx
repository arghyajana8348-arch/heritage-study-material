import React, { useState, useEffect } from "react";
import { User, Mail, Key, Shield, AlertCircle, CheckCircle2, LogOut } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Account({ onLogout }: { onLogout: () => void }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [updatePasswordLoading, setUpdatePasswordLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    
    setResetPasswordLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setMessage({ type: "success", text: "Password reset link sent to your email!" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to send reset link." });
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long." });
      return;
    }

    setUpdatePasswordLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMessage({ type: "success", text: "Password updated successfully!" });
      setNewPassword("");
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to update password." });
    } finally {
      setUpdatePasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const accountName = user?.user_metadata?.full_name || "User";
  const userEmail = user?.email || "No email available";

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-8 pb-24 md:pb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-950 dark:text-white uppercase italic tracking-wide mb-2">
          Account Settings
        </h1>
        <p className="text-slate-655 dark:text-slate-450 font-bold text-sm uppercase tracking-wide">
          Manage your account details and security preferences.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] overflow-hidden">
        <div className="p-6 md:p-8 border-b-[3px] border-slate-950 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-950 dark:text-white uppercase italic mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-[#FF603D] shrink-0 stroke-[2.5px]" />
            Profile Information
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 dark:text-slate-400 mb-2">
                Account Name
              </label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-3.5 border-2 border-slate-950">
                <User className="w-5 h-5 text-slate-950 mr-3 shrink-0 stroke-[2px]" />
                <span className="text-slate-950 dark:text-white font-bold">{accountName}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-500 dark:text-slate-400 mb-2">
                Email Address
              </label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-3.5 border-2 border-slate-950">
                <Mail className="w-5 h-5 text-slate-950 mr-3 shrink-0 stroke-[2px]" />
                <span className="text-slate-950 dark:text-white font-bold">{userEmail}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 border-b-[3px] border-slate-950 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-950 dark:text-white uppercase italic mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#C19BF5] shrink-0 stroke-[2.5px]" />
            Security
          </h2>

          <div className="space-y-6">
            <form onSubmit={handleUpdatePassword} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-slate-950 space-y-4 shadow-[3px_3px_0px_0px_#000]">
              <div>
                <h3 className="font-extrabold text-slate-950 dark:text-white flex items-center gap-2 mb-1.5 uppercase italic">
                  <Key className="w-4 h-4 text-slate-950 stroke-[2px]" />
                  Change Password
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-450 mb-4">
                  Enter a new password to update your account immediately.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="password"
                    placeholder="New Password (min 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-950 border-2 border-slate-950 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-950 dark:text-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={updatePasswordLoading || !newPassword}
                    className="shrink-0 px-5 py-2.5 bg-[#FF603D] text-slate-950 border-2 border-slate-950 rounded-xl text-sm font-black shadow-[2px_2px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all cursor-pointer uppercase tracking-wide"
                  >
                    {updatePasswordLoading ? (
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </div>
              </div>
            </form>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-slate-950 gap-4 shadow-[3px_3px_0px_0px_#000]">
              <div>
                <h3 className="font-extrabold text-slate-950 dark:text-white flex items-center gap-2 uppercase italic">
                  <Key className="w-4 h-4 text-slate-950 stroke-[2px]" />
                  Reset Password via Email
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-450 mt-1.5 leading-relaxed">
                  A password reset link will be sent to your registered email address.
                </p>
              </div>
              <button
                onClick={handleResetPassword}
                disabled={resetPasswordLoading}
                className="shrink-0 px-5 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-950 rounded-xl text-sm font-black text-slate-950 dark:text-white shadow-[2px_2px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all cursor-pointer uppercase tracking-wide"
              >
                {resetPasswordLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
            
            {message && (
              <div className={`p-4 rounded-xl border-2 flex items-start gap-3 ${
                message.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
                  : 'bg-red-50 border-red-500 text-red-800'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 stroke-[2.5px]" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 stroke-[2.5px]" />
                )}
                <p className="text-sm font-black uppercase tracking-wide">{message.text}</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-900/60">
           <h2 className="text-xl font-black text-slate-950 dark:text-white mb-6 flex items-center gap-2 uppercase italic">
            <AlertCircle className="w-6 h-6 text-red-655 dark:text-red-400 stroke-[2.5px]" />
            Danger Zone
          </h2>
          <button
            onClick={onLogout}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-red-100 dark:bg-red-500/20 text-red-655 dark:text-red-400 border-2 border-red-500 rounded-xl font-black shadow-[3px_3px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all cursor-pointer uppercase tracking-wider text-xs"
          >
            <LogOut className="w-4 h-4 stroke-[2.5px]" />
            Sign Out of Account
          </button>
        </div>
      </div>
    </div>
  );
}
