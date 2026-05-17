export default function Loading() {
  return (
    <div className="fixed inset-0 z-[200] bg-[#050505] flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-t-2 border-r-2 border-[#D4AF37] rounded-full animate-spin mb-8 shadow-[0_0_15px_rgba(212,175,55,0.2)]"></div>
      <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">
        Decrypting Vault...
      </p>
    </div>
  );
}