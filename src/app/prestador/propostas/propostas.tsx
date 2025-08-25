"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { apiPrestadorListPropostas, apiPrestadorAceitarProposta, apiPrestadorRecusarProposta, apiPrestadorContraproposta } from "../../actions/propostas";

export default function PropostasPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);

  async function load() {
    setLoading(true);
    const res = await apiPrestadorListPropostas();
    if (res.success) setItems(res.data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function aceitar(id: number) {
    const r = await apiPrestadorAceitarProposta(id);
    if (r.success) await load();
  }
  async function recusar(id: number) {
    const motivo = prompt("Motivo da recusa?") || "";
    const r = await apiPrestadorRecusarProposta(id, motivo);
    if (r.success) await load();
  }
  async function contraproposta(id: number) {
    const precoMin = prompt("Preço mínimo (opcional)") || undefined;
    const precoMax = prompt("Preço máximo (opcional)") || undefined;
    const prazo = prompt("Prazo em dias (opcional)");
    const justificativa = prompt("Justificativa") || "";
    const r = await apiPrestadorContraproposta(id, { precoMin, precoMax, prazo: prazo ? Number(prazo) : undefined, justificativa });
    if (r.success) await load();
  }

  return (
    <div className="relative pb-20 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
      <div className="container relative z-10">
        <div className="font-afacad text-2xl font-bold mb-4">Propostas de Serviço</div>
        <div className="bg-white rounded-2xl shadow-sm w-full p-4">
          {loading ? (
            <div className="flex items-center justify-center min-h-[180px]"><img src="/loading.gif" alt="Carregando..." className="w-12 h-12" /></div>
          ) : items.length === 0 ? (
            <div className="text-center text-[#7F98BC]">Nenhuma proposta.</div>
          ) : (
            <div className="space-y-3">
              {items.map((p) => (
                <Card key={p.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold">Chamado {p.chamado?.numeroChamado}</div>
                      <div className="text-sm text-[#7F98BC]">{p.chamado?.imovel?.endereco}</div>
                      <div className="text-sm">Status: {p.status}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => aceitar(p.id)} className="bg-green-600 text-white">Aceitar</Button>
                      <Button onClick={() => recusar(p.id)} className="bg-red-600 text-white">Recusar</Button>
                      <Button onClick={() => contraproposta(p.id)} className="bg-yellow-600 text-white">Contrapropor</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


