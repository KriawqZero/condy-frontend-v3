'use client';

import { useState } from 'react';
import { createChamadoAction } from '@/app/actions/chamados';
import CondyInput from '@/components/forms/CondyInput';
import CondyButton from '@/components/forms/CondyButton';

const mockCondominios = [
  { id: '1', nome_fantasia: 'Condomínio Residencial Teste', endereco: 'Rua de Teste, 999 - São Paulo/SP' },
  { id: '2', nome_fantasia: 'Edifício Central Plaza', endereco: 'Av. Central, 123 - São Paulo/SP' },
];

const mockAtivos = [
  { id: '1', asset_code: '00001', descricao_ativo: 'Portão Automático', marca: 'Portec', modelo: 'PT-2000', local_instalacao: 'Entrada Principal' },
  { id: '2', asset_code: '00002', descricao_ativo: 'Sistema Hidráulico', marca: 'Tigre', modelo: 'Standard', local_instalacao: 'Piscina' },
  { id: '3', asset_code: '00003', descricao_ativo: 'Elevador', marca: 'Atlas', modelo: 'EL-100', local_instalacao: 'Torre A' },
];

export default function CriarChamadoForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  
  // Estados do formulário
  const [condominioId, setCondominioId] = useState('');
  const [tipoAtivo, setTipoAtivo] = useState<'existente' | 'manual'>('existente');
  const [ativoId, setAtivoId] = useState('');
  
  // Ativo manual
  const [ativoManual, setAtivoManual] = useState({
    descricao_ativo: '',
    marca: '',
    modelo: '',
    local_instalacao: '',
  });
  
  const [descricaoOcorrido, setDescricaoOcorrido] = useState('');
  const [informacoesAdicionais, setInformacoesAdicionais] = useState('');
  const [prioridade, setPrioridade] = useState<'NORMAL' | 'URGENCIA' | 'EMERGENCIA'>('NORMAL');
  const [escopo, setEscopo] = useState<'ORCAMENTO' | 'SERVICO_IMEDIATO'>('ORCAMENTO');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('condominio_id', condominioId);
      formData.append('descricao_ocorrido', descricaoOcorrido);
      formData.append('informacoes_adicionais', informacoesAdicionais);
      formData.append('prioridade', prioridade);
      formData.append('escopo', escopo);

      if (tipoAtivo === 'existente') {
        formData.append('ativo_id', ativoId);
      } else {
        formData.append('ativo_manual_descricao', ativoManual.descricao_ativo);
        formData.append('ativo_manual_marca', ativoManual.marca);
        formData.append('ativo_manual_modelo', ativoManual.modelo);
        formData.append('ativo_manual_local', ativoManual.local_instalacao);
      }

      const result = await createChamadoAction(formData);

      if (result.success) {
        setSuccess(true);
        setSuccessMessage(result.message || 'Chamado criado com sucesso!');
      } else {
        setError(result.error || 'Erro ao criar chamado');
      }
    } catch (err: any) {
      setError('Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getPrioridadeColor = (prioridadeAtual: string) => {
    switch (prioridadeAtual) {
      case 'NORMAL':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'URGENCIA':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'EMERGENCIA':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
          <img src="/svg/checkmark_success.svg" alt="Sucesso" className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Chamado Criado com Sucesso!
        </h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {successMessage}
        </p>
        <div className="space-y-4">
          <CondyButton onClick={() => setSuccess(false)} fullWidth>
            Criar Novo Chamado
          </CondyButton>
          <CondyButton variant="secondary" onClick={() => window.location.href = '/sindico/chamados'} fullWidth>
            Ver Meus Chamados
          </CondyButton>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Seleção do Condomínio */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <img src="/svg/building_icon.svg" alt="" className="w-5 h-5 mr-2" />
          Condomínio que Requer Manutenção
        </h3>
        
        <div className="grid gap-3">
          {mockCondominios.map((condominio) => (
            <label key={condominio.id} className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${condominioId === condominio.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" value={condominio.id} checked={condominioId === condominio.id} onChange={(e) => setCondominioId(e.target.value)} className="sr-only" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{condominio.nome_fantasia}</p>
                <p className="text-sm text-gray-600">{condominio.endereco}</p>
              </div>
              {condominioId === condominio.id && <img src="/svg/checkmark_success.svg" alt="Selecionado" className="w-5 h-5" />}
            </label>
          ))}
        </div>
      </div>

      {/* Seleção do Ativo */}
      {condominioId && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <img src="/svg/user.svg" alt="" className="w-5 h-5 mr-2" />
            Ativo que Requer Manutenção
          </h3>

          <div className="flex space-x-4">
            <label className="flex items-center">
              <input type="radio" value="existente" checked={tipoAtivo === 'existente'} onChange={(e) => setTipoAtivo(e.target.value as 'existente')} className="mr-2" />
              Ativo Existente
            </label>
            <label className="flex items-center">
              <input type="radio" value="manual" checked={tipoAtivo === 'manual'} onChange={(e) => setTipoAtivo(e.target.value as 'manual')} className="mr-2" />
              Inserir Manualmente
            </label>
          </div>

          {tipoAtivo === 'existente' && (
            <div className="grid gap-3">
              {mockAtivos.map((ativo) => (
                <label key={ativo.id} className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${ativoId === ativo.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" value={ativo.id} checked={ativoId === ativo.id} onChange={(e) => setAtivoId(e.target.value)} className="sr-only" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{ativo.asset_code}</span>
                      <p className="font-medium text-gray-900">{ativo.descricao_ativo}</p>
                    </div>
                    <p className="text-sm text-gray-600">{ativo.marca} - {ativo.modelo} | {ativo.local_instalacao}</p>
                  </div>
                  {ativoId === ativo.id && <img src="/svg/checkmark_success.svg" alt="Selecionado" className="w-5 h-5" />}
                </label>
              ))}
            </div>
          )}

          {tipoAtivo === 'manual' && (
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <p className="text-sm text-gray-600 mb-4">Insira as informações do ativo manualmente:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CondyInput label="Descrição do Ativo" name="ativo_manual_descricao" value={ativoManual.descricao_ativo} onChange={(e) => setAtivoManual(prev => ({ ...prev, descricao_ativo: e.target.value }))} required icon="/svg/user.svg" />
                <CondyInput label="Local de Instalação" name="ativo_manual_local" value={ativoManual.local_instalacao} onChange={(e) => setAtivoManual(prev => ({ ...prev, local_instalacao: e.target.value }))} required icon="/svg/location_pin.svg" />
                <CondyInput label="Marca" name="ativo_manual_marca" value={ativoManual.marca} onChange={(e) => setAtivoManual(prev => ({ ...prev, marca: e.target.value }))} required />
                <CondyInput label="Modelo" name="ativo_manual_modelo" value={ativoManual.modelo} onChange={(e) => setAtivoManual(prev => ({ ...prev, modelo: e.target.value }))} required />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Descrição do Ocorrido */}
      {(ativoId || (tipoAtivo === 'manual' && ativoManual.descricao_ativo)) && (
        <>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <img src="/svg/messages.svg" alt="" className="w-5 h-5 mr-2" />
              Descrição do Ocorrido
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descreva detalhadamente o problema identificado *
              </label>
              <textarea value={descricaoOcorrido} onChange={(e) => setDescricaoOcorrido(e.target.value)} required rows={4} className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors" placeholder="Ex: O portão automático não está abrindo quando acionado pelo controle remoto..." />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informações Adicionais (Opcional)</h3>
            <textarea value={informacoesAdicionais} onChange={(e) => setInformacoesAdicionais(e.target.value)} rows={3} className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors" placeholder="Adicione qualquer informação relevante..." />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Registro Fotográfico/Vídeo</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <p className="text-gray-500 text-sm">📸 Funcionalidade de upload será implementada em breve</p>
              <p className="text-xs text-gray-400 mt-1">Por enquanto, envie as fotos via WhatsApp após criar o chamado</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Prioridade na Tratativa</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 'NORMAL', label: 'Normal', desc: 'Problema comum, sem urgência' },
                { value: 'URGENCIA', label: 'Urgência', desc: 'Problema que precisa de atenção rápida' },
                { value: 'EMERGENCIA', label: 'Emergência', desc: 'Problema crítico, risco à segurança' }
              ].map((opcao) => (
                <label key={opcao.value} className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${prioridade === opcao.value ? getPrioridadeColor(opcao.value) : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" value={opcao.value} checked={prioridade === opcao.value} onChange={(e) => setPrioridade(e.target.value as any)} className="sr-only" />
                  <div className="text-center">
                    <p className="font-medium">{opcao.label}</p>
                    <p className="text-xs mt-1">{opcao.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Escopo do Serviço</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { value: 'ORCAMENTO', label: 'Solicitar Orçamento', desc: 'Quero receber um orçamento primeiro' },
                { value: 'SERVICO_IMEDIATO', label: 'Serviço Imediato', desc: 'Autorizo a execução imediata' }
              ].map((opcao) => (
                <label key={opcao.value} className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${escopo === opcao.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" value={opcao.value} checked={escopo === opcao.value} onChange={(e) => setEscopo(e.target.value as any)} className="sr-only" />
                  <div>
                    <p className="font-medium">{opcao.label}</p>
                    <p className="text-sm mt-1">{opcao.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="pt-6">
            <CondyButton type="submit" loading={loading} disabled={loading} fullWidth>
              {loading ? 'Criando Chamado...' : 'Criar Chamado'}
            </CondyButton>
          </div>
        </>
      )}
    </form>
  );
} 