"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  FileCheck2, Plus, Search, Edit2, Trash2, X, ChevronLeft,
  ChevronRight, Loader2, Clock, CheckCircle2, XCircle, ThumbsUp,
  ThumbsDown, Minus, Download, ChevronRight as Arr, ExternalLink, Eye,
  BarChart2, Filter,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

type Approval = {
  id: string; type: string; title: string; description: string;
  period: string; documentUrl: string | null;
  status: "PENDENTE" | "EM_VOTACAO" | "APROVADO" | "REJEITADO" | "CANCELADO";
  approvedBy: string | null; approvedAt: string | null;
  rejectionReason: string | null;
  votes: { favor: number; contra: number; abstencao: number } | null;
  createdAt: string;
};
type FormData = {
  title: string; type: string; period: string; description: string;
  documentUrl: string; status: string; rejectionReason: string;
  votesFavor: string; votesContra: string; votesAbstencao: string;
};
const INIT: FormData = {
  title:"",type:"PRESTACAO_CONTAS",period:"",description:"",
  documentUrl:"",status:"PENDENTE",rejectionReason:"",
  votesFavor:"",votesContra:"",votesAbstencao:"",
};
const TYPE_LABELS: Record<string,string> = {
  PRESTACAO_CONTAS:"Prestação de Contas",APROVACAO_OBRA:"Aprovação de Obra",
  APROVACAO_FESTA:"Aprovação de Festa",APROVACAO_REFORMA:"Aprovação de Reforma",
  APROVACAO_PET:"Aprovação de Pet",OUTRO:"Outro",
};
const TYPE_COLORS: Record<string,string> = {
  PRESTACAO_CONTAS:"bg-amber-500/20 text-amber-300",APROVACAO_OBRA:"bg-orange-500/20 text-orange-300",
  APROVACAO_FESTA:"bg-pink-500/20 text-pink-300",APROVACAO_REFORMA:"bg-violet-500/20 text-violet-300",
  APROVACAO_PET:"bg-yellow-500/20 text-yellow-300",OUTRO:"bg-slate-500/20 text-slate-300",
};
const ST = {
  PENDENTE:  {label:"Pendente",  cls:"bg-amber-500/20 text-amber-300",  dot:"bg-amber-400",  pulse:false},
  EM_VOTACAO:{label:"Em Votação",cls:"bg-blue-500/20 text-blue-300",    dot:"bg-blue-400",   pulse:true },
  APROVADO:  {label:"Aprovado",  cls:"bg-emerald-500/20 text-emerald-300",dot:"bg-emerald-400",pulse:false},
  REJEITADO: {label:"Rejeitado", cls:"bg-red-500/20 text-red-300",      dot:"bg-red-400",    pulse:false},
  CANCELADO: {label:"Cancelado", cls:"bg-slate-500/20 text-slate-400",  dot:"bg-slate-500",  pulse:false},
} as const;

const IN="w-full rounded-xl border border-slate-700 bg-slate-800/80 text-slate-200 placeholder-slate-500 px-3 py-2.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm";
const LB="text-xs font-medium text-slate-400 mb-1.5 block";
const fmt=(d:string|null|undefined)=>d?new Date(d).toLocaleDateString("pt-BR"):"—";

