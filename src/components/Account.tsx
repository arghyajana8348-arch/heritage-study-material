import React, { useState, useEffect } from "react";
import { User, Mail, Key, Shield, AlertCircle, CheckCircle2, ChevronRight, LogOut } from "lucide-react";
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
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const accountName = user?.user_metadata?.full_name || "User";
  const userEmail = user?.email || "No email available";

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-8 pb-24 md:pb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Account Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage your account details and security preferences.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Profile Information
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Account Name
              </label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700">
                <User className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                <span className="text-slate-900 dark:text-white font-medium">{accountName}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700">
                <Mail className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                <span className="text-slate-900 dark:text-white font-medium">{userEmail}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Security
          </h2>

          <div className="space-y-4">
            <form onSubmit={handleUpdatePassword} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                  <Key className="w-4 h-4 text-slate-500" />
                  Change Password
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  Enter a new password to update your account immediately.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="password"
                    placeholder="New Password (min 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={updatePasswordLoading || !newPassword}
                    className={`shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${updatePasswordLoading || !newPassword ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {updatePasswordLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </div>
              </div>
            </form>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 gap-4">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-slate-500" />
                  Reset Password via Email
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  A password reset link will be sent to your email address.
                </p>
              </div>
              <button
                onClick={handleResetPassword}
                disabled={resetPasswordLoading}
                className={`shrink-0 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center ${resetPasswordLoading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {resetPasswordLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 dark:border-slate-600 dark:border-t-slate-300 rounded-full animate-spin"></div>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
            
            {message && (
              <div className={`p-4 rounded-xl flex items-start gap-3 ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'}`}>
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8">
           <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400" />
            Account Actions
          </h2>
          <button
            onClick={onLogout}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl font-semibold transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
