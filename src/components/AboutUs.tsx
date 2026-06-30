import React from "react";
import { ExternalLink, Github, Heart, Mail } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto pb-24">
      <div className="mb-8 text-center mt-8">
        <div className="inline-flex items-center justify-center p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-6">
          <Heart className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
          About Heritage Study
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Dedicated to providing quality educational resources for our student community.
          Built by students, for students.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Our Mission
          </h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            We aim to centralize study materials, past papers, handwritten notes, and last-minute suggestions to make exam preparation seamless and accessible for everyone in our institution. No more scrambling for notes the night before the exam!
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Open Source
          </h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            This project is open-source. We welcome contributions from developers, designers, and content creators. If you find a bug or want to add a feature, feel free to contribute to our repository.
          </p>
          <a
            href="http://github.com/arghyajana8348-arch/heritage-study"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            <Github className="w-5 h-5" />
            View Repository <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Contributors
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            The amazing people who made this possible.
          </p>
        </div>
        
        <div className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-1 shrink-0">
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">AJ</span>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                Arghya Jana
              </h3>
              <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-3">
                Lead Developer & Creator
              </p>
              <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-lg">
                Passionate about building tools that help students succeed. Always exploring new web technologies and building community-driven projects.
              </p>
              
              <div className="flex items-center justify-center md:justify-start gap-4">
                <a
                  href="http://github.com/arghyajana8348-arch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="mailto:arghyajana8348@gmail.com"
                  className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Want to see your name here?</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
              We are looking for contributors! Check out our open issues or submit your own study materials.
            </p>
            <a
              href="http://github.com/arghyajana8348-arch/heritage-study/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              Contributor's Letter <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
