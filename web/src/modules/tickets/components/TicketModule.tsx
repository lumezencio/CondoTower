'use client';

import React, { useState, useEffect } from 'react';
import TicketList from './TicketList';
import TicketForm from './TicketForm';
import TicketDetail from './TicketDetail';
import TicketDashboard from './TicketDashboard';
import { TicketService, ChamadoData } from '../services/TicketService';

type ViewState = 'dashboard' | 'list' | 'form' | 'detail';

interface TicketModuleProps {
  condominioId: string;
  userId: string;
}

const TicketModule: React.FC<TicketModuleProps> = ({
  condominioId,
  userId,
}) => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [tickets, setTickets] = useState<ChamadoData[]>([]);
  const [summary, setSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ChamadoData | null>(null);

  const ticketService = new TicketService();

  useEffect(() => {
    loadTickets();
    loadSummary();
  }, [condominioId]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getAllChamados(condominioId);
      setTickets(data);
    } catch (error) {
      console.error('Erro ao carregar chamados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const data = await ticketService.getChamadoSummary(condominioId);
      setSummary(data);
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
    }
  };

  const handleNewTicket = () => {
    setSelectedTicketId(null);
    setSelectedTicket(null);
    setView('form');
  };

  const handleViewTicket = async (id: string) => {
    try {
      setLoading(true);
      const ticket = await ticketService.getChamadoById(id);
      if (ticket) {
        setSelectedTicket(ticket);
        setSelectedTicketId(id);
        setView('detail');
      }
    } catch (error) {
      console.error('Erro ao carregar chamado:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTicket = async (id: string) => {
    try {
      setLoading(true);
      const ticket = await ticketService.getChamadoById(id);
      if (ticket) {
        setSelectedTicket(ticket);
        setSelectedTicketId(id);
        setView('form');
      }
    } catch (error) {
      console.error('Erro ao carregar chamado:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTicket = async (data: any) => {
    try {
      setLoading(true);
      
      const ticketData: Partial<ChamadoData> = {
        ...data,
        condominioId,
        autorId: userId,
        status: 'aberto',
        dataAbertura: new Date(),
      };

      if (selectedTicketId && selectedTicket) {
        await ticketService.updateChamado(selectedTicketId, ticketData);
      } else {
        await ticketService.createChamado(ticketData as ChamadoData);
      }

      await loadTickets();
      await loadSummary();
      setView('list');
    } catch (error) {
      console.error('Erro ao salvar chamado:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!selectedTicketId) return;
    if (!confirm('Tem certeza que deseja excluir este chamado?')) return;

    try {
      setLoading(true);
      await ticketService.deleteChamado(selectedTicketId);
      await loadTickets();
      await loadSummary();
      setView('list');
    } catch (error) {
      console.error('Erro ao excluir chamado:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedTicketId) return;

    try {
      setLoading(true);
      await ticketService.changeChamadoStatus(selectedTicketId, status);
      await loadTickets();
      await loadSummary();
      
      const ticket = await ticketService.getChamadoById(selectedTicketId);
      if (ticket) {
        setSelectedTicket(ticket);
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setView('list');
    setSelectedTicketId(null);
    setSelectedTicket(null);
  };

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return (
          <TicketDashboard
            summary={summary}
            recentTickets={tickets}
            loading={loading}
            onNavigate={(section) => setView(section as ViewState)}
          />
        );

      case 'list':
        return (
          <TicketList
            tickets={tickets}
            onNewTicket={handleNewTicket}
            onViewTicket={handleViewTicket}
            onEditTicket={handleEditTicket}
            loading={loading}
          />
        );

      case 'form':
        return (
          <TicketForm
            initialData={selectedTicket || undefined}
            onSubmit={handleSubmitTicket}
            onCancel={handleBack}
            condominioId={condominioId}
            loading={loading}
          />
        );

      case 'detail':
        return selectedTicket ? (
          <TicketDetail
            ticket={selectedTicket}
            onBack={handleBack}
            onEdit={() => handleEditTicket(selectedTicketId!)}
            onDelete={handleDeleteTicket}
            onStatusChange={handleStatusChange}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {view === 'dashboard' && (
        <div className="mb-6">
          <button
            onClick={() => setView('list')}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Ver lista completa de chamados →
          </button>
        </div>
      )}
      {renderView()}
    </div>
  );
};

export default TicketModule;
