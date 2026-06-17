import React, { useState } from 'react';
import { 
  ShoppingBag, 
  HelpCircle, 
  Clock, 
  CheckCircle, 
  Plus, 
  Filter, 
  Trash2, 
  X,
  AlertTriangle,
  Send
} from 'lucide-react';
import { CompraItem } from '../types';

interface PurchasesPanelProps {
  compras: CompraItem[];
  currentUser: { name: string; email: string; role: string; isAdmin: boolean };
  onAddCompra: (item: Omit<CompraItem, 'id'>) => void;
  onUpdateStatus: (id: string, newStatus: CompraItem['status']) => void;
  onDeleteCompra: (id: string) => void;
}

export default function PurchasesPanel({
  compras,
  currentUser,
  onAddCompra,
  onUpdateStatus,
  onDeleteCompra
}: PurchasesPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<CompraItem['status'] | 'Todos'>('Todos');

  // Add Item States
  const [item, setItem] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [valorEstimado, setValorEstimado] = useState('');
  const [categoria, setCategoria] = useState('Sopa Fraterna');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.trim() || parseInt(quantidade) <= 0 || !valorEstimado) {
      alert('Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }

    onAddCompra({
      item,
      quantidade: parseInt(quantidade),
      solicitante: currentUser.name || 'Tarefeiro Logado',
      status: 'Pendente',
      valorEstimado: parseFloat(valorEstimado),
      dataSolicitacao: new Date().toISOString().substring(0, 10),
      categoria
    });

    // Reset controls
    setItem('');
    setQuantidade('1');
    setValorEstimado('');
    setShowAddForm(false);
  };

  const filteredItems = compras.filter(c => {
    if (filterStatus !== 'Todos' && c.status !== filterStatus) return false;
    return true;
  }).sort((a, b) => new Date(b.dataSolicitacao).getTime() - new Date(a.dataSolicitacao).getTime());

  // Calculate sum of approved estimate values
  const totalEstimadoPendentes = compras
    .filter(c => c.status === 'Pendente' || c.status === 'Aprovado')
    .reduce((sum, item) => sum + (item.valorEstimado * item.quantidade), 0);

  return (
    <div className="space-y-6">
      {/* Header action Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-white tracking-tight">Solicitações de Compras e Insumos</h2>
          <p className="text-xs text-slate-400">Demanda interna para conservação da casa de caridade e confecção de sopões beneficentes.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-[var(--color-chakra-6)] to-[var(--color-chakra-5)] text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm ? 'Fechar Cadastro' : 'Nova Solicitação'}</span>
        </button>
      </div>

      {/* Top micro summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-[var(--color-chakra-6)] flex items-center justify-center flex-shrink-0 font-bold">
            🛍️
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Orçado Ativo</span>
            <span className="text-sm font-bold text-white font-mono">
              R$ {totalEstimadoPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center flex-shrink-0">
            ⏳
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Itens em Análise</span>
            <span className="text-sm font-bold text-white font-mono">
              {compras.filter(c => c.status === 'Pendente').length} Requisições
            </span>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
            ✅
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Adquiridos Recentes</span>
            <span className="text-sm font-bold text-white font-mono">
              {compras.filter(c => c.status === 'Comprado').length} Concluídos
            </span>
          </div>
        </div>
      </div>

      {/* Form Drawer */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 relative space-y-4">
          <div className="pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold font-display text-white">Requerer Compra de Insumo</h3>
            <p className="text-[10px] text-slate-400">Insira a especificação correta do estoque que precisa ser adquirido para a Fraternidade.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Description */}
            <div className="md:col-span-12">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Especifique o Item / Descrição do Produto</label>
              <input
                id="pur-item-input"
                type="text"
                required
                placeholder="Exemplo: Gás de cozinha 13kg ULTRAGAZ para fogão industrial"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-chakra-6)]"
              />
            </div>

            {/* Categoria */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Setor Destinatário</label>
              <select
                id="pur-cat-select"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-chakra-6)]"
              >
                <option value="Sopa Fraterna">Sopa Fraterna / Cozinha Social</option>
                <option value="Manutenção">Manutenção Geral / Pintura / Sede</option>
                <option value="Limpeza">Produtos de Limpeza / Higiene Sede</option>
                <option value="Livraria/Eventos">Livraria Espírita / Eventos de Caridade</option>
                <option value="Material Administrativo">Secretaria / Material de Escritório</option>
              </select>
            </div>

            {/* Quantidade */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Quantidade Requerida</label>
              <input
                id="pur-qty-input"
                type="number"
                min="1"
                required
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-chakra-6)]"
              />
            </div>

            {/* Valor Estimado */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Valor Unitário Estimado (R$)</label>
              <input
                id="pur-val-input"
                type="number"
                step="0.01"
                required
                placeholder="0,00"
                value={valorEstimado}
                onChange={(e) => setValorEstimado(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-chakra-6)]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-slate-950 hover:bg-slate-900 text-slate-400 border border-slate-850 px-4 py-2 rounded-xl text-xs"
            >
              Cancelar
            </button>
            <button
              id="pur-submit-btn"
              type="submit"
              className="bg-gradient-to-r from-[var(--color-chakra-6)] to-[var(--color-chakra-5)] text-white px-5 py-2 rounded-xl text-xs font-medium hover:opacity-95 shadow-md flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar para Aprovação</span>
            </button>
          </div>
        </form>
      )}

      {/* Main inventory table and filters */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="text-sm font-semibold font-display text-white">Conselho de Suprimentos</h3>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>Filtrar por Status:</span>
            </span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-slate-950 border border-slate-850 text-xs text-slate-300 rounded-xl py-1.5 px-3 focus:outline-none"
            >
              <option value="Todos">Mostrar Todos</option>
              <option value="Pendente">Pendentes</option>
              <option value="Aprovado">Aprovados</option>
              <option value="Comprado">Adquiridos</option>
              <option value="Cancelado">Cancelados</option>
            </select>
          </div>
        </div>

        {/* Requests Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.length === 0 ? (
            <div className="col-span-2 py-10 bg-slate-950/40 border border-slate-850 rounded-2xl text-center text-slate-500 text-xs">
              Nenhuma solicitação de compra localizada nesta categoria.
            </div>
          ) : (
            filteredItems.map((c) => {
              // Status Styling
              let statusLabel = 'Pendente';
              let statusClass = 'bg-amber-950/80 text-amber-300 border-amber-900';
              if (c.status === 'Aprovado') {
                statusLabel = 'Aprovado Presidência';
                statusClass = 'bg-blue-950/80 text-blue-300 border-blue-900';
              } else if (c.status === 'Comprado') {
                statusLabel = 'Adquirido / No Estoque';
                statusClass = 'bg-emerald-950/80 text-emerald-300 border-emerald-900';
              } else if (c.status === 'Cancelado') {
                statusLabel = 'Cancelado';
                statusClass = 'bg-red-950/80 text-red-300 border-red-900';
              }

              const isManagerOrAdmin = currentUser.isAdmin || currentUser.role === 'Presidente' || currentUser.role === 'Vice-Presidente';

              return (
                <div key={c.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col justify-between space-y-4 hover:border-slate-800 transition-all">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800 font-mono">
                        {c.categoria}
                      </span>
                      <span className={`text-[10px] border px-2 py-0.5 rounded-full font-medium ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-white leading-snug">{c.item}</h4>
                    <p className="text-[11px] text-slate-400">
                      Solicitado por: <strong className="text-slate-300">{c.solicitante}</strong> em {c.dataSolicitacao}
                    </p>
                  </div>

                  <div className="h-0.5 bg-slate-900 w-full" />

                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase tracking-wider">Custo Previsto</span>
                      <span className="font-bold text-white font-mono">
                        {c.quantidade}x R$ {c.valorEstimado.toFixed(2)} = <strong className="text-[var(--color-chakra-3)]">R$ {(c.quantidade * c.valorEstimado).toFixed(2)}</strong>
                      </span>
                    </div>

                    {/* Manager actions */}
                    <div className="flex gap-1.5">
                      {isManagerOrAdmin && c.status === 'Pendente' && (
                        <>
                          <button
                            onClick={() => onUpdateStatus(c.id, 'Cancelado')}
                            className="bg-red-950/40 text-red-400 border border-red-900 text-[10px] font-medium px-2 py-1 rounded hover:bg-red-950/80 transition-colors cursor-pointer"
                          >
                            Rejeitar
                          </button>
                          <button
                            onClick={() => onUpdateStatus(c.id, 'Aprovado')}
                            className="bg-blue-950/40 text-blue-400 border border-blue-900 text-[10px] font-medium px-2.5 py-1 rounded hover:bg-blue-950/80 transition-colors cursor-pointer"
                          >
                            Aprovar
                          </button>
                        </>
                      )}

                      {isManagerOrAdmin && c.status === 'Aprovado' && (
                        <button
                          onClick={() => onUpdateStatus(c.id, 'Comprado')}
                          className="bg-emerald-950/40 text-emerald-400 border border-emerald-900 text-[10px] font-medium px-2.5 py-1 rounded hover:bg-emerald-950/80 transition-colors cursor-pointer"
                        >
                          Marcar Comprado
                        </button>
                      )}

                      <button
                        onClick={() => onDeleteCompra(c.id)}
                        className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-900 transition-colors"
                        title="Deletar solicitação"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
