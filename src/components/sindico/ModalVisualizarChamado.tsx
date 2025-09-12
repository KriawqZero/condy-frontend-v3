"use client";

import { Chamado } from "@/types";
import { updateChamado } from "@/lib/api";
import { X, User, FileText, Download, ZoomIn } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useState, useEffect } from "react";

interface ModalVisualizarChamadoProps {
  chamado: Chamado;
  onClose: () => void;
  onUpdated?: () => void;
}

function getStatusBadge(status: Chamado["status"]) {
  switch (status) {
    case "NOVO":
      return (
        <Badge className="bg-blue-50 text-blue-600 border-blue-200 px-4 py-2 text-sm font-medium rounded-full">
          Novo chamado
        </Badge>
      );
    case "A_CAMINHO":
      return (
        <Badge className="bg-yellow-50 text-yellow-600 border-yellow-200 px-4 py-2 text-sm font-medium rounded-full">
          A caminho
        </Badge>
      );
    case "EM_ATENDIMENTO":
      return (
        <Badge className="bg-orange-50 text-orange-600 border-orange-200 px-4 py-2 text-sm font-medium rounded-full">
          Em atendimento
        </Badge>
      );
    case "CONCLUIDO":
      return (
        <Badge className="bg-green-50 text-green-600 border-green-200 px-4 py-2 text-sm font-medium rounded-full">
          Concluído
        </Badge>
      );
  }
}

function formatarValor(valor: unknown, moeda: boolean = true): string {
  const numero = Number(valor);

  if (!valor || isNaN(numero)) {
    return "Não definido";
  }

  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  if (moeda) {
    options.style = "currency";
    options.currency = "BRL";
  } else {
    options.style = "decimal";
  }

  return new Intl.NumberFormat("pt-BR", options).format(numero);
}

