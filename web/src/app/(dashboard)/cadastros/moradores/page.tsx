import ResidentsManager from "./ResidentsManager";

export default function Page() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-xl md:text-2xl font-semibold text-slate-100">Cadastros • Moradores</h1>
        <p className="text-slate-400 text-sm">Selecione a unidade (Bloco+Apto) e cadastre moradores vinculados.</p>
      </div>
      <ResidentsManager />
    </div>
  );
}