function Badge({status,size="sm"}:{status:string;size?:"sm"|"md"}){
  const c=ST[status as keyof typeof ST]??ST.CANCELADO;
  const s=size==="md"?"px-3 py-1.5 text-sm gap-2":"px-2.5 py-1 text-xs gap-1.5";
  return(
    <span className={`inline-flex items-center rounded-full font-semibold ${c.cls} ${s}`}>
      <span className="relative flex h-2 w-2 shrink-0">
        {c.pulse&&<span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${c.dot}`}/>}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${c.dot}`}/>
      </span>
      {c.label}
    </span>
  );
}
function MiniBar({votes}:{votes:NonNullable<Approval["votes"]>}){
  const t=votes.favor+votes.contra+votes.abstencao;
  if(!t)return <span className="text-slate-600 text-xs italic">sem votos</span>;
  const fp=Math.round(votes.favor/t*100),cp=Math.round(votes.contra/t*100);
  return(
    <div className="w-32">
      <div className="flex h-1.5 rounded-full overflow-hidden gap-px mb-1.5">
        {votes.favor>0&&<div className="bg-emerald-500 rounded-full" style={{width:`${fp}%`}}/>}
        {votes.contra>0&&<div className="bg-red-500 rounded-full" style={{width:`${cp}%`}}/>}
        {votes.abstencao>0&&<div className="bg-slate-500 rounded-full" style={{width:`${100-fp-cp}%`}}/>}
      </div>
      <div className="flex justify-between text-[10px]">
        <span className="text-emerald-400 font-semibold">{fp}% favor</span>
        <span className="text-slate-500">{t}v</span>
      </div>
    </div>
  );
}
function FullBars({votes}:{votes:NonNullable<Approval["votes"]>}){
  const t=votes.favor+votes.contra+votes.abstencao;
  const p=(n:number)=>t>0?Math.round(n/t*100):0;
  return(
    <div className="space-y-3">
      {([
        {label:"A Favor",val:votes.favor,pct:p(votes.favor),bar:"bg-emerald-500",txt:"text-emerald-400"},
        {label:"Contra",val:votes.contra,pct:p(votes.contra),bar:"bg-red-500",txt:"text-red-400"},
        {label:"Abstenção",val:votes.abstencao,pct:p(votes.abstencao),bar:"bg-slate-500",txt:"text-slate-400"},
      ] as const).map(({label,val,pct,bar,txt})=>(
        <div key={label}>
          <div className="flex justify-between text-xs mb-1.5">
            <span className={`font-semibold ${txt}`}>{label}: {val} voto{val!==1?"s":""}</span>
            <span className="text-slate-500 tabular-nums">{pct}%</span>
          </div>
          <div className="h-2.5 bg-slate-700/60 rounded-full overflow-hidden">
            <div className={`h-full ${bar} rounded-full transition-all duration-700`} style={{width:`${pct}%`}}/>
          </div>
        </div>
      ))}
      <div className="flex justify-between pt-2 border-t border-slate-700/50">
        <span className="text-xs text-slate-500">Quórum total</span>
        <span className="text-sm font-bold text-white tabular-nums">{t} votos</span>
      </div>
    </div>
  );
}

const TABS=[
  {key:"",label:"Todos"},{key:"PENDENTE",label:"Pendentes"},
  {key:"EM_VOTACAO",label:"Em Votação"},{key:"APROVADO",label:"Aprovados"},
  {key:"REJEITADO",label:"Rejeitados"},{key:"CANCELADO",label:"Cancelados"},
];