function formatarData(data: Date | string): string {
  const date = typeof data === "string" ? new Date(data) : data;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// formatarDataSimples não utilizado no momento

export function ModalVisualizarChamado({
  chamado,
  onClose,
  onUpdated,
}: ModalVisualizarChamadoProps) {
  const [abaAtiva, setAbaAtiva] = useState("geral");
  const [imagemAmpliada, setImagemAmpliada] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [descricao, setDescricao] = useState(chamado.descricaoOcorrido || "");
  const [infoAdicionais, setInfoAdicionais] = useState(chamado.informacoesAdicionais || "");
  const [prioridade, setPrioridade] = useState(chamado.prioridade);
  const [escopo, setEscopo] = useState(chamado.escopo);
  const [mostrarQRCode, setMostrarQRCode] = useState(false);

  const abas = [
    { id: "geral", label: "Geral" },
    { id: "servico", label: "Serviço" },
    { id: "anexos", label: "Anexos" },
    { id: "prestador", label: "Prestador" },
  ];

  const tipoDescricao = chamado.escopo === "ORCAMENTO" ? "Solicitação de orçamento" : "Manutenção preventiva";
  
  const isImageFile = (url: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  const downloadAnexo = (url: string, title?: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = title || 'anexo';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const linkVisitante =
    (typeof window !== "undefined" ? window.location.origin : "https://dev.condy.com.br") +
    `/visitante?busca=${chamado.numeroChamado}`;

  // Evitar problemas no Safari gerando QR dinamicamente via serviço com cache-control
  const qrCodeUrl =
    `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(linkVisitante)}&format=svg`;

  async function salvarAlteracoes() {
    setSalvando(true);
    try {
      await updateChamado(chamado.id as any, {
        descricaoOcorrido: descricao,
        informacoesAdicionais: infoAdicionais,
        prioridade,
        escopo,
      });
      setEditando(false);
      onUpdated?.();
    } catch (e: any) {
      alert("Erro ao atualizar chamado: " + (e.response?.data?.message || e.message));
    } finally {
      setSalvando(false);
    }
  }



  // Adiciona classe ao body quando o modal está aberto para impedir rolagem
  useEffect(() => {
    // Salva a posição atual de rolagem
    const scrollY = window.scrollY;
    
    // Adiciona classes para impedir rolagem e aplicar blur
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.classList.add('modal-open');
    
    // Adiciona estilo global para o blur
    const style = document.createElement('style');
    style.id = 'modal-blur-style';
    style.innerHTML = `
      .modal-open main, 
      .modal-open .container, 
      .modal-open .min-h-screen > div:not(.fixed) {
        filter: blur(5px);
        transition: filter 0.3s ease;
      }
      .modal-open {
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      // Remove classes e restaura rolagem quando o modal é fechado
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.classList.remove('modal-open');
      window.scrollTo(0, scrollY);
      
      // Remove o estilo de blur
      const blurStyle = document.getElementById('modal-blur-style');
      if (blurStyle) {
        blurStyle.remove();
      }
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-1 sm:p-2 md:p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl relative max-h-[95vh] sm:max-h-[90vh] overflow-hidden modal-content">
        
        {/* Header */}
        <div className="bg-white px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="pr-2 sm:pr-3">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold font-afacad text-black mb-0.5 sm:mb-1 truncate">
                {tipoDescricao}
              </h2>
              <p className="text-gray-600 font-afacad text-xs sm:text-sm md:text-base truncate">
                Chamado #{chamado.numeroChamado} — {chamado.imovel?.nome || "Imóvel"}
              </p>
            </div>
            <button
              className="text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 rounded-full p-1.5 sm:p-2 flex-shrink-0"
              onClick={onClose}
            >
              <X size={18} className="xs:hidden" />
              <X size={20} className="hidden xs:block sm:hidden" />
              <X size={24} className="hidden sm:block" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 overflow-x-auto">
          <div className="flex px-2 xs:px-3 sm:px-4 md:px-6 py-2 xs:py-2.5 sm:py-3 md:py-4 min-w-max">
            {abas.map((aba, index) => (
              <button
                key={aba.id}
                className={`px-2.5 xs:px-3 sm:px-4 md:px-6 lg:px-8 py-1.5 xs:py-2 sm:py-2.5 md:py-3 font-afacad font-semibold text-[10px] xs:text-xs sm:text-sm transition-all whitespace-nowrap ${
                  abaAtiva === aba.id
                    ? "bg-[#1F45FF] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                } ${
                  index === 0 ? "rounded-l-full" : ""
                } ${
                  index === abas.length - 1 ? "rounded-r-full" : ""
                }`}
                onClick={() => setAbaAtiva(aba.id)}
              >
                {aba.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-160px)] sm:max-h-[calc(90vh-180px)] md:max-h-[calc(90vh-200px)]">
          <div className="p-3 sm:p-4 md:p-6">
            {editando && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Descrição do ocorrido</label>
                    <textarea className="w-full border rounded-lg px-3 py-2" rows={3} value={descricao} onChange={(e)=>setDescricao(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Informações adicionais</label>
                    <textarea className="w-full border rounded-lg px-3 py-2" rows={2} value={infoAdicionais} onChange={(e)=>setInfoAdicionais(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Prioridade</label>
                      <select className="w-full border rounded-lg px-3 py-2" value={prioridade} onChange={(e)=>setPrioridade(e.target.value as any)}>
                        <option value="BAIXA">Baixa</option>
                        <option value="MEDIA">Média</option>
                        <option value="ALTA">Alta</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Escopo</label>
                      <select className="w-full border rounded-lg px-3 py-2" value={escopo} onChange={(e)=>setEscopo(e.target.value as any)}>
                        <option value="ORCAMENTO">Solicitar Orçamento</option>
                        <option value="SERVICO_IMEDIATO">Serviço Imediato</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button className="px-4 py-2 rounded-lg bg-gray-200" onClick={()=>setEditando(false)} disabled={salvando}>Cancelar</button>
                    <button className="px-4 py-2 rounded-lg bg-[#1F45FF] text-white" onClick={salvarAlteracoes} disabled={salvando}>{salvando? 'Salvando...' : 'Salvar alterações'}</button>
                  </div>
                </div>
              </div>
            )}
            
            {/* ABA GERAL */}
            {abaAtiva === "geral" && (
              <div>
                <h3 className="font-afacad text-lg sm:text-xl font-bold text-black mb-4 sm:mb-6">
                  Dados gerais do chamado
                </h3>
                
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">
                        Tipo de chamado
                      </label>
                      <p className="text-black font-medium text-base sm:text-lg">
                        {tipoDescricao}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">
                        Imóvel e local do ativo
                      </label>
                      <p className="text-black font-medium text-base sm:text-lg">
                        {chamado.imovel?.nome || "Imóvel"} - {chamado.imovel?.endereco || "..."}
                        {chamado.imovel?.numero && `, ${chamado.imovel.numero}`}
                      </p>
                    </div>
                     
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">
                        Ativo cadastrado
                      </label>
                      <p className="text-black font-medium text-base sm:text-lg">
                        Elevador social - Marca Atlas, modelo G540
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">
                        Prioridade
                      </label>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          chamado.prioridade === "ALTA" ? "bg-red-500" :
                          chamado.prioridade === "MEDIA" ? "bg-yellow-500" : "bg-green-500"
                        }`} />
                        <span className="text-black font-medium text-base sm:text-lg">
                          {chamado.prioridade === "ALTA" ? "Urgência" :
                           chamado.prioridade === "MEDIA" ? "Média" : "Baixa"}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">
                        Data de abertura
                      </label>
                      <p className="text-black font-medium text-base sm:text-lg">
                        {formatarData(chamado.createdAt)}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">
                        Número do chamado
                      </label>
                      <p className="text-black font-medium text-base sm:text-lg">
                        #{chamado.numeroChamado}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">
                        Status do chamado
                      </label>
                      <div>
                        {getStatusBadge(chamado.status)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA SERVIÇO */}
            {abaAtiva === "servico" && (
              <div>
                <h3 className="font-afacad text-lg font-bold text-black mb-4 sm:mb-6">
                  Informações sobre o serviço
                </h3>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                         <div>
                       <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
                         Prestador vinculado:
                       </label>
                       <p className={`font-medium ${chamado.prestadorAssignado ? 'text-black' : 'text-gray-400'}`}>
                         {chamado.prestadorAssignado?.name || "Nenhum prestador alocado"}
                       </p>
                     </div>
                     
                     <div>
                       <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
                         Valor do serviço:
                       </label>
                       <p className="text-black font-medium">
                         {formatarValor(chamado.valorEstimado)}
                       </p>
                     </div>
                     
                     <div>
                       <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
                         Forma de pagamento:
                       </label>
                       <p className="text-gray-400">
                         ...
                       </p>
                     </div>
                     
                     <div>
                       <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
                         Garantia adquirida:
                       </label>
                       <p className="text-gray-400">
                         ...
                       </p>
                     </div>
                  </div>

                  
                </div>
              </div>
            )}

            {/* ABA ANEXOS */}
            {abaAtiva === "anexos" && (
              <div>
                <h3 className="font-afacad text-lg font-bold text-black mb-4 sm:mb-6">
                  Descrição e imagens
                </h3>
                
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">
                      Descrição textual do ocorrido:
                    </label>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <p className="text-black leading-relaxed">
                        {chamado.descricaoOcorrido}
                      </p>
                      {chamado.informacoesAdicionais && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Informações adicionais:</p>
                          <p className="text-black">
                            {chamado.informacoesAdicionais}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                                     <div>
                     <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">
                       Anexos ({chamado.anexos?.length || 0}):
                     </label>
                     
                     {chamado.anexos && chamado.anexos.length > 0 ? (
                       <div className="space-y-4">
                         {/* Grid de Imagens */}
                         {chamado.anexos.filter(anexo => isImageFile(anexo.url)).length > 0 && (
                           <div>
                             <h4 className="font-afacad font-semibold text-black mb-2 sm:mb-3 text-sm sm:text-base">Imagens</h4>
                             <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                               {chamado.anexos
                                 .filter(anexo => isImageFile(anexo.url))
                                 .map((anexo) => (
                                   <div
                                     key={anexo.id}
                                     className="relative group cursor-pointer"
                                   >
                                     <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                       <img
                                         src={anexo.url}
                                         alt={anexo.title || `Anexo ${anexo.id}`}
                                         className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                         onClick={() => setImagemAmpliada(anexo.url)}
                                       />
                                     </div>
                                     
                                     {/* Overlay com ações */}
                                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                       <div className="flex gap-2">
                                         <button
                                           onClick={() => setImagemAmpliada(anexo.url)}
                                           className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                                           title="Ampliar imagem"
                                         >
                                           <ZoomIn className="w-4 h-4 text-gray-700" />
                                         </button>
                                         <button
                                           onClick={() => downloadAnexo(anexo.url, anexo.title || `anexo-${anexo.id}`)}
                                           className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                                           title="Baixar imagem"
                                         >
                                           <Download className="w-4 h-4 text-gray-700" />
                                         </button>
                                       </div>
                                     </div>
                                     
                                     {anexo.title && (
                                       <p className="text-xs text-gray-600 mt-1 truncate">
                                         {anexo.title}
                                       </p>
                                     )}
                                   </div>
                                 ))}
                             </div>
                           </div>
                         )}
                         
                         {/* Lista de Outros Arquivos */}
                         {chamado.anexos.filter(anexo => !isImageFile(anexo.url)).length > 0 && (
                           <div>
                             <h4 className="font-afacad font-semibold text-black mb-2 sm:mb-3 text-sm sm:text-base">Outros arquivos</h4>
                             <div className="space-y-2">
                               {chamado.anexos
                                 .filter(anexo => !isImageFile(anexo.url))
                                 .map((anexo) => (
                                   <div
                                     key={anexo.id}
                                     className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                   >
                                     <div className="flex items-center gap-3">
                                       <FileText className="w-5 h-5 text-gray-500" />
                                       <div>
                                         <p className="font-medium text-sm text-black">
                                           {anexo.title || `Anexo ${anexo.id}`}
                                         </p>
                                         <p className="text-xs text-gray-500">
                                           Criado em {formatarData(anexo.createdAt)}
                                         </p>
                                       </div>
                                     </div>
                                     <button
                                       onClick={() => downloadAnexo(anexo.url, anexo.title || `anexo-${anexo.id}`)}
                                       className="p-2 text-gray-500 hover:text-[#1F45FF] hover:bg-blue-50 rounded-lg transition-colors"
                                       title="Baixar arquivo"
                                     >
                                       <Download className="w-4 h-4" />
                                     </button>
                                   </div>
                                 ))}
                             </div>
                           </div>
                         )}
                       </div>
                     ) : (
                       <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center">
                         <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                         <p className="text-gray-400">
                           Nenhum anexo disponível
                         </p>
                       </div>
                     )}
                   </div>
                </div>
              </div>
            )}

                         {/* ABA PRESTADOR */}
             {abaAtiva === "prestador" && (
               <div>
                 <h3 className="font-afacad text-lg font-bold text-black mb-4 sm:mb-6">
                   Informações do prestador
                 </h3>
                 
                 {chamado.prestadorAssignadoId || chamado.prestadorAssignado?.name ? (
                   <div className="bg-blue-50 rounded-xl p-4 sm:p-6 border border-blue-200">
                     <div className="flex items-center gap-3 mb-4">
                       <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                         <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                       </div>
                       <div>
                         <h4 className="font-afacad text-base sm:text-lg font-bold text-black">
                           {chamado.prestadorAssignado?.name}
                         </h4>
                         <p className="text-xs sm:text-sm text-blue-600 font-medium">
                           Prestador alocado
                         </p>
                       </div>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                         <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
                           Status:
                         </label>
                         <p className="text-gray-900 font-medium">
                           Ativo no chamado
                         </p>
                       </div>
                       
                       <div>
                         <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
                           Contato:
                         </label>
                         <p className="text-gray-900">
                           {chamado.prestadorAssignado?.whatsapp}
                         </p>
                       </div>
                     </div>
                   </div>
                 ) : (
                   <div className="bg-gray-50 rounded-xl p-6 sm:p-8 text-center">
                     <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                     <h4 className="font-afacad text-base sm:text-lg font-bold text-gray-700 mb-2">
                       Nenhum prestador alocado
                     </h4>
                     <p className="text-gray-500">
                       Aguardando a administração alocar um prestador para este chamado.
                     </p>
                   </div>
                 )}
               </div>
             )}

          </div>
        </div>

        {/* Footer - Botões fixos */}
        <div className="bg-white px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-between">
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3 sm:gap-4 w-full">
              <button
                className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gray-100 text-gray-700 rounded-full font-afacad font-semibold hover:bg-gray-200 transition-colors text-xs sm:text-sm md:text-base flex items-center justify-center"
                onClick={() => setMostrarQRCode(true)}
              >
                <span className="whitespace-nowrap">Gerar QR Code</span>
              </button>
              <button className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-blue-50 text-blue-600 rounded-full font-afacad font-semibold hover:bg-blue-100 transition-colors text-xs sm:text-sm md:text-base flex items-center justify-center">
                <span className="whitespace-nowrap">Baixar Recibo / NF</span>
              </button>
              {!editando ? (
                <button className="col-span-2 px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-[#1F45FF] text-white rounded-full font-afacad font-semibold hover:bg-[#1F45FF]/90 transition-colors shadow-md text-xs sm:text-sm md:text-base flex items-center justify-center" onClick={() => setEditando(true)}>
                  <span className="whitespace-nowrap">Atualizar status</span>
                </button>
              ) : (
                <button className="col-span-2 px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-green-600 text-white rounded-full font-afacad font-semibold hover:bg-green-700 transition-colors shadow-md text-xs sm:text-sm md:text-base flex items-center justify-center" onClick={salvarAlteracoes} disabled={salvando}>
                  {salvando ? 'Salvando...' : 'Salvar alterações'}
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
      </div>

      {/* Lightbox para ampliar imagens */}
      {imagemAmpliada && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4"
          onClick={() => setImagemAmpliada(null)}
        >
          <div className="relative max-w-full max-h-full p-2 sm:p-4">
            <button
              onClick={() => setImagemAmpliada(null)}
              className="absolute -top-4 -right-4 text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded-full"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <img
              src={imagemAmpliada}
              alt="Imagem ampliada"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Modal QR Code */}
      {mostrarQRCode && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={() => setMostrarQRCode(false)}>
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-3xl relative max-w-[90%] max-h-[90%]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMostrarQRCode(false)}
              className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 text-blue-600 hover:text-blue-800 bg-blue-50 p-1.5 sm:p-2 rounded-full"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </button>
            <div className="text-center">
              <img src={qrCodeUrl} alt="QR Code do chamado" className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 mx-auto" />
              <p className="mt-3 text-sm sm:text-base text-gray-700 font-medium">Escaneie para acessar o chamado</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}