'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Calendar,
  User,
  MapPin
} from 'lucide-react';

interface Ticket {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  categoria: string;
  status: string;
  prioridade: string;
  localAfetado?: string;
  dataAbertura: Date;
  dataPrevisao?: Date;
  custo?: number;
  autorNome?: string;
  responsavelNome?: string;
}

interface TicketListProps {
  tickets?: Ticket[];
  onNewTicket?: () => void;
  onViewTicket?: (id: string) => void;
  onEditTicket?: (id: string) => void;
  loading?: boolean;
}

const TicketList: React.FC<TicketListProps> = ({
  tickets = [],
  onNewTicket,
  onViewTicket,
  onEditTicket,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [priorityFilter, setPriorityFilter] = useState<string>('todos');

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

  const getTypeIcon = (tipo: string) => {
    const icons: Record<string, React.ReactNode> = {
      manutencao_preventiva: <CheckCircle className="w-4 h-4" />,
      manutencao_corretiva: <AlertCircle className="w-4 h-4" />,
      solicitacao_servico: <FileText className="w-4 h-4" />,
      reclamacao: <AlertCircle className="w-4 h-4" />,
      sugestao: <TrendingUp className="w-4 h-4" />,
      emergencia: <Clock className="w-4 h-4" />,
    };
    return icons[tipo] || <FileText className="w-4 h-4" />;
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'todos' || ticket.prioridade === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">Chamados</h2>
            <p className="text-sm text-neutral-500 mt-1">
              {filteredTickets.length} {filteredTickets.length === 1 ? 'chamado encontrado' : 'chamados encontrados'}
            </p>
          </div>
          {onNewTicket && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNewTicket}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-primary-500 to-primary-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Novo Chamado
            </motion.button>
          )}
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar chamados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm bg-white"
            >
              <option value="todos">Todos Status</option>
              <option value="aberto">Aberto</option>
              <option value="em_analise">Em Análise</option>
              <option value="aprovado">Aprovado</option>
              <option value="aguardando_pecas">Aguardando Peças</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm bg-white"
            >
              <option value="todos">Todas Prioridades</option>
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
              <option value="emergencia">Emergência</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
          <p className="text-neutral-500 mt-4">Carregando chamados...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="p-8 text-center">
          <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Nenhum chamado encontrado</h3>
          <p className="text-neutral-500">
            {searchTerm || statusFilter !== 'todos' || priorityFilter !== 'todos'
              ? 'Tente ajustar os filtros de busca'
              : 'Comece criando um novo chamado'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-100">
          {filteredTickets.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 hover:bg-neutral-50 transition-colors group"
            >
              <div className="flex items-start gap-4">
                {/* Ícone do Tipo */}
                <div className={`p-2 rounded-lg ${
                  ticket.tipo === 'emergencia' ? 'bg-red-100 text-red-600' :
                  ticket.tipo === 'manutencao_corretiva' ? 'bg-orange-100 text-orange-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {getTypeIcon(ticket.tipo)}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-neutral-900 truncate">{ticket.titulo}</h3>
                      <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{ticket.descricao}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                        {getStatusLabel(ticket.status)}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.prioridade)}`}>
                        {getPriorityLabel(ticket.prioridade)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center flex-wrap gap-4 text-xs text-neutral-500">
                    <span className="inline-flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {getTypeLabel(ticket.tipo)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {ticket.localAfetado || 'Não especificado'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(ticket.dataAbertura)}
                    </span>
                    {ticket.custo && (
                      <span className="inline-flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {formatCurrency(ticket.custo)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onViewTicket && (
                    <button
                      onClick={() => onViewTicket(ticket.id)}
                      className="p-2 hover:bg-neutral-200 rounded-lg transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye className="w-4 h-4 text-neutral-600" />
                    </button>
                  )}
                  {onEditTicket && (
                    <button
                      onClick={() => onEditTicket(ticket.id)}
                      className="p-2 hover:bg-neutral-200 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4 text-neutral-600" />
                    </button>
                  )}
                  <button className="p-2 hover:bg-neutral-200 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-neutral-600" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketList;
