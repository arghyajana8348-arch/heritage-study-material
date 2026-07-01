import { useState, FormEvent, useEffect } from "react";
import { motion } from "motion/react";
import { BookOpen } from "lucide-react";
import { supabase } from "../lib/supabase";

interface LoginProps {
  onLogin: (email: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google.");
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        onLogin(session.user.email);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        onLogin(session.user.email);
      }
    });

    return () => subscription.unsubscribe();
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
        if (data?.session?.user?.email) {
           onLogin(data.session.user.email);
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
      } else if (data?.session?.user?.email) {
        onLogin(data.session.user.email);
      }
    }

    setLoading(false);
  };

  return (
    <div className="h-full w-full flex flex-col md:flex-row bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Decorative side for desktop */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] bg-indigo-700 items-center justify-center relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-900 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 opacity-60"></div>

        {/* Optional subtle grid pattern overlay (can use CSS but sticking to Tailwind background utilities here if possible) */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="relative z-10 p-12 lg:p-20 text-white max-w-2xl flex flex-col justify-center h-full">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-2xl">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-[1.1] tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-indigo-100">
            Your gateway to <br />
            academic excellence.
          </h1>
          <p className="text-xl text-indigo-100/90 leading-relaxed max-w-lg font-medium">
            Access study materials, interactive quizzes, and comprehensive mind
            maps structured specifically for Heritage Institute students.
          </p>
        </div>
      </div>

      <div className="h-full w-full md:w-1/2 lg:w-[45%] flex flex-col justify-center px-6 md:px-12 lg:px-24 bg-white dark:bg-slate-900 transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm mx-auto"
        >
          <div className="md:hidden w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-100 dark:border-indigo-800">
            <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 text-center">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed text-center font-medium text-sm">
            {isSignUp 
              ? "Join the future of note-taking." 
              : "Enter your credentials to access your AI workspace."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setError("");
                  }}
                  placeholder="Full Name"
                  className="w-full pl-11 pr-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-600/10 dark:focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                  required
                />
              </div>
            )}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="name@example.com"
                className="w-full pl-11 pr-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-600/10 dark:focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                required
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder={isSignUp ? "Create a password" : "Enter your password"}
                className="w-full pl-11 pr-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-600/10 dark:focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                required
              />
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between mt-2 mb-4">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-slate-900 focus:ring-2 dark:bg-slate-800 dark:border-slate-700"
                  />
                  <label htmlFor="remember-me" className="ml-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    Remember me
                  </label>
                </div>
                <button type="button" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-2 font-medium text-center">
                {error}
              </p>
            )}
            {successMsg && (
              <p className="text-emerald-500 dark:text-emerald-400 text-sm mt-2 font-medium text-center">
                {successMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-indigo-600 dark:bg-indigo-500 text-white font-semibold py-3.5 rounded-3xl hover:bg-indigo-700 dark:hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isSignUp ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </button>
            
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink-0 mx-4 text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 px-2 rounded">OR</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold py-3.5 px-4 border border-slate-200 dark:border-slate-800 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-sm"
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
            
            <div className="text-center mt-8">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </button>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
