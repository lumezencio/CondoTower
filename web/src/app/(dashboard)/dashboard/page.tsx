export default function Page() {
  return (
    <div className="grid gap-6">
      <h1 className="text-xl font-semibold text-slate-800">Bem-vindo à Condotech</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-white/30 bg-white/80 backdrop-blur p-5 shadow">
          <div className="text-sm text-slate-500">Arrecadação (30 dias)</div>
          <div className="text-2xl font-semibold mt-2">R$ 12.540</div>
        </div>
        <div className="rounded-2xl border border-white/30 bg-white/80 backdrop-blur p-5 shadow">
          <div className="text-sm text-slate-500">Ocorrências abertas</div>
          <div className="text-2xl font-semibold mt-2">4</div>
        </div>
        <div className="rounded-2xl border border-white/30 bg-white/80 backdrop-blur p-5 shadow">
          <div className="text-sm text-slate-500">Reservas hoje</div>
          <div className="text-2xl font-semibold mt-2">2</div>
        </div>
      </div>
    </div>
  );
}
