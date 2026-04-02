'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  MapPin,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Paperclip,
  DollarSign,
  Edit,
  Trash2,
  MoreVertical,
  History,
  Package
} from 'lucide-react';

interface TicketDetailData {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  categoria: string;
  status: string;
  prioridade: string;
  localAfetado?: string;
  fotos?: string[];
  autorNome?: string;
  autorFoto?: string;
  responsavelNome?: string;
  dataAbertura: Date;
  dataPrevisao?: Date;
  dataResolucao?: Date;
  solucao?: string;
  custo?: number;
  observacoes?: string;
  apartamentoNumero?: string;
  blocoNome?: string;
}

interface TicketHistorico {
  id: string;
  acao: string;
  descricao: string;
  usuarioNome: string;
  data: Date;
}

interface TicketDetailProps {
  ticket: TicketDetailData;
  historico?: TicketHistorico[];
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (status: string) => void;
  onAssignResponsable?: (responsavelId: string) => void;
}

const TicketDetail: React.FC<TicketDetailProps> = ({
  ticket,
  historico = [],
  onBack,
  onEdit,
  onDelete,
  onStatusChange,
  onAssignResponsable,
}) => {
  const [showStatusModal, setShowStatusModal] = useState(false);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      aberto: 'bg-blue-100 text-blue-800 border-blue-200',
      em_analise: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      aprovado: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      aguardando_pecas: 'bg-orange-100 text-orange-800 border-orange-200',
      em_andamento: 'bg-purple-100 text-purple-800 border-purple-200',
      concluido: 'bg-green-100 text-green-800 border-green-200',
      cancelado: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || colors.aberto;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      aberto: 'Aberto',
      em_analise: 'Em Análise',
      aprovado: 'Aprovado',
      aguardando_pecas: 'Aguardando Peças',
      em_andamento: 'Em Andamento',
      concluido: 'Concluído',
      cancelado: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getPriorityColor = (prioridade: string) => {
    const colors: Record<string, string> = {
      baixa: 'bg-slate-100 text-slate-700',
      media: 'bg-blue-100 text-blue-700',
      alta: 'bg-orange-100 text-orange-700',
      urgente: 'bg-red-100 text-red-700',
      emergencia: 'bg-red-600 text-white',
    };
    return colors[prioridade] || colors.media;
  };

  const getPriorityLabel = (prioridade: string) => {
    const labels: Record<string, string> = {
      baixa: 'Baixa',
      media: 'Média',
      alta: 'Alta',
      urgente: 'Urgente',
      emergencia: 'Emergência',
    };
    return labels[prioridade] || prioridade;
  };

  const getTypeLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      manutencao_preventiva: 'Manutenção Preventiva',
      manutencao_corretiva: 'Manutenção Corretiva',
      solicitacao_servico: 'Solicitação de Serviço',
      reclamacao: 'Reclamação',
      sugestao: 'Sugestão',
      emergencia: 'Emergência',
    };
    return labels[tipo] || tipo;
  };

  const getCategoriaLabel = (categoria: string) => {
    const labels: Record<string, string> = {
      eletrica: 'Elétrica',
      hidraulica: 'Hidráulica',
      elevador: 'Elevador',
      ar_condicionado: 'Ar Condicionado',
      piscina: 'Piscina',
      jardim: 'Jardim',
      limpeza: 'Limpeza',
      seguranca: 'Segurança',
      estrutural: 'Estrutural',
      eletronica: 'Eletrônica',
      telefonia: 'Telefonia',
      internet: 'Internet',
      gas: 'Gás',
      incendio: 'Incêndio',
      outro: 'Outro',
    };
    return labels[categoria] || categoria;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const statusOptions = [
    { value: 'aberto', label: 'Aberto' },
    { value: 'em_analise', label: 'Em Análise' },
    { value: 'aprovado', label: 'Aprovado' },
    { value: 'aguardando_pecas', label: 'Aguardando Peças' },
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'concluido', label: 'Concluído' },
    { value: 'cancelado', label: 'Cancelado' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-2 px-3 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-2 px-3 py-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Excluir
            </button>
          )}
          <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <MoreVertical className="w-4 h-4 text-neutral-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Principal */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
                    {ticket.titulo}
                  </h1>
                  <div className="flex items-center flex-wrap gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                      {getStatusLabel(ticket.status)}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.prioridade)}`}>
                      {getPriorityLabel(ticket.prioridade)}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-neutral-700 whitespace-pre-wrap">{ticket.descricao}</p>
            </div>

            {/* Fotos */}
            {ticket.fotos && ticket.fotos.length > 0 && (
              <div className="p-6 border-t border-neutral-200">
                <h3 className="text-sm font-medium text-neutral-700 mb-3">Fotos</h3>
                <div className="grid grid-cols-4 gap-2">
                  {ticket.fotos.map((foto, index) => (
                    <img
                      key={index}
                      src={foto}
                      alt={`Foto ${index + 1}`}
                      className="aspect-square object-cover rounded-lg border border-neutral-200 hover:scale-105 transition-transform cursor-pointer"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Informações Adicionais */}
            <div className="p-6 border-t border-neutral-200 bg-neutral-50">
              <h3 className="text-sm font-medium text-neutral-700 mb-4">Informações Adicionais</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-sm">
                  <FileText className="w-4 h-4 text-neutral-400" />
                  <div>
                    <p className="text-neutral-500">Tipo</p>
                    <p className="font-medium text-neutral-900">{getTypeLabel(ticket.tipo)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <AlertCircle className="w-4 h-4 text-neutral-400" />
                  <div>
                    <p className="text-neutral-500">Categoria</p>
                    <p className="font-medium text-neutral-900">{getCategoriaLabel(ticket.categoria)}</p>
                  </div>
                </div>
                {ticket.localAfetado && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-neutral-400" />
                    <div>
                      <p className="text-neutral-500">Local Afetado</p>
                      <p className="font-medium text-neutral-900">{ticket.localAfetado}</p>
                    </div>
                  </div>
                )}
                {ticket.apartamentoNumero && (
                  <div className="flex items-center gap-3 text-sm">
                    <Package className="w-4 h-4 text-neutral-400" />
                    <div>
                      <p className="text-neutral-500">Apartamento</p>
                      <p className="font-medium text-neutral-900">
                        {ticket.blocoNome} - {ticket.apartamentoNumero}
                      </p>
                    </div>
                  </div>
                )}
                {ticket.custo && (
                  <div className="flex items-center gap-3 text-sm">
                    <DollarSign className="w-4 h-4 text-neutral-400" />
                    <div>
                      <p className="text-neutral-500">Custo Total</p>
                      <p className="font-medium text-neutral-900">{formatCurrency(ticket.custo)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Solução */}
          {ticket.solucao && (
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="p-6">
                <h3 className="text-sm font-medium text-neutral-700 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Solução Aplicada
                </h3>
                <p className="text-neutral-700 whitespace-pre-wrap">{ticket.solucao}</p>
              </div>
            </div>
          )}

          {/* Observações */}
          {ticket.observacoes && (
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="p-6">
                <h3 className="text-sm font-medium text-neutral-700 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-neutral-400" />
                  Observações
                </h3>
                <p className="text-neutral-700 whitespace-pre-wrap">{ticket.observacoes}</p>
              </div>
            </div>
          )}

          {/* Histórico */}
          {historico.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="p-6 border-b border-neutral-200">
                <h3 className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Histórico de Alterações
                </h3>
              </div>
              <div className="divide-y divide-neutral-100">
                {historico.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-neutral-100 rounded-lg">
                        <History className="w-4 h-4 text-neutral-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-900">{item.descricao}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                          <User className="w-3 h-3" />
                          <span>{item.usuarioNome}</span>
                          <span>•</span>
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(item.data)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Card de Status */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="p-6 border-b border-neutral-200">
              <h3 className="font-medium text-neutral-900 mb-4">Ações</h3>
              {onStatusChange && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-neutral-700">
                    Alterar Status
                  </label>
                  <select
                    value={ticket.status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Informações de Data */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-neutral-400" />
                <div className="flex-1">
                  <p className="text-neutral-500">Data de Abertura</p>
                  <p className="font-medium text-neutral-900">{formatDate(ticket.dataAbertura)}</p>
                </div>
              </div>
              {ticket.dataPrevisao && (
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-neutral-400" />
                  <div className="flex-1">
                    <p className="text-neutral-500">Previsão de Conclusão</p>
                    <p className="font-medium text-neutral-900">{formatDate(ticket.dataPrevisao)}</p>
                  </div>
                </div>
              )}
              {ticket.dataResolucao && (
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <div className="flex-1">
                    <p className="text-neutral-500">Data de Conclusão</p>
                    <p className="font-medium text-neutral-900">{formatDate(ticket.dataResolucao)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pessoas Envolvidas */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Autor</p>
                  <p className="font-medium text-neutral-900">{ticket.autorNome || 'Não informado'}</p>
                </div>
              </div>
              {ticket.responsavelNome && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Responsável</p>
                    <p className="font-medium text-neutral-900">{ticket.responsavelNome}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
