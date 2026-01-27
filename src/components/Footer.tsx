'use client';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-8 px-6 bg-background-dark">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
          <span className="material-icons-outlined text-[14px] text-primary">monetization_on</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Success Fee</span>
        </div>
        
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600">
          © 2025, PATH Protocol
        </div>

        <div className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-500">
          <a className="hover:text-white transition-colors" href="#">Privacy</a>
          <a className="hover:text-white transition-colors" href="#">Docs</a>
          <a className="hover:text-white transition-colors" href="#">Help</a>
        </div>
      </div>
    </footer>
  );
}
