'use client';

import { useEffect, useState } from 'react';
import { getAdminChamadosAction, getSystemStatsAction } from '@/app/actions/admin';
import { ModalVisualizarChamado } from '@/components/admin/ModalVisualizarChamado';
import { WhatsappIcon } from '@/components/icons/WhatsappIcon';
import { ModalCadastroImovel } from '@/components/sindico/ModalCadastroImovel';
import { Chamado, User } from '@/types';
import { OverviewCards } from './components/OverviewCards';
import { ChamadosSection } from './components/ChamadosSection';
import { ModalCadastroUsuario } from './components/ModalCadastroUsuario';
import { ModalListaUsuarios } from './components/ModalListaUsuarios';
import { ModalEnviarProposta } from './components/ModalEnviarProposta';

type DashboardStats = {
  totalChamados: number;
  chamadosPendentes: number;
  totalCondominios: number;
  mediaTempoResolucao: number;
};

export default function AdminDashboard({ _user }: { _user: User }) {
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [chamadosFiltrados, setChamadosFiltrados] = useState<Chamado[]>([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [loadingChamados, setLoadingChamados] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalChamados: 0,
    chamadosPendentes: 0,
    totalCondominios: 0,
    mediaTempoResolucao: 0,
  });
  const [selectedChamado, setSelectedChamado] = useState<Chamado | null>(null);
  const [abrirProposta, setAbrirProposta] = useState<Chamado | null>(null);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateImovelModal, setShowCreateImovelModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);

  const filtrarChamados = (termo: string) => {
    if (!termo.trim()) {
      setChamadosFiltrados(chamados);
      return;
    }

    const termoLower = termo.toLowerCase();
    const filtrados = chamados.filter(chamado => {
      const numeroChamado = chamado.numeroChamado?.toString().toLowerCase() || '';
      const condominio = chamado.imovel?.nome?.toLowerCase() || '';
      const tipo = (chamado.escopo === 'ORCAMENTO' ? 'Orçamento' : 'Imediato').toLowerCase();
      const status = chamado.status?.toLowerCase() || '';
      const prestador = chamado.prestadorAssignado?.name?.toLowerCase() || '';

      return (
        numeroChamado.includes(termoLower) ||
        condominio.includes(termoLower) ||
        tipo.includes(termoLower) ||
        status.includes(termoLower) ||
        prestador.includes(termoLower)
      );
    });

    setChamadosFiltrados(filtrados);
  };

  useEffect(() => {
    filtrarChamados(termoBusca);
  }, [termoBusca, chamados]);

  const fetchData = async () => {
    setLoadingChamados(true);
    try {
      const chamadosResponse = await getAdminChamadosAction();
      if (chamadosResponse.success && chamadosResponse.data) {
        setChamados(chamadosResponse.data);
        setChamadosFiltrados(chamadosResponse.data);
      }

      const statsResponse = await getSystemStatsAction();
      if (statsResponse.success && statsResponse.data) {
        setStats({
          totalChamados: statsResponse.data.totalChamados,
          chamadosPendentes: statsResponse.data.chamadosPendentes,
          totalCondominios: statsResponse.data.totalCondominios,
          mediaTempoResolucao: statsResponse.data.mediaTempoResolucao,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
    setLoadingChamados(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleVisualizarChamado = (event: CustomEvent) => {
      const chamadoId = event.detail?.chamadoId;
      if (chamadoId) {
        const chamado = chamados.find(c => Number(c.id) === Number(chamadoId));
        if (chamado) {
          setSelectedChamado(chamado);
        }
      }
    };

    window.addEventListener('visualizarChamado', handleVisualizarChamado as EventListener);
    return () => {
      window.removeEventListener('visualizarChamado', handleVisualizarChamado as EventListener);
    };
  }, [chamados]);

  const urgentTicketsCount = chamados.filter(chamado => chamado.prioridade === 'ALTA').length;

  return (
    <div className='relative pb-20 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8'>
      {loadingChamados ? (
        <div className='flex items-center justify-center min-h-[300px]'>
          <img src='/loading.gif' alt='Carregando...' className='w-16 h-16' />
        </div>
      ) : (
        <div className='container relative -mt-20 z-10'>
          <OverviewCards stats={stats} urgentTicketsCount={urgentTicketsCount} />
          <ChamadosSection
            chamados={chamados}
            chamadosFiltrados={chamadosFiltrados}
            termoBusca={termoBusca}
            onChangeTermoBusca={setTermoBusca}
            onClearBusca={() => setTermoBusca('')}
            loadingChamados={loadingChamados}
            onSelectChamado={setSelectedChamado}
            onOpenProposta={setAbrirProposta}
            onOpenCreateUser={() => setShowCreateUserModal(true)}
            onOpenListUsers={() => setShowUsersModal(true)}
            onOpenCreateImovel={() => setShowCreateImovelModal(true)}
          />
        </div>
      )}

      {showCreateUserModal && (
        <ModalCadastroUsuario onClose={() => setShowCreateUserModal(false)} onSuccess={fetchData} />
      )}

      {showCreateImovelModal && (
        <ModalCadastroImovel onClose={() => setShowCreateImovelModal(false)} onSuccess={fetchData} />
      )}

      {showUsersModal && <ModalListaUsuarios onClose={() => setShowUsersModal(false)} onSuccess={fetchData} />}

      {selectedChamado && (
        <ModalVisualizarChamado
          chamado={selectedChamado}
          onClose={() => setSelectedChamado(null)}
          onUpdate={fetchData}
        />
      )}

      {abrirProposta && (
        <ModalEnviarProposta
          key={abrirProposta.id}
          chamado={abrirProposta}
          onClose={() => setAbrirProposta(null)}
          onSuccess={fetchData}
        />
      )}

      <div className='fixed bottom-8 right-8 z-40'>
        <button className='w-16 h-16 bg-[#10A07B] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow'>
          <WhatsappIcon />
        </button>
      </div>
    </div>
  );
}
