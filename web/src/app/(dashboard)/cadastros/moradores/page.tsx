import ResidentsManager from "./ResidentsManager";

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-slate-100">Cadastros &bull; Proprietários e Moradores</h1>
        <p className="text-slate-400 text-sm">Selecione a unidade (Bloco+Apto) e cadastre proprietários, inquilinos e moradores vinculados.</p>
      </div>
      <ResidentsManager />
    </div>
  );
}
