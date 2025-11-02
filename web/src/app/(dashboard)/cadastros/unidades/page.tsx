import UnitsManager from "./UnitsManager";

export default function Page() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-xl md:text-2xl font-semibold text-slate-100">Cadastros • Unidades</h1>
        <p className="text-slate-400 text-sm">Filtre por Bloco/Apto e cadastre novas unidades.</p>
      </div>
      <UnitsManager />
    </div>
  );
}
