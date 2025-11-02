export default function AppBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* pattern de + */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            `linear-gradient(to right, rgba(255,255,255,.16) 1px, transparent 1px),
             linear-gradient(to bottom, rgba(255,255,255,.16) 1px, transparent 1px),
             radial-gradient(circle at 1px 1px, rgba(255,255,255,.6) 1px, transparent 1px)`,
          backgroundSize: '40px 40px, 40px 40px, 40px 40px',
          backgroundPosition: '0 0, 0 0, 0 0'
        }}
      />
      {/* brilhos suaves */}
      <div className="absolute -top-24 -left-24 w-[32rem] h-[32rem] rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="relative">{children}</div>
    </div>
  );
}
