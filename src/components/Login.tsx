import { useState, FormEvent, useEffect } from "react";
import { motion } from "motion/react";
import { BookOpen } from "lucide-react";
import { supabase } from "../lib/supabase";

interface LoginProps {
  onLogin: (email: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

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
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccessMsg("Account created successfully!");
        setIsSignUp(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
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
          <div className="md:hidden w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-8 border border-indigo-100 dark:border-indigo-800">
            <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed text-lg">
            {isSignUp 
              ? "Sign up with your Heritage Institute email." 
              : "Sign in with your Heritage Institute email to access your study materials."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >
                Institutional Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="student@heritageit.edu.in"
                className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-600/10 dark:focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                required
              />
            </div>
            
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="••••••••"
                className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-600/10 dark:focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                required
              />
              {error && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-2 font-medium">
                  {error}
                </p>
              )}
              {successMsg && (
                <p className="text-emerald-500 dark:text-emerald-400 text-sm mt-2 font-medium">
                  {successMsg}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-indigo-600 dark:bg-indigo-500 text-white font-semibold py-4 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isSignUp ? (
                "Sign Up"
              ) : (
                "Sign In"
              )}
            </button>
            
            <div className="text-center mt-6">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  {isSignUp ? "Sign In" : "Create one"}
                </button>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
