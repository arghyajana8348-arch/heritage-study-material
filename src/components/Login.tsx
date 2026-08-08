import { useState, FormEvent, useEffect } from "react";
import { motion } from "motion/react";
import { BookOpen } from "lucide-react";
import { supabase } from "../lib/supabase";

interface LoginProps {
  onLogin: (userOrEmail: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            prompt: "select_account",
          }
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google.");
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then((res) => {
      const user = res?.data?.session?.user;
      if (user) {
        onLogin(user);
      }
    });

    const subRes = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        onLogin(session.user);
      }
    });

    return () => {
      subRes?.data?.subscription?.unsubscribe?.();
    };
  }, [onLogin]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.endsWith("@heritageit.edu.in")) {
      setError("Please use your Heritage Institute email (@heritageit.edu.in)");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        setError(error.message);
      } else {
        if (data?.session?.user) {
           onLogin(data.session.user);
        } else {
           setSuccessMsg("Account created successfully! Please sign in.");
           setIsSignUp(false);
        }
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else if (data?.session?.user) {
        onLogin(data.session.user);
      }
    }

    setLoading(false);
  };

  return (
    <div className="h-full w-full flex flex-col md:flex-row bg-[#BACED6] dark:bg-[#12161A] transition-colors duration-300">
      {/* Decorative side for desktop */}
      <div className="hidden md:flex md:w-[50%] lg:w-[55%] items-center justify-center p-8 lg:p-12 relative overflow-hidden bg-[#BACED6] dark:bg-[#12161A] border-r-[3px] border-slate-950 dark:border-white">
        <div className="relative z-10 flex flex-col gap-6 w-full max-w-lg">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-[#FFD54F] border-[3px] border-slate-950 rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_#000] rotate-[-3deg] shrink-0">
              <BookOpen className="w-7 h-7 text-slate-950 stroke-[3px]" />
            </div>
            <h1 className="text-3xl font-black text-slate-950 dark:text-white uppercase italic tracking-wide">
              HERITAGE STUDY
            </h1>
          </div>

          <div className="space-y-6">
            {/* Feature Card 1 */}
            <div className="bg-[#FFD54F] border-[3px] border-slate-950 p-6 rounded-2xl shadow-[4px_4px_0px_0px_#000] text-slate-950 rotate-[-1.5deg]">
              <h3 className="text-xl font-extrabold mb-1">📖 Structured Resource Library</h3>
              <p className="font-semibold text-sm leading-relaxed opacity-95">
                Syllabus-aligned comprehensive notes, PYQs, and suggestions curated by top students.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-[#C19BF5] border-[3px] border-slate-950 p-6 rounded-2xl shadow-[4px_4px_0px_0px_#000] text-slate-950 rotate-[1.5deg]">
              <h3 className="text-xl font-extrabold mb-1">⚡ Interactive Quizzes</h3>
              <p className="font-semibold text-sm leading-relaxed opacity-95">
                Quick 10-question checkpoints for every module to test your understanding.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-[#FF603D] border-[3px] border-slate-950 p-6 rounded-2xl shadow-[4px_4px_0px_0px_#000] text-slate-950 rotate-[-1deg]">
              <h3 className="text-xl font-extrabold mb-1">🗺️ Visual Concept Maps</h3>
              <p className="font-semibold text-sm leading-relaxed opacity-95">
                Interconnected mind maps and formula sheets to master relationships.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="h-full w-full md:w-[50%] lg:w-[45%] flex flex-col justify-center px-6 py-12 md:py-0 md:px-12 lg:px-20 bg-[#BACED6] dark:bg-[#12161A] transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white p-6 md:p-8 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]"
        >
          <div className="md:hidden w-14 h-14 bg-[#FFD54F] border-[3px] border-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[3px_3px_0px_0px_#000]">
            <BookOpen className="w-7 h-7 text-slate-950 stroke-[3px]" />
          </div>

          <h1 className="text-3xl font-black text-slate-950 dark:text-white mb-2 text-center uppercase tracking-wide">
            {isSignUp ? "CREATE ACCOUNT" : "WELCOME BACK"}
          </h1>
          <p className="text-slate-650 dark:text-slate-400 mb-6 leading-relaxed text-center font-bold text-sm">
            {isSignUp 
              ? "Join the ultimate note-taking platform." 
              : "Access your AI-powered workspace."}
          </p>

          {!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-500 rounded-xl text-xs text-amber-800 dark:text-amber-400 font-semibold text-left">
              <span className="font-extrabold uppercase text-amber-900 dark:text-amber-300 block mb-1">⚠️ Supabase Config Required</span>
              This application requires Supabase connection keys to handle authentication and bookmarks. Please configure <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong> in your Vercel project environment variables, then redeploy!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="relative">
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setError("");
                  }}
                  placeholder="Full Name"
                  className="w-full px-4 py-3.5 border-[3px] border-slate-950 dark:border-white bg-white dark:bg-slate-950 text-slate-950 dark:text-white rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] focus:outline-none focus:translate-x-0.5 focus:translate-y-0.5 transition-all font-bold placeholder:text-slate-500"
                  required
                />
              </div>
            )}
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="college-email@heritageit.edu.in"
                className="w-full px-4 py-3.5 border-[3px] border-slate-950 dark:border-white bg-white dark:bg-slate-950 text-slate-950 dark:text-white rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] focus:outline-none focus:translate-x-0.5 focus:translate-y-0.5 transition-all font-bold placeholder:text-slate-500"
                required
              />
            </div>
            
            <div className="relative">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder={isSignUp ? "Create Password" : "Password"}
                className="w-full px-4 py-3.5 border-[3px] border-slate-950 dark:border-white bg-white dark:bg-slate-950 text-slate-950 dark:text-white rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] focus:outline-none focus:translate-x-0.5 focus:translate-y-0.5 transition-all font-bold placeholder:text-slate-500"
                required
              />
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between mt-3 mb-4">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-slate-950 bg-white border-2 border-slate-950 rounded focus:ring-0 checked:bg-slate-950 cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 text-xs font-bold text-slate-650 dark:text-slate-400 select-none">
                    Remember me
                  </label>
                </div>
                <button type="button" className="text-xs font-bold text-slate-950 dark:text-slate-300 hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <p className="text-red-650 dark:text-red-400 text-sm mt-2 font-bold text-center border-2 border-red-500 p-2.5 bg-red-50 dark:bg-red-950/20 rounded-xl">
                ⚠️ {error}
              </p>
            )}
            {successMsg && (
              <p className="text-emerald-700 dark:text-emerald-400 text-sm mt-2 font-bold text-center border-2 border-emerald-500 p-2.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl">
                ✅ {successMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#FFD54F] border-[3px] border-slate-950 text-slate-950 font-black py-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : isSignUp ? (
                "CREATE ACCOUNT"
              ) : (
                "SIGN IN"
              )}
            </button>
            
            <div className="flex items-center my-6">
              <div className="flex-grow border-t-2 border-slate-950 dark:border-slate-800"></div>
              <span className="flex-shrink-0 mx-4 text-xs font-black text-slate-400 bg-white dark:bg-slate-900 px-2 rounded">OR</span>
              <div className="flex-grow border-t-2 border-slate-950 dark:border-slate-800"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white dark:bg-slate-900 text-slate-950 dark:text-white font-black py-4 px-4 border-[3px] border-slate-950 dark:border-white rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              CONTINUE WITH GOOGLE
            </button>
            
            <div className="text-center mt-8">
              <p className="text-sm font-bold text-slate-650 dark:text-slate-400">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="text-slate-950 dark:text-white font-extrabold hover:underline"
                >
                  {isSignUp ? "SIGN IN" : "SIGN UP"}
                </button>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
