"use client";

import React, { useState } from "react";
import { BarChart3, Calendar, Download, FileText, TrendingUp, TrendingDown, DollarSign, Package, Users, Building2, PieChart, LineChart, Filter, Search } from "lucide-react";

type Relatorio = {
  id: string;
  titulo: string;
  descricao: string;
  tipo: "FINANCEIRO" | "OCORRENCIAS" | "ENCOMENDAS" | "PET" | "ASSEMBLEIA" | "GERAL";
  dataGeracao: string;
  formato: "PDF" | "EXCEL" | "CSV";
  tamanho: string;
  autor: string;
};

export default function RelatoriosPage() {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([
    {
      id: "1",
      titulo: "Relatório Financeiro Mensal - Jan/2026",
      descricao: "Demonstrativo de receitas e despesas do mês de janeiro de 2026",
      tipo: "FINANCEIRO",
      dataGeracao: "2026-02-01",
      formato: "PDF",
      tamanho: "2.4 MB",
      autor: "Sistema",
    },
    {
      id: "2",
      titulo: "Relatório de Ocorrências - Jan/2026",
      descricao: "Análise de ocorrências registradas no mês de janeiro de 2026",
      tipo: "OCORRENCIAS",
      dataGeracao: "2026-02-01",
      formato: "PDF",
      tamanho: "1.8 MB",
      autor: "Sistema",
    },
    {
      id: "3",
      titulo: "Relatório de Encomendas - Jan/2026",
      descricao: "Controle de encomendas recebidas e retiradas no mês de janeiro de 2026",
      tipo: "ENCOMENDAS",
      dataGeracao: "2026-02-01",
      formato: "EXCEL",
      tamanho: "856 KB",
      autor: "Sistema",
    },
    {
      id: "4",
      titulo: "Relatório de Pets - Cadastro Atualizado",
      descricao: "Relação de animais de estimação cadastrados no condomínio",
      tipo: "PET",
      dataGeracao: "2026-01-28",
      formato: "PDF",
      tamanho: "1.2 MB",
      autor: "Sistema",
    },
    {
      id: "5",
      titulo: "Atas de Assembleias - 2025",
      descricao: "Coleção de atas das assembleias realizadas em 2025",
      tipo: "ASSEMBLEIA",
      dataGeracao: "2026-01-25",
      formato: "PDF",
      tamanho: "4.7 MB",
      autor: "Sistema",
    },
    {
      id: "6",
      titulo: "Relatório Geral do Condomínio",
      descricao: "Visão geral de todas as atividades do condomínio",
      tipo: "GERAL",
      dataGeracao: "2026-01-20",
      formato: "PDF",
      tamanho: "3.1 MB",
      autor: "Sistema",
    }
  ]);

  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroPeriodo, setFiltroPeriodo] = useState("");
  const [busca, setBusca] = useState("");

  // Filtrar relatórios com base nos critérios
  const relatoriosFiltrados = relatorios.filter(relatorio => {
    const matchesTipo = !filtroTipo || relatorio.tipo === filtroTipo;
    const matchesBusca = !busca || 
      relatorio.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      relatorio.descricao.toLowerCase().includes(busca.toLowerCase());
    
    return matchesTipo && matchesBusca;
  });

  // Função para obter ícone com base no tipo de relatório
  const getIconByType = (tipo: string) => {
    switch (tipo) {
      case "FINANCEIRO":
        return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case "OCORRENCIAS":
        return <FileText className="w-5 h-5 text-amber-400" />;
      case "ENCOMENDAS":
        return <Package className="w-5 h-5 text-rose-400" />;
      case "PET":
        return <Building2 className="w-5 h-5 text-blue-400" />;
      case "ASSEMBLEIA":
        return <Users className="w-5 h-5 text-indigo-400" />;
      case "GERAL":
        return <BarChart3 className="w-5 h-5 text-violet-400" />;
      default:
        return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  // Função para obter cor com base no tipo de relatório
  const getColorByType = (tipo: string) => {
    switch (tipo) {
      case "FINANCEIRO":
        return "bg-emerald-500/20 text-emerald-300";
      case "OCORRENCIAS":
        return "bg-amber-500/20 text-amber-300";
      case "ENCOMENDAS":
        return "bg-rose-500/20 text-rose-300";
      case "PET":
        return "bg-blue-500/20 text-blue-300";
      case "ASSEMBLEIA":
        return "bg-indigo-500/20 text-indigo-300";
      case "GERAL":
        return "bg-violet-500/20 text-violet-300";
      default:
        return "bg-slate-500/20 text-slate-300";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-violet-400" />
            Relatórios
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Acesse e gere relatórios do condomínio
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-300">Filtros</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Título ou descrição..."
                className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 placeholder-slate-500 pl-10 pr-3 py-2 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Tipo</label>
            <select 
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
            >
              <option value="">Todos</option>
              <option value="FINANCEIRO">Financeiro</option>
              <option value="OCORRENCIAS">Ocorrências</option>
              <option value="ENCOMENDAS">Encomendas</option>
              <option value="PET">Pets</option>
              <option value="ASSEMBLEIA">Assembleias</option>
              <option value="GERAL">Geral</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Período</label>
            <select 
              value={filtroPeriodo}
              onChange={(e) => setFiltroPeriodo(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900/70 text-slate-100 px-3 py-2 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
            >
              <option value="">Todos</option>
              <option value="ultimo-mes">Último mês</option>
              <option value="ultimo-trimestre">Último trimestre</option>
              <option value="ultimo-ano">Último ano</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              className="w-full px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatoriosFiltrados.map((relatorio) => (
          <div 
            key={relatorio.id} 
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 hover:bg-white/10 transition"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-800/50">
                  {getIconByType(relatorio.tipo)}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{relatorio.titulo}</h3>
                  <p className="text-xs text-slate-400">{relatorio.autor}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getColorByType(relatorio.tipo)}`}>
                {relatorio.tipo}
              </span>
            </div>
            
            <p className="text-sm text-slate-300 mb-4 line-clamp-2">
              {relatorio.descricao}
            </p>
            
            <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(relatorio.dataGeracao).toLocaleDateString('pt-BR')}
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {relatorio.formato} ({relatorio.tamanho})
              </div>
            </div>
            
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-violet-500/25">
              <Download className="w-4 h-4" />
              Baixar Relatório
            </button>
          </div>
        ))}
      </div>

      {/* Seção de Geração de Relatórios */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <PieChart className="w-5 h-5 text-amber-400" />
          Gerar Novo Relatório
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex flex-col items-center justify-center p-6 rounded-xl border border-white/10 hover:bg-white/5 transition group">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3 group-hover:bg-emerald-500/30 transition">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="font-medium text-white mb-1">Financeiro</h3>
            <p className="text-xs text-slate-400 text-center">Receitas, despesas e fluxo de caixa</p>
          </button>
          
          <button className="flex flex-col items-center justify-center p-6 rounded-xl border border-white/10 hover:bg-white/5 transition group">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mb-3 group-hover:bg-amber-500/30 transition">
              <FileText className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="font-medium text-white mb-1">Ocorrências</h3>
            <p className="text-xs text-slate-400 text-center">Relatório de ocorrências registradas</p>
          </button>
          
          <button className="flex flex-col items-center justify-center p-6 rounded-xl border border-white/10 hover:bg-white/5 transition group">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center mb-3 group-hover:bg-rose-500/30 transition">
              <Package className="w-6 h-6 text-rose-400" />
            </div>
            <h3 className="font-medium text-white mb-1">Encomendas</h3>
            <p className="text-xs text-slate-400 text-center">Controle de encomendas do condomínio</p>
          </button>
          
          <button className="flex flex-col items-center justify-center p-6 rounded-xl border border-white/10 hover:bg-white/5 transition group">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-3 group-hover:bg-blue-500/30 transition">
              <Building2 className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-medium text-white mb-1">Pets</h3>
            <p className="text-xs text-slate-400 text-center">Relação de animais de estimação</p>
          </button>
          
          <button className="flex flex-col items-center justify-center p-6 rounded-xl border border-white/10 hover:bg-white/5 transition group">
            <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-3 group-hover:bg-indigo-500/30 transition">
              <Users className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="font-medium text-white mb-1">Assembleias</h3>
            <p className="text-xs text-slate-400 text-center">Atas e votações das assembleias</p>
          </button>
          
          <button className="flex flex-col items-center justify-center p-6 rounded-xl border border-white/10 hover:bg-white/5 transition group">
            <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center mb-3 group-hover:bg-violet-500/30 transition">
              <BarChart3 className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="font-medium text-white mb-1">Geral</h3>
            <p className="text-xs text-slate-400 text-center">Relatório completo do condomínio</p>
          </button>
        </div>
      </div>
    </div>
  );
}