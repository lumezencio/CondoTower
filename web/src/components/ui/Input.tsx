export function Input({ label, ...props }:{ label:string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm text-slate-600">{label}</span>
      <input
        className="mt-1 w-full h-11 px-4 rounded-2xl border border-white/30 bg-white/80 backdrop-blur text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-300"
        {...props}
      />
    </label>
  );
}
