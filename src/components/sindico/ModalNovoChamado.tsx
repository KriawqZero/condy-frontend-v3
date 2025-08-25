import { createChamadoAction } from "@/app/actions/chamados";
import { getImoveisAction } from "@/app/actions/imoveis";
import { debugAnexosPendentes, getAnexosPendentes, limparAnexosPendentes, updateAnexoChamadoIdClient } from "@/lib/api";
import { Anexo, Imovel, NovoChamadoData } from "@/types";
import { Building, MapPin, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CondySelect } from "../forms/CondySelect";
import { FileUpload } from "../forms/FileUpload";

interface ModalNovoChamadoProps {
  onClose: () => void;
  onSuccess?: () => void;
}

// Função para lidar com o fechamento do modal
const handleCloseModal = (onClose: () => void) => {
  // Opcionalmente, limpar anexos pendentes se o usuário cancelar
  // Descomente a linha abaixo se quiser limpar anexos ao cancelar
  // limparAnexosPendentes();
  onClose();
};

export function ModalNovoChamado({
  onClose,
  onSuccess,
}: ModalNovoChamadoProps) {
  const [etapa, setEtapa] = useState(1);
  const [loading, setLoading] = useState(false);

  // Estados para os dados do formulário
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [imovelSelecionado, setImovelSelecionado] = useState<string>("");
  const [localInstalacao, setLocalInstalacao] = useState<string>("");
  const [descricaoOcorrido, setDescricaoOcorrido] = useState<string>("");
  const [prioridade, setPrioridade] = useState<string>("");
  const [escopo, setEscopo] = useState<string>("");
  const [anexos, setAnexos] = useState<Anexo[]>([]);

  // Carregar imóveis na inicialização
  useEffect(() => {
    carregarImoveis();
    // Debug do estado atual dos anexos pendentes
    debugAnexosPendentes();
  }, []);

  const carregarImoveis = async () => {
    try {
      const response = await getImoveisAction();
      setImoveis(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar imóveis:", error);
    }
  };

  const Etapas = [
    { numero: "01", ativo: etapa >= 1 },
    { numero: "02", ativo: etapa >= 2 },
    { numero: "03", ativo: etapa >= 3 },
  ];

  const opcoesImovel = imoveis.map((imovel) => ({
    value: imovel.id.toString(),
    label: `${imovel.nome}: ${imovel.endereco}, ${imovel.numero} - ${imovel.cidade}/${imovel.uf}`,
  }));

  const opcoesLocalInstalacao = [
    { value: "torre-a-terreo", label: "Torre A – Térreo" },
  ];

  const opcoesPrioridade = [
    { value: "BAIXA", label: "Baixa" },
    { value: "MEDIA", label: "Média" },
    { value: "ALTA", label: "Urgente" },
  ];

  const opcoesEscopo = [
    { value: "ORCAMENTO", label: "Solicitar Orçamento" },
    { value: "SERVICO_IMEDIATO", label: "Serviço Imediato" },
  ];

  const imovelSelecionadoData = imoveis.find(
    (i) => i.id.toString() === imovelSelecionado
  );

  const handleAvancar = async () => {
    if (etapa < 3) {
      setEtapa(etapa + 1);
    } else {
      await handleEnviarChamado();
    }
  };

  const handleVoltar = () => {
    if (etapa > 1) setEtapa(etapa - 1);
  };

  const handleEnviarChamado = async () => {
    try {
      setLoading(true);

      if (!imovelSelecionado || !descricaoOcorrido || !prioridade || !escopo) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
      }

      // Verificar anexos pendentes no cliente (antes da server action)
      const anexosPendentesRaw = getAnexosPendentes();
      const anexosPendentes = anexosPendentesRaw.filter(
        (id) => typeof id === 'number' && Number.isFinite(id) && id > 0,
      );
      if (anexosPendentes.length !== anexosPendentesRaw.length) {
        console.warn('⚠️ IDs de anexo inválidos foram ignorados:', anexosPendentesRaw);
      }
      console.log("🔍 Cliente - Anexos pendentes encontrados:", anexosPendentes);

      const chamadoData: NovoChamadoData = {
        descricaoOcorrido,
        prioridade: prioridade as "BAIXA" | "MEDIA" | "ALTA",
        imovelId: parseInt(imovelSelecionado),
        escopo: escopo as "SERVICO_IMEDIATO" | "ORCAMENTO",
      };

      // Criar o chamado primeiro
      const chamadoResponse = await createChamadoAction(chamadoData);

      console.log("📋 Resposta do chamado:", {
        success: chamadoResponse.success,
        data: chamadoResponse.data,
        chamadoId: chamadoResponse.data?.id,
        anexosPendentes: anexosPendentes.length
      });

      // Se o chamado foi criado com sucesso E há anexos pendentes, associá-los no cliente
      if (chamadoResponse.success && chamadoResponse.data?.id && anexosPendentes.length > 0) {
        console.log(`📎 Associando ${anexosPendentes.length} anexos ao chamado ${chamadoResponse.data.id}`);
        
        try {
          // Associar todos os anexos pendentes ao chamado criado
          const resultadosAssociacao = await Promise.allSettled(
            anexosPendentes.map((anexoId) =>
              updateAnexoChamadoIdClient(anexoId, Number(chamadoResponse.data?.id)),
            ),
          );
          
          const sucessos = resultadosAssociacao.filter(result => result.status === 'fulfilled').length;
          const erros = resultadosAssociacao.filter(result => result.status === 'rejected').length;
          
          console.log(`✅ Anexos associados: ${sucessos} sucessos, ${erros} erros`);
          
          if (erros > 0) {
            console.warn("⚠️ Alguns anexos não puderam ser associados:", 
              resultadosAssociacao
                .filter(result => result.status === 'rejected')
                .map((result: any) => result.reason)
            );
          }
          
          // Limpar anexos pendentes após associação bem-sucedida
          if (sucessos > 0) {
            limparAnexosPendentes();
            console.log("🧹 Anexos pendentes removidos após associação");
          }
          
        } catch (error) {
          console.error("❌ Erro ao associar anexos:", error);
          // Não falhar a criação do chamado por erro na associação
        }
      } else if (anexosPendentes.length > 0) {
        console.warn("⚠️ Havia anexos pendentes mas chamado não foi criado ou sem ID", {
          success: chamadoResponse.success,
          hasId: !!chamadoResponse.data?.id,
          anexosCount: anexosPendentes.length
        });
      } else {
        console.log("ℹ️ Nenhum anexo pendente para associar");
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("❌ Erro ao criar chamado:", error);
      alert("Erro ao criar chamado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-afacad text-black">
            Novo chamado
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={() => handleCloseModal(onClose)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Progresso */}
        <div className="flex items-center justify-between mb-8">
          {Etapas.map((etapaItem, index) => (
            <div key={etapaItem.numero} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  etapaItem.ativo
                    ? "bg-[#1F45FF] text-white"
                    : "bg-[#E3E7F1] text-gray-400"
                }`}
              >
                {etapaItem.numero}
              </div>
              {index < Etapas.length - 1 && (
                <div
                  className={`h-1 w-16 ml-2 transition-all ${
                    etapa > index + 1 ? "bg-[#1F45FF]" : "bg-[#E3E7F1]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Conteúdo da etapa */}
        <div className="mb-8">
          {etapa === 1 && (
            <div>
              <h3 className="text-lg font-bold font-afacad text-black mb-2">
                1ª Etapa: Identificação do Condomínio
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Selecione o local onde o problema foi identificado para podermos
                associar corretamente o chamado
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <CondySelect
                    label="Selecione o condomínio ou empresa"
                    options={opcoesImovel}
                    value={imovelSelecionado}
                    onChange={setImovelSelecionado}
                    placeholder="Selecione um imóvel"
                  />
                  <div
                    className={`mt-2 w-full flex flex-col items-center justify-center gap-1 px-3 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed ${
                      imoveis.length === 0 ? "py-4" : "py-2"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Plus size={16} className="text-gray-400" />
                      <span className="font-medium">
                        {imoveis.length === 0
                          ? "Nenhum imóvel cadastrado"
                          : "Cadastrar novo imóvel"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 text-center">
                      Funcionalidade indisponível. Entre em contato com seu
                      atendente para cadastrar novos imóveis.
                    </span>
                  </div>
                </div>

                <CondySelect
                  label="Local da instalação"
                  options={opcoesLocalInstalacao}
                  value={localInstalacao}
                  onChange={setLocalInstalacao}
                  placeholder="Selecione o local"
                />
              </div>

              {imovelSelecionadoData && (
                <div className="mb-4">
                  <label className="block text-sm font-afacad text-[#1F45FF] mb-1">
                    Endereço
                  </label>
                  <div className="border-2 border-[#1F45FF] rounded-xl px-4 py-3 bg-gray-50 flex items-center gap-2">
                    <MapPin size={16} className="text-[#1F45FF]" />
                    <span className="text-sm">
                      {imovelSelecionadoData.nome}:{" "}
                      {imovelSelecionadoData.endereco},{" "}
                      {imovelSelecionadoData.numero} –{" "}
                      {imovelSelecionadoData.bairro} –{" "}
                      {imovelSelecionadoData.cidade} |{" "}
                      {imovelSelecionadoData.uf}
                      {imovelSelecionadoData.complemento &&
                        ` - ${imovelSelecionadoData.complemento}`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Etapa 2 removida conforme solicitação */}

          {etapa === 2 && (
            <div>
              <h3 className="text-lg font-bold font-afacad text-black mb-2">
                2ª Etapa: Descrevendo o problema
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Infoque o nível de urgência e se deseja apenas um orçamento ou
                execução imediata do serviço
              </p>

              <div className="mb-6">
                <label className="block text-sm font-afacad text-[#1F45FF] mb-1">
                  Informe detalhes sobre o problema *
                </label>
                <textarea
                  placeholder="Descreva o ocorrido"
                  className="w-full border-2 border-[#1F45FF] rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100"
                  rows={3}
                  value={descricaoOcorrido}
                  onChange={(e) => setDescricaoOcorrido(e.target.value)}
                />
              </div>

              <FileUpload anexos={anexos} onFilesUploaded={setAnexos} />
            </div>
          )}

          {etapa === 3 && (
            <div>
              <h3 className="text-lg font-bold font-afacad text-black mb-2">
                3ª Etapa: Prioridade e escopo
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Infoque o nível de urgência e se deseja apenas um orçamento ou
                execução imediata do serviço
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CondySelect
                  label="Prioridade"
                  options={opcoesPrioridade}
                  value={prioridade}
                  onChange={setPrioridade}
                  placeholder="Selecione a prioridade"
                />

                <CondySelect
                  label="Tipo de solicitação"
                  options={opcoesEscopo}
                  value={escopo}
                  onChange={setEscopo}
                  placeholder="Selecione o tipo"
                />
              </div>
            </div>
          )}
        </div>

        {/* Navegação */}
        <div className="flex justify-between">
          {etapa > 1 ? (
            <button
              className="bg-[#F4F5FF] text-[#1F45FF] font-bold px-6 py-3 rounded-xl shadow hover:bg-blue-50 transition-colors"
              onClick={handleVoltar}
              disabled={loading}
            >
              Voltar etapa
            </button>
          ) : (
            <div />
          )}

          <button
            className="bg-[#1F45FF] text-white font-bold px-6 py-3 rounded-xl shadow hover:bg-blue-600 transition-colors disabled:opacity-50"
            onClick={handleAvancar}
            disabled={loading}
          >
            {loading
              ? "Processando..."
              : etapa < 3
              ? "Avançar"
              : "Enviar chamado"}
          </button>
        </div>
      </div>
    </div>
  );
}