export default function AprovacoesPage(){
  const{push}=useToast();
  const[list,setList]=useState<Approval[]>([]);
  const[total,setTotal]=useState(0);
  const[loading,setLoading]=useState(false);
  const[page,setPage]=useState(1);
  const PS=10;
  const[stats,setStats]=useState({total:0,pendentes:0,emVotacao:0,aprovadas:0,rejeitadas:0});
  const[activeTab,setActiveTab]=useState("");
  const[filterType,setFilterType]=useState("");
  const[filterSearch,setFilterSearch]=useState("");
  const[selectedIds,setSelectedIds]=useState<Set<string>>(new Set());
  const[bulkDel,setBulkDel]=useState(false);
  const[drawer,setDrawer]=useState<Approval|null>(null);
  const[isOpen,setIsOpen]=useState(false);
  const[editing,setEditing]=useState<Approval|null>(null);
  const[form,setForm]=useState<FormData>(INIT);
  const[saving,setSaving]=useState(false);
  const[fErr,setFErr]=useState("");
  const[delConfirm,setDelConfirm]=useState<Approval|null>(null);
  const[deleting,setDeleting]=useState(false);
  const pages=Math.ceil(total/PS);

  const qs=useMemo(()=>{
    const p=new URLSearchParams();
    if(activeTab)p.set("status",activeTab);
    if(filterType)p.set("type",filterType);
    if(filterSearch)p.set("search",filterSearch);
    p.set("page",String(page));p.set("pageSize",String(PS));
    return p.toString();
  },[activeTab,filterType,filterSearch,page]);

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const r=await fetch(`/api/approvals?${qs}`,{cache:"no-store"});
      const d=await r.json();
      if(d?.ok){
        const items:Approval[]=d.data??[];
        setList(items);setTotal(d.total??0);
        setStats({
          total:d.total??0,
          pendentes:d.pendentes??items.filter(a=>a.status==="PENDENTE").length,
          emVotacao:d.emVotacao??items.filter(a=>a.status==="EM_VOTACAO").length,
          aprovadas:d.aprovadas??items.filter(a=>a.status==="APROVADO").length,
          rejeitadas:d.rejeitadas??items.filter(a=>a.status==="REJEITADO").length,
        });
      }else push({title:"Erro",message:d?.message||"Falha ao carregar",kind:"error"});
    }catch{push({title:"Erro",message:"Falha de conexão",kind:"error"});}
    finally{setLoading(false);}
  },[qs,push]);

  useEffect(()=>{load();},[load]);

  const allSel=list.length>0&&list.every(a=>selectedIds.has(a.id));
  const toggleAll=()=>setSelectedIds(allSel?new Set():new Set(list.map(a=>a.id)));
  const toggle=(id:string)=>setSelectedIds(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;});

  async function bulkDelete(){
    if(!selectedIds.size)return;
    if(!confirm(`Excluir ${selectedIds.size} item(s)?`))return;
    setBulkDel(true);
    await Promise.all([...selectedIds].map(id=>fetch(`/api/approvals/${id}`,{method:"DELETE"})));
    setBulkDel(false);setSelectedIds(new Set());
    push({title:"Excluídos",message:`${selectedIds.size} item(s) removido(s)`,kind:"success"});
    load();
  }

  function exportCSV(){
    const rows=list.map(a=>`"${a.title}","${TYPE_LABELS[a.type]??a.type}","${a.period}","${ST[a.status as keyof typeof ST]?.label}","${fmt(a.createdAt)}"`).join("\n");
    const b=new Blob([`Título,Tipo,Período,Status,Data\n${rows}`],{type:"text/csv"});
    const u=URL.createObjectURL(b);const el=document.createElement("a");el.href=u;el.download="aprovacoes.csv";el.click();
  }

  function openCreate(){setEditing(null);setForm(INIT);setFErr("");setIsOpen(true);}
  function openEdit(a:Approval){
    setEditing(a);
    setForm({title:a.title,type:a.type,period:a.period,description:a.description,documentUrl:a.documentUrl??"",
      status:a.status,rejectionReason:a.rejectionReason??"",
      votesFavor:a.votes?String(a.votes.favor):"",
      votesContra:a.votes?String(a.votes.contra):"",
      votesAbstencao:a.votes?String(a.votes.abstencao):"",
    });
    setFErr("");setIsOpen(true);setDrawer(null);
  }

  async function submit(e:React.FormEvent){
    e.preventDefault();
    if(!form.title.trim()){setFErr("Título obrigatório");return;}
    if(!form.period.trim()){setFErr("Período obrigatório");return;}
    if(!form.description.trim()){setFErr("Descrição obrigatória");return;}
    setSaving(true);setFErr("");
    try{
      const showV=form.status==="EM_VOTACAO"||form.status==="APROVADO";
      const body:Record<string,unknown>={
        title:form.title.trim(),type:form.type,period:form.period.trim(),
        description:form.description.trim(),documentUrl:form.documentUrl.trim()||null,
      };
      if(editing){
        body.status=form.status;
        if(form.status==="REJEITADO")body.rejectionReason=form.rejectionReason.trim()||null;
        if(showV)body.votes={favor:parseInt(form.votesFavor)||0,contra:parseInt(form.votesContra)||0,abstencao:parseInt(form.votesAbstencao)||0};
      }
      const url=editing?`/api/approvals/${editing.id}`:"/api/approvals";
      const r=await fetch(url,{method:editing?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const d=await r.json();
      if(d?.ok){push({title:editing?"Atualizado!":"Criado!",message:`"${body.title}" salvo.`,kind:"success"});setIsOpen(false);load();}
      else setFErr(d?.message??"Erro ao salvar");
    }catch{setFErr("Erro de conexão");}
    finally{setSaving(false);}
  }

  async function doDelete(){
    if(!delConfirm)return;setDeleting(true);
    try{
      const r=await fetch(`/api/approvals/${delConfirm.id}`,{method:"DELETE"});
      const d=await r.json();
      if(d?.ok){push({title:"Excluído!",message:`"${delConfirm.title}" removido.`,kind:"success"});setDelConfirm(null);setDrawer(null);load();}
      else push({title:"Erro",message:d?.message??"Falha ao excluir",kind:"error"});
    }catch{push({title:"Erro",message:"Falha de conexão",kind:"error"});}
    finally{setDeleting(false);}
  }

  const showV=form.status==="EM_VOTACAO"||form.status==="APROVADO";

  return(
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
            <FileCheck2 className="w-6 h-6 text-white"/>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-0.5">
              <span>Finanças</span><Arr className="w-3 h-3"/><span className="text-slate-400">Prestação de Contas</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Prestação de Contas</h1>
            <p className="text-slate-400 text-sm mt-0.5">Aprovações, votações e prestações de contas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 hover:bg-slate-800/60 rounded-xl transition-all text-sm font-medium">
            <Download className="w-4 h-4"/>Exportar CSV
          </button>
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/25 text-sm">
            <Plus className="w-5 h-5"/>Nova Aprovação
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        {[
          {label:"Total",val:stats.total,I:BarChart2,ic:"text-amber-400",bg:"bg-amber-500/10",br:"border-amber-500/20"},
          {label:"Pendentes",val:stats.pendentes,I:Clock,ic:"text-amber-300",bg:"bg-amber-500/10",br:"border-amber-500/20"},
          {label:"Em Votação",val:stats.emVotacao,I:FileCheck2,ic:"text-blue-400",bg:"bg-blue-500/10",br:"border-blue-500/20"},
          {label:"Aprovadas",val:stats.aprovadas,I:CheckCircle2,ic:"text-emerald-400",bg:"bg-emerald-500/10",br:"border-emerald-500/20"},
          {label:"Rejeitadas",val:stats.rejeitadas,I:XCircle,ic:"text-red-400",bg:"bg-red-500/10",br:"border-red-500/20"},
        ].map(({label,val,I,ic,bg,br})=>(
          <div key={label} className={`bg-slate-900/80 backdrop-blur border ${br} rounded-2xl p-5 flex items-center gap-4`}>
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <I className={`w-5 h-5 ${ic}`}/>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">{val}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl px-5 py-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">
          <BarChart2 className="w-3.5 h-3.5"/>Ciclo de Aprovação
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {[
            {key:"PENDENTE",label:"Pendente",count:stats.pendentes,color:"amber"},
            {key:"EM_VOTACAO",label:"Em Votação",count:stats.emVotacao,color:"blue"},
            {key:"APROVADO",label:"Aprovado",count:stats.aprovadas,color:"emerald"},
            {key:"REJEITADO",label:"Rejeitado",count:stats.rejeitadas,color:"red"},
          ].map((s,i,arr)=>{
            const act=activeTab===s.key;
            const m:Record<string,string>={
              amber:act?"bg-amber-500/20 border-amber-500/50 text-amber-300":"bg-slate-800/60 border-slate-700 text-slate-400 hover:text-amber-300 hover:border-amber-500/30",
              blue:act?"bg-blue-500/20 border-blue-500/50 text-blue-300":"bg-slate-800/60 border-slate-700 text-slate-400 hover:text-blue-300 hover:border-blue-500/30",
              emerald:act?"bg-emerald-500/20 border-emerald-500/50 text-emerald-300":"bg-slate-800/60 border-slate-700 text-slate-400 hover:text-emerald-300 hover:border-emerald-500/30",
              red:act?"bg-red-500/20 border-red-500/50 text-red-300":"bg-slate-800/60 border-slate-700 text-slate-400 hover:text-red-300 hover:border-red-500/30",
            };
            return(
              <React.Fragment key={s.key}>
                <button type="button" onClick={()=>{setActiveTab(act?"":s.key);setPage(1);}}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${m[s.color]}`}>
                  {s.label}
                  <span className="bg-white/10 rounded-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums">{s.count}</span>
                </button>
                {i<arr.length-1&&<Arr className="w-4 h-4 text-slate-600 shrink-0"/>}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"/>
            <input value={filterSearch} onChange={e=>{setFilterSearch(e.target.value);setPage(1);}}
              placeholder="Buscar por título ou descrição..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm transition-all"/>
          </div>
          <Filter className="w-4 h-4 text-slate-500 shrink-0"/>
          <select value={filterType} onChange={e=>{setFilterType(e.target.value);setPage(1);}}
            className="px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200 outline-none focus:border-amber-500 text-sm transition-all">
            <option value="">Todos os Tipos</option>
            {Object.entries(TYPE_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
          {(filterSearch||filterType||activeTab)&&(
            <button type="button" onClick={()=>{setFilterSearch("");setFilterType("");setActiveTab("");setPage(1);}}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-xl hover:bg-slate-800 transition-all">
              <X className="w-3.5 h-3.5"/>Limpar
            </button>
          )}
        </div>
      </div>

      {/* Bulk Toolbar */}
      {selectedIds.size>0&&(
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-950/40 border border-amber-700/50 rounded-2xl">
          <span className="text-sm font-semibold text-amber-300">{selectedIds.size} selecionado(s)</span>
          <div className="h-4 w-px bg-amber-700/60"/>
          <button onClick={bulkDelete} disabled={bulkDel}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600/30 border border-red-500/40 text-red-300 hover:bg-red-600/50 rounded-lg text-sm font-medium transition-all disabled:opacity-50">
            {bulkDel?<Loader2 className="w-4 h-4 animate-spin"/>:<Trash2 className="w-4 h-4"/>}Excluir
          </button>
          <button onClick={()=>setSelectedIds(new Set())} className="ml-auto p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
            <X className="w-4 h-4"/>
          </button>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700">
                <th className="w-10 px-4 py-3.5">
                  <input type="checkbox" checked={allSel} onChange={toggleAll}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 accent-amber-500 cursor-pointer"/>
                </th>
                {["Título / Tipo","Período","Votos","Status","Criado em","Ações"].map(h=>(
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading?(
                <tr><td colSpan={7} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-400"/>
                    <p className="text-slate-400 text-sm">Carregando aprovações...</p>
                  </div>
                </td></tr>
              ):list.length===0?(
                <tr><td colSpan={7} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center">
                      <FileCheck2 className="w-8 h-8 text-slate-600"/>
                    </div>
                    <div>
                      <p className="text-slate-300 font-semibold">Nenhuma aprovação encontrada</p>
                      <p className="text-slate-500 text-sm mt-1">Cadastre a primeira aprovação do condomínio</p>
                    </div>
                    <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 rounded-xl text-sm font-medium transition-all">
                      <Plus className="w-4 h-4"/>Nova Aprovação
                    </button>
                  </div>
                </td></tr>
              ):list.map(a=>{
                const sel=selectedIds.has(a.id);
                const row=a.status==="APROVADO"?"border-l-2 border-emerald-500/50 hover:bg-emerald-950/10":a.status==="REJEITADO"?"opacity-75 hover:bg-slate-800/30":"hover:bg-slate-800/40";
                return(
                  <tr key={a.id} className={`transition-colors ${row} ${sel?"bg-amber-950/20":""}`}>
                    <td className="px-4 py-4">
                      <input type="checkbox" checked={sel} onChange={()=>toggle(a.id)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 accent-amber-500 cursor-pointer"/>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <button type="button" onClick={()=>setDrawer(a)} className="text-left group w-full">
                        <p className="font-semibold text-slate-200 group-hover:text-white transition-colors line-clamp-1">{a.title}</p>
                        <span className={`inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ${TYPE_COLORS[a.type]??TYPE_COLORS.OUTRO}`}>
                          {TYPE_LABELS[a.type]??a.type}
                        </span>
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm text-slate-300 bg-slate-800/60 px-2.5 py-1 rounded-lg">{a.period||"—"}</span>
                    </td>
                    <td className="px-5 py-4">{a.votes?<MiniBar votes={a.votes}/>:<span className="text-slate-600 text-xs italic">sem votos</span>}</td>
                    <td className="px-5 py-4"><Badge status={a.status}/></td>
                    <td className="px-5 py-4 text-slate-400 text-sm tabular-nums">{fmt(a.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={()=>setDrawer(a)} className="p-2 hover:bg-slate-700/60 rounded-lg transition-colors" title="Ver detalhes">
                          <Eye className="w-4 h-4 text-slate-400 hover:text-slate-200"/>
                        </button>
                        <button onClick={()=>openEdit(a)} className="p-2 hover:bg-amber-500/10 rounded-lg transition-colors" title="Editar">
                          <Edit2 className="w-4 h-4 text-slate-400 hover:text-amber-400"/>
                        </button>
                        <button onClick={()=>setDelConfirm(a)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors" title="Excluir">
                          <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-800 px-5 py-3.5 flex items-center justify-between bg-slate-900/50">
          <p className="text-sm text-slate-500">
            {total>0?<>Exibindo <span className="text-slate-300 font-semibold">{list.length}</span> de <span className="text-slate-300 font-semibold">{total}</span> registros</>:"Nenhum registro"}
          </p>
          {pages>1&&(
            <div className="flex items-center gap-2">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4"/>Anterior
              </button>
              <span className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-lg text-sm font-semibold tabular-nums">{page}</span>
              <span className="text-slate-600 text-sm">de {pages}</span>
              <button onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page===pages}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                Próximo<ChevronRight className="w-4 h-4"/>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Drawer Detalhes */}
      {drawer&&(
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={()=>setDrawer(null)}/>
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col">
            <div className="h-0.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500"/>
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
              <h2 className="font-bold text-white text-lg">Detalhes da Aprovação</h2>
              <button onClick={()=>setDrawer(null)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400"/>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold mb-2 ${TYPE_COLORS[drawer.type]??TYPE_COLORS.OUTRO}`}>
                  {TYPE_LABELS[drawer.type]??drawer.type}
                </span>
                <h3 className="text-xl font-bold text-white leading-snug">{drawer.title}</h3>
                <p className="text-slate-500 text-xs mt-1.5">Criado em {fmt(drawer.createdAt)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 rounded-xl p-3">
                  <p className="text-[11px] text-slate-500 uppercase tracking-wide font-semibold">Período</p>
                  <p className="text-white font-mono text-sm mt-1">{drawer.period||"—"}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3">
                  <p className="text-[11px] text-slate-500 uppercase tracking-wide font-semibold">Status</p>
                  <div className="mt-1"><Badge status={drawer.status} size="md"/></div>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Descrição</p>
                <p className="text-slate-300 text-sm leading-relaxed bg-slate-800/40 rounded-xl p-4">{drawer.description}</p>
              </div>
              {drawer.votes&&(
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Resultado da Votação</p>
                  <div className="bg-slate-800/40 rounded-xl p-4"><FullBars votes={drawer.votes}/></div>
                </div>
              )}
              {drawer.status==="REJEITADO"&&drawer.rejectionReason&&(
                <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-4">
                  <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-2">Motivo da Rejeição</p>
                  <p className="text-red-200 text-sm leading-relaxed">{drawer.rejectionReason}</p>
                </div>
              )}
              {drawer.documentUrl&&(
                <a href={drawer.documentUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 w-full px-4 py-3 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 hover:border-slate-600 rounded-xl text-slate-300 hover:text-white transition-all text-sm font-medium">
                  <ExternalLink className="w-4 h-4 text-amber-400"/>Ver Documento Anexo
                </a>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-800 flex gap-3 bg-slate-900">
              <button onClick={()=>openEdit(drawer)} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 rounded-xl text-sm font-semibold transition-all">
                <Edit2 className="w-4 h-4"/>Editar
              </button>
              <button onClick={()=>setDelConfirm(drawer)} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-xl text-sm font-semibold transition-all">
                <Trash2 className="w-4 h-4"/>Excluir
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal Criar/Editar */}
      {isOpen&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="h-0.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-t-2xl"/>
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-400"/>
                {editing?"Editar Aprovação":"Nova Aprovação"}
              </h2>
              <button onClick={()=>setIsOpen(false)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400"/>
              </button>
            </div>
            <form onSubmit={submit} className="p-6">
              {fErr&&(
                <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-start gap-2">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5"/>{fErr}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={LB}>Título <span className="text-red-400">*</span></label>
                  <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
                    placeholder="Ex: Prestação de Contas — 1º Trimestre 2025" className={IN} autoFocus/>
                </div>
                <div>
                  <label className={LB}>Tipo <span className="text-red-400">*</span></label>
                  <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className={IN}>
                    {Object.entries(TYPE_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className={LB}>Período <span className="text-red-400">*</span></label>
                  <input value={form.period} onChange={e=>setForm({...form,period:e.target.value})}
                    placeholder="Ex: 03/2025 ou 1T/2025" maxLength={10} className={IN}/>
                </div>
                <div className="col-span-2">
                  <label className={LB}>Descrição <span className="text-red-400">*</span></label>
                  <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
                    placeholder="Descreva os detalhes desta aprovação..." rows={4} className={`${IN} resize-none`}/>
                </div>
                <div className="col-span-2">
                  <label className={LB}>URL do Documento</label>
                  <input type="url" value={form.documentUrl} onChange={e=>setForm({...form,documentUrl:e.target.value})}
                    placeholder="https://exemplo.com/documento.pdf" className={IN}/>
                </div>
                {editing&&(
                  <div>
                    <label className={LB}>Status</label>
                    <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className={IN}>
                      <option value="PENDENTE">Pendente</option><option value="EM_VOTACAO">Em Votação</option>
                      <option value="APROVADO">Aprovado</option><option value="REJEITADO">Rejeitado</option>
                      <option value="CANCELADO">Cancelado</option>
                    </select>
                  </div>
                )}
                {editing&&form.status==="REJEITADO"&&(
                  <div className="col-span-2">
                    <label className={LB}>Motivo da Rejeição</label>
                    <textarea value={form.rejectionReason} onChange={e=>setForm({...form,rejectionReason:e.target.value})}
                      placeholder="Descreva o motivo..." rows={3} className={`${IN} resize-none`}/>
                  </div>
                )}
                {editing&&showV&&(
                  <div className="col-span-2 pt-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">
                      <BarChart2 className="w-3.5 h-3.5"/>Registro de Votos
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        {label:"A Favor",key:"votesFavor",I:ThumbsUp,txt:"text-emerald-400"},
                        {label:"Contra",key:"votesContra",I:ThumbsDown,txt:"text-red-400"},
                        {label:"Abstenção",key:"votesAbstencao",I:Minus,txt:"text-slate-400"},
                      ].map(({label,key,I,txt})=>(
                        <div key={key} className="bg-slate-800/60 rounded-xl p-3">
                          <label className={`${LB} flex items-center gap-1.5`}>
                            <I className={`w-3.5 h-3.5 ${txt}`}/>{label}
                          </label>
                          <input type="number" min="0"
                            value={form[key as keyof FormData]}
                            onChange={e=>setForm({...form,[key]:e.target.value})}
                            placeholder="0"
                            className="w-full px-3 py-2 bg-slate-700/60 border border-slate-600 rounded-lg text-white text-lg font-bold text-center outline-none focus:border-amber-500 transition-all tabular-nums"/>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-5 mt-5 border-t border-slate-800">
                <button type="button" onClick={()=>setIsOpen(false)}
                  className="px-5 py-2.5 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl text-sm font-medium transition-all">Cancelar</button>
                <button type="submit" disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 text-sm">
                  {saving&&<Loader2 className="w-4 h-4 animate-spin"/>}
                  {saving?"Salvando...":editing?"Salvar Alterações":"Cadastrar Aprovação"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Excluir */}
      {delConfirm&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-red-500 to-rose-500"/>
            <div className="p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-red-400"/>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Excluir Aprovação?</h3>
              <p className="text-sm font-semibold text-white px-4 py-2 bg-slate-800 rounded-xl">&ldquo;{delConfirm.title}&rdquo;</p>
              <p className="text-slate-500 text-xs mt-3">Esta ação não pode ser desfeita.</p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={()=>setDelConfirm(null)} className="flex-1 px-4 py-2.5 border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl text-sm font-medium transition-all">Cancelar</button>
              <button onClick={doDelete} disabled={deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50">
                {deleting&&<Loader2 className="w-4 h-4 animate-spin"/>}
                {deleting?"Excluindo...":"Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
