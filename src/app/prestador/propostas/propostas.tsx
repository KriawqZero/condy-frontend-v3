"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { apiPrestadorListPropostas } from "../../actions/propostas";
import { ModalProposta } from "@/components/prestador/ModalProposta";

export default function PropostasPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

  async function load() {
    setLoading(true);
    const res = await apiPrestadorListPropostas();
    if (res.success) setItems(res.data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);


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
                    <Button onClick={() => setSelected(p)} className="bg-blue-600 text-white">Ver detalhes</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      {selected && (
        <ModalProposta
          proposta={selected}
          onClose={() => setSelected(null)}
          onUpdated={load}
        />
      )}
    </div>
  );
}


