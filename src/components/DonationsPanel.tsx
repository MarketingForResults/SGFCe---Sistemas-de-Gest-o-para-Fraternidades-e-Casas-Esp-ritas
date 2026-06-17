import React, { useState } from 'react';
import { 
  Heart, 
  Gift, 
  Plus, 
  Calendar, 
  BarChart, 
  Package, 
  Users, 
  UserPlus, 
  Trash2, 
  Briefcase,
  X,
  Target
} from 'lucide-react';
import { DoacaoRegistro, CampanhaArrecadacao } from '../types';

interface DonationsPanelProps {
  doacoes: DoacaoRegistro[];
  campanhas: CampanhaArrecadacao[];
  onAddDoacao: (registro: Omit<DoacaoRegistro, 'id'>) => void;
  onAddCampanha: (campanha: Omit<CampanhaArrecadacao, 'id'>) => void;
  onDeleteDoacao: (id: string) => void;
  onUpdateCampanhaFunds: (id: string, amount: number) => void;
}

export default function DonationsPanel({
  doacoes,
  campanhas,
  onAddDoacao,
  onAddCampanha,
  onDeleteDoacao,
  onUpdateCampanhaFunds
}: DonationsPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'estoque' | 'campanhas'>('estoque');
  const [showDoacaoForm, setShowDoacaoForm] = useState(false);
  const [showCampanhaForm, setShowCampanhaForm] = useState(false);

  // New Physical Donation form state
  const [doador, setDoador] = useState('');
  const [tipo, setTipo] = useState('Cesta Básica');
  const [quantidade, setQuantidade] = useState('1');
  const [unidade, setUnidade] = useState('fardos');
  const [destino, setDestino] = useState('Sopa Beneficente');

  // New Campaign form state
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [meta, setMeta] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Add fund state helper
  const [fundCampaignId, setFundCampaignId] = useState<string | null>(null);
  const [fundAmount, setFundAmount] = useState('');

  const submitDoacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doador.trim() || !tipo || parseFloat(quantidade) <= 0) {
      alert('Preencha os campos de doação corretamente.');
      return;
    }
    onAddDoacao({
      doador,
      tipo,
      quantidade: parseFloat(quantidade),
      unidade,
      data: new Date().toISOString().substring(0, 10),
      destino
    });
    setDoador('');
    setQuantidade('1');
    setShowDoacaoForm(false);
  };

  const submitCampanha = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !descricao.trim() || !meta || parseFloat(meta) <= 0 || !dataFim) {
      alert('Preencha os campos da campanha corretamente.');
      return;
    }
    onAddCampanha({
      titulo,
      descricao,
      meta: parseFloat(meta),
      arrecadado: 0,
      dataInicio: new Date().toISOString().substring(0, 10),
      dataFim,
      status: 'Ativa'
    });
    setTitulo('');
    setDescricao('');
    setMeta('');
    setDataFim('');
    setShowCampanhaForm(false);
  };

  const handleDonateToCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (fundCampaignId && fundAmount && parseFloat(fundAmount) > 0) {
      onUpdateCampanhaFunds(fundCampaignId, parseFloat(fundAmount));
      setFundCampaignId(null);
      setFundAmount('');
    }
  };

  // Stock summary calculation helpers
  const totalFardosCesta = doacoes
    .filter(d => d.tipo.toLowerCase().includes('cesta'))
    .reduce((sum, item) => sum + item.quantidade, 0);

  const totalPecasRoupa = doacoes
    .filter(d => d.tipo.toLowerCase().includes('roupa') || d.tipo.toLowerCase().includes('agasalho'))
    .reduce((sum, item) => sum + item.quantidade, 0);

  return (
    <div className="space-y-6">
      {/* Header action Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-white tracking-tight">Doações e Campanhas Sociais</h2>
          <p className="text-xs text-slate-400">Arrecadação e transparência na destinação física e financeira dos bens doados.</p>
        </div>

        {/* Sub Navigation toggle button */}
        <div className="flex space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-850">
          <button
            onClick={() => setActiveSubTab('estoque')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeSubTab === 'estoque' ? 'bg-slate-850 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Donativos em Estoque
          </button>
          <button
            onClick={() => setActiveSubTab('campanhas')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeSubTab === 'campanhas' ? 'bg-slate-850 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Campanhas Coletivas
          </button>
        </div>
      </div>

      {activeSubTab === 'estoque' ? (
        <div className="space-y-6">
          {/* Stock Metrics summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
              <span className="text-2xl block">📦</span>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Estoque Cestas Básicas</span>
                <span className="text-sm font-bold text-white font-mono">{totalFardosCesta} Unidades / fardos</span>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
              <span className="text-2xl block">👕</span>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Agasalhos / Roupas em Bazar</span>
                <span className="text-sm font-bold text-white font-mono">{totalPecasRoupa} Peças Triadas</span>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
              <span className="text-2xl block">🍲</span>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Atendidos Sopão Beneficente</span>
                <span className="text-sm font-bold text-white font-mono">~ 120 Famílias Semanais</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold font-display text-white">Registro de Recebimento de Donativos</h3>
            <button
              onClick={() => setShowDoacaoForm(!showDoacaoForm)}
              className="bg-slate-950 text-slate-300 hover:text-white text-xs border border-slate-850 hover:border-slate-800 px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
            >
              {showDoacaoForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{showDoacaoForm ? 'Fechar Formulário' : 'Novo registro físico'}</span>
            </button>
          </div>

          {/* Form Create physically donation */}
          {showDoacaoForm && (
            <form onSubmit={submitDoacao} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Registrar Entrada de Donativo Físico</h4>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4">
                  <label className="block text-xs text-slate-300 mb-1">Nome do Doador / Parceiro</label>
                  <input
                    id="don-giver-input"
                    type="text"
                    required
                    placeholder="Ex: Anônimo, Supermercado XYZ"
                    value={doador}
                    onChange={(e) => setDoador(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs text-slate-300 mb-1">Especificação / Item</label>
                  <input
                    id="don-type-input"
                    type="text"
                    required
                    placeholder="Ex: Arroz, Leite em Pó, Cobertores"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs text-slate-300 mb-1">Qtd</label>
                  <input
                    id="don-qty-input"
                    type="number"
                    min="1"
                    required
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs text-slate-300 mb-1">Unidade</label>
                  <input
                    id="don-unit-input"
                    type="text"
                    required
                    placeholder="fardos, kg, sacos"
                    value={unidade}
                    onChange={(e) => setUnidade(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="md:col-span-12">
                  <label className="block text-xs text-slate-300 mb-1">Destinação Sugerida / Setor Interno</label>
                  <input
                    id="don-dest-input"
                    type="text"
                    placeholder="Ex: Cozinha Beneficente para Sábado de Manhã, Bazar de Mães"
                    value={destino}
                    onChange={(e) => setDestino(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDoacaoForm(false)}
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 px-4 py-2 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  id="don-submit-btn"
                  type="submit"
                  className="bg-gradient-to-r from-[var(--color-chakra-4)] to-[var(--color-chakra-5)] text-white px-5 py-2 rounded-xl text-xs font-semibold hover:opacity-95 shadow"
                >
                  Confirmar Registro
                </button>
              </div>
            </form>
          )}

          {/* Donations Stock ledger table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
            <div className="overflow-x-auto rounded-xl border border-slate-850 bg-slate-950/60">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-850 text-slate-400 font-display">
                    <th className="py-3 px-4">Doador</th>
                    <th className="py-3 px-4">Donativo</th>
                    <th className="py-3 px-4 text-center">Volume / Total</th>
                    <th className="py-3 px-4">Destinação Interna</th>
                    <th className="py-3 px-4 text-right">Data Entrada</th>
                    <th className="py-3 px-4 text-center">Auditoria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {doacoes.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/40 text-slate-300 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">{item.doador}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-2 py-0.5 rounded-full">
                          🎁 {item.tipo}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium">
                        {item.quantidade} {item.unidade}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 truncate max-w-xs">{item.destino}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-450">{item.data}</td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onDeleteDoacao(item.id)}
                          className="text-slate-500 hover:text-red-400 cursor-pointer"
                          title="Remover ou distribuir item do estoque"
                        >
                          <Trash2 className="w-3.5 h-3.5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold font-display text-white">Campanhas Ativas de Arrecadação Social</h3>
            <button
              onClick={() => setShowCampanhaForm(!showCampanhaForm)}
              className="bg-slate-950 text-slate-300 hover:text-white text-xs border border-slate-850 hover:border-slate-800 px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
            >
              {showCampanhaForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{showCampanhaForm ? 'Fechar Formulário' : 'Lançar Nova Campanha'}</span>
            </button>
          </div>

          {/* Form Launch Campaign */}
          {showCampanhaForm && (
            <form onSubmit={submitCampanha} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Criar Campanha Coletiva de Arrecadação</h4>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-6">
                  <label className="block text-xs text-slate-300 mb-1">Título da Campanha</label>
                  <input
                    id="camp-title-input"
                    type="text"
                    required
                    placeholder="Ex: Sopa do Dia dos Pais, Coberturas de Inverno"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs text-slate-300 mb-1">Meta Financeira Coletor (R$)</label>
                  <input
                    id="camp-target-input"
                    type="number"
                    required
                    placeholder="Ex: 5000"
                    value={meta}
                    onChange={(e) => setMeta(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs text-slate-300 mb-1">Data Conclusão</label>
                  <input
                    id="camp-end-input"
                    type="date"
                    required
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="md:col-span-12">
                  <label className="block text-xs text-slate-300 mb-1">Explicação / Detalhes de Ajuda Social</label>
                  <textarea
                    id="camp-desc-input"
                    required
                    rows={2}
                    placeholder="Descreva para os fiéis e tarefeiros o objetivo real desta arrecadação de caridade..."
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCampanhaForm(false)}
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 px-4 py-2 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  id="camp-submit-btn"
                  type="submit"
                  className="bg-gradient-to-r from-[var(--color-chakra-6)] to-[var(--color-chakra-5)] text-white px-5 py-2 rounded-xl text-xs font-semibold hover:opacity-95 shadow"
                >
                  Lançar Campanha de Caridade
                </button>
              </div>
            </form>
          )}

          {/* Fund Donation Panel Popup Box inline */}
          {fundCampaignId && (
            <form onSubmit={handleDonateToCampaign} className="bg-slate-900 p-5 border border-[var(--color-chakra-5)] rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[var(--color-chakra-5)]" />
                <span>Simular Contribuição na Campanha</span>
              </h4>
              <p className="text-[11px] text-slate-400">Insira um valor em dinheiro que foi doado espontaneamente por Pix/Dinheiro de algum benfeitor.</p>
              
              <div className="flex gap-2">
                <input
                  id="fund-amount-input"
                  type="number"
                  required
                  placeholder="R$ 50,00"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => setFundCampaignId(null)}
                  className="bg-slate-850 text-slate-400 px-3 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  id="fund-submit-btn"
                  type="submit"
                  className="bg-[var(--color-chakra-4)] text-slate-900 font-semibold px-4 rounded-xl text-xs hover:bg-green-400"
                >
                  Registrar Pix
                </button>
              </div>
            </form>
          )}

          {/* Campanhas list Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campanhas.map((camp) => {
              const progressPct = Math.min(Math.round((camp.arrecadado / camp.meta) * 100), 100);
              return (
                <div key={camp.id} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-bold font-display text-white">{camp.titulo}</h4>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Encerramento previsto: {camp.dataFim}</span>
                    </div>
                    <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-900 px-2 py-0.5 rounded-full font-semibold">
                      {camp.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{camp.descricao}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{progressPct}% arrecadado</span>
                      <span className="font-mono text-white">R$ {camp.arrecadado} / R$ {camp.meta}</span>
                    </div>

                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-850">
                      <div 
                        className="bg-gradient-to-r from-[var(--color-chakra-2)] to-[var(--color-chakra-4)] h-full"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setFundCampaignId(camp.id)}
                      className="bg-slate-950 hover:bg-slate-850 hover:text-white border border-slate-850 px-3.5 py-2 rounded-xl text-xs text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>🤝 Registrar Pix de Doador</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
