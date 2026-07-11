import React from "react";
import { ExternalLink, Github, Heart, Mail } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="max-w-5xl mx-auto h-full overflow-y-auto pb-24 px-4">
      <div className="mb-12 text-center mt-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FF603D] border-[3px] border-slate-950 rounded-2xl mb-6 shadow-[3px_3px_0px_0px_#000] rotate-[-4deg] text-slate-955">
          <Heart className="w-8 h-8 stroke-[2.5px] fill-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-950 dark:text-white mb-4 uppercase italic tracking-wide">
          About Heritage Study
        </h1>
        <p className="text-lg font-bold text-slate-700 dark:text-slate-350 max-w-2xl mx-auto leading-relaxed">
          Dedicated to providing high-quality, structured educational resources for our student community.
          Built by students, for students.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Mission Card */}
        <div className="bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white rounded-2xl p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-0.5 transition-all">
          <h2 className="text-2xl font-black text-slate-950 dark:text-white mb-4 uppercase italic">
            Our Mission
          </h2>
          <p className="text-slate-655 dark:text-slate-400 font-bold leading-relaxed">
            We aim to centralize study materials, past papers, handwritten notes, and last-minute suggestions to make exam preparation seamless and accessible for everyone in our institution. No more scrambling for notes the night before the exam!
          </p>
        </div>

        {/* Open Source Card */}
        <div className="bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white rounded-2xl p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-0.5 transition-all">
          <h2 className="text-2xl font-black text-slate-950 dark:text-white mb-4 uppercase italic">
            Open Source
          </h2>
          <p className="text-slate-655 dark:text-slate-400 font-bold leading-relaxed mb-6">
            This project is open-source. We welcome contributions from developers, designers, and content creators. If you find a bug or want to add a feature, feel free to contribute to our repository.
          </p>
          <a
            href="http://github.com/arghyajana8348-arch/heritage-study"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#FFD54F] border-2 border-slate-950 text-slate-950 font-black px-4 py-2.5 rounded-xl shadow-[3px_3px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all cursor-pointer uppercase tracking-wider text-xs"
          >
            <Github className="w-4 h-4 stroke-[2px]" />
            View Repository <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Contributors section */}
      <div className="bg-white dark:bg-slate-900 border-[3px] border-slate-950 dark:border-white rounded-2xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
        <div className="px-8 py-6 border-b-[3px] border-slate-950 bg-[#C19BF5] text-slate-950">
          <h2 className="text-2xl font-black uppercase italic tracking-wide">
            Contributors
          </h2>
          <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mt-1">
            The amazing people who made this possible.
          </p>
        </div>
        
        <div className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 rounded-2xl bg-[#FFD54F] border-[3px] border-slate-950 flex items-center justify-center shadow-[3px_3px_0px_0px_#000] rotate-[-3deg] shrink-0 text-slate-950">
              <span className="text-3xl font-black italic">AJ</span>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-black text-slate-950 dark:text-white uppercase italic mb-1">
                Arghya Jana
              </h3>
              <p className="text-[#FF603D] font-extrabold text-sm uppercase tracking-wide mb-3">
                Lead Developer & Creator
              </p>
              <p className="text-slate-650 dark:text-slate-400 font-bold mb-4 max-w-lg leading-relaxed text-sm">
                Passionate about building tools that help students succeed. Always exploring new web technologies and building community-driven projects.
              </p>
              
              <div className="flex items-center justify-center md:justify-start gap-4">
                <a
                  href="http://github.com/arghyajana8348-arch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white border-2 border-slate-950 text-slate-950 rounded-xl shadow-[2px_2px_0px_0px_#000] hover:bg-[#88D3E6] active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="mailto:arghyajana8348@gmail.com"
                  className="p-2 bg-white border-2 border-slate-950 text-slate-950 rounded-xl shadow-[2px_2px_0px_0px_#000] hover:bg-[#88D3E6] active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center p-6 bg-[#FFD3B6] border-2 border-slate-950 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-slate-950">
            <h4 className="font-black text-lg uppercase italic mb-2">Want to see your name here?</h4>
            <p className="font-semibold text-slate-800 text-sm mb-5 max-w-md mx-auto leading-relaxed">
              We are looking for contributors! Check out our open issues or submit your own study materials.
            </p>
            <a
              href="http://github.com/arghyajana8348-arch/heritage-study/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white border-2 border-slate-950 text-slate-950 rounded-xl font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all cursor-pointer uppercase tracking-wider text-xs"
            >
              Contributor's Guide <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
