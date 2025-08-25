"use client";

import { Chamado } from "@/types";
import { X, User, FileText, Download, ZoomIn } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useState } from "react";

interface ModalVisualizarChamadoProps {
  chamado: Chamado;
  onClose: () => void;
  onUpdate?: () => void;
}

function getStatusBadge(status: Chamado["status"]) {
  switch (status) {
    case "NOVO":
      return (
        <Badge className="bg-blue-50 text-blue-600 border-blue-200">
          Novo chamado
        </Badge>
      );
    case "A_CAMINHO":
      return (
        <Badge className="bg-yellow-50 text-yellow-600 border-yellow-200">
          A caminho
        </Badge>
      );
    case "EM_ATENDIMENTO":
      return (
        <Badge className="bg-orange-50 text-orange-600 border-orange-200">
          Em atendimento
        </Badge>
      );
    case "CONCLUIDO":
      return (
        <Badge className="bg-green-50 text-green-600 border-green-200">
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
  onUpdate,
}: ModalVisualizarChamadoProps) {
  const [abaAtiva, setAbaAtiva] = useState("geral");
  const [imagemAmpliada, setImagemAmpliada] = useState<string | null>(null);

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




  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl relative max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-white px-6 py-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold font-afacad text-black mb-1">
                {tipoDescricao}
              </h2>
              <p className="text-gray-600 font-afacad">
                Chamado #{chamado.numeroChamado} — {chamado.imovel?.nome || "Imóvel"}
              </p>
            </div>
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={onClose}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="flex px-6 gap-2 py-3">
            {abas.map((aba) => (
              <button
                key={aba.id}
                className={`px-6 py-2 font-afacad font-semibold text-sm rounded-lg transition-all ${
                  abaAtiva === aba.id
                    ? "bg-[#1F45FF] text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
                onClick={() => setAbaAtiva(aba.id)}
              >
                {aba.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6">
            
            {/* ABA GERAL */}
            {abaAtiva === "geral" && (
              <div>
                <h3 className="font-afacad text-lg font-bold text-black mb-6">
                  Dados gerais do chamado
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Tipo de chamado:
                      </label>
                      <p className="text-black font-medium">
                        {tipoDescricao}
                      </p>
                    </div>
                    
                                         <div>
                       <label className="block text-sm font-medium text-gray-600 mb-1">
                         Imóvel e local do ativo:
                       </label>
                       <p className="text-black font-medium">
                         {chamado.imovel?.endereco || "..."}
                         {chamado.imovel?.numero && `, ${chamado.imovel.numero}`}
                       </p>
                     </div>
                     
                     <div>
                       <label className="block text-sm font-medium text-gray-600 mb-1">
                         Ativo cadastrado:
                       </label>
                       <p className="text-gray-400">
                         ...
                       </p>
                     </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Prioridade:
                      </label>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          chamado.prioridade === "ALTA" ? "bg-red-500" :
                          chamado.prioridade === "MEDIA" ? "bg-yellow-500" : "bg-green-500"
                        }`} />
                        <span className="text-black font-medium">
                          {chamado.prioridade === "ALTA" ? "Urgência" :
                           chamado.prioridade === "MEDIA" ? "Média" : "Baixa"}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Data de abertura:
                      </label>
                      <p className="text-black font-medium">
                        {formatarData(chamado.createdAt)}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Número do chamado:
                      </label>
                      <p className="text-black font-medium">
                        #{chamado.numeroChamado}
                      </p>
                    </div>
                  </div>

                                     <div className="mt-6">
                     <div>
                       <label className="block text-sm font-medium text-gray-600 mb-1">
                         Status do chamado:
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
                <h3 className="font-afacad text-lg font-bold text-black mb-6">
                  Informações sobre o serviço
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                         <div>
                       <label className="block text-sm font-medium text-gray-600 mb-1">
                         Prestador vinculado:
                       </label>
                       <p className={`font-medium ${chamado.prestadorId ? 'text-black' : 'text-gray-400'}`}>
                         {chamado.prestadorId || "Nenhum prestador alocado"}
                       </p>
                     </div>
                     
                     <div>
                       <label className="block text-sm font-medium text-gray-600 mb-1">
                         Valor do serviço:
                       </label>
                       <p className="text-black font-medium">
                         {formatarValor(chamado.valorEstimado)}
                       </p>
                     </div>
                     
                     <div>
                       <label className="block text-sm font-medium text-gray-600 mb-1">
                         Forma de pagamento:
                       </label>
                       <p className="text-gray-400">
                         ...
                       </p>
                     </div>
                     
                     <div>
                       <label className="block text-sm font-medium text-gray-600 mb-1">
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
                <h3 className="font-afacad text-lg font-bold text-black mb-6">
                  Descrição e imagens
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Descrição textual do ocorrido:
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-black leading-relaxed">
                        {chamado.descricaoOcorrido}
                      </p>
                      {chamado.informacoesAdicionais && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-600 mb-1">Informações adicionais:</p>
                          <p className="text-black">
                            {chamado.informacoesAdicionais}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                                     <div>
                     <label className="block text-sm font-medium text-gray-600 mb-2">
                       Anexos ({chamado.anexos?.length || 0}):
                     </label>
                     
                     {chamado.anexos && chamado.anexos.length > 0 ? (
                       <div className="space-y-4">
                         {/* Grid de Imagens */}
                         {chamado.anexos.filter(anexo => isImageFile(anexo.url)).length > 0 && (
                           <div>
                             <h4 className="font-afacad font-semibold text-black mb-3">Imagens</h4>
                             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                             <h4 className="font-afacad font-semibold text-black mb-3">Outros arquivos</h4>
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
                       <div className="bg-gray-50 rounded-lg p-8 text-center">
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
                 <h3 className="font-afacad text-lg font-bold text-black mb-6">
                   Informações do prestador
                 </h3>
                 
                 {chamado.prestadorId ? (
                   <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                     <div className="flex items-center gap-3 mb-4">
                       <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                         <User className="w-6 h-6 text-blue-600" />
                       </div>
                       <div>
                         <h4 className="font-afacad text-lg font-bold text-black">
                           {chamado.prestadorId}
                         </h4>
                         <p className="text-sm text-blue-600 font-medium">
                           Prestador alocado
                         </p>
                       </div>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                         <label className="block text-sm font-medium text-gray-600 mb-1">
                           Status:
                         </label>
                         <p className="text-black font-medium">
                           Ativo no chamado
                         </p>
                       </div>
                       
                       <div>
                         <label className="block text-sm font-medium text-gray-600 mb-1">
                           Contato:
                         </label>
                         <p className="text-gray-400">
                           ...
                         </p>
                       </div>
                     </div>
                   </div>
                 ) : (
                   <div className="bg-gray-50 rounded-xl p-8 text-center">
                     <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                     <h4 className="font-afacad text-lg font-bold text-gray-700 mb-2">
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
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-afacad font-semibold hover:bg-gray-300 transition-colors">
                Carregar Recibo / NF
              </button>
              <button className="px-6 py-3 bg-[#1F45FF] text-white rounded-lg font-afacad font-semibold hover:bg-[#1F45FF]/90 transition-colors shadow-md" onClick={onUpdate}>
                Atualizar chamado
              </button>
            </div>
          </div>
        </div>

              </div>
      </div>

      {/* Lightbox para ampliar imagens */}
      {imagemAmpliada && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]"
          onClick={() => setImagemAmpliada(null)}
        >
          <div className="relative max-w-screen-lg max-h-screen-lg p-4">
            <button
              onClick={() => setImagemAmpliada(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={imagemAmpliada}
              alt="Imagem ampliada"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

    </>
  );
} 
