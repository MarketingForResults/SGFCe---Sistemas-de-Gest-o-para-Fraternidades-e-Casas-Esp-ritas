import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Filter, 
  DollarSign, 
  Calendar, 
  Tag, 
  ClipboardList, 
  ChevronDown, 
  X,
  CheckCircle,
  FileText
} from 'lucide-react';
import { TransacaoFinanceira } from '../types';

interface FinancePanelProps {
  financeiro: TransacaoFinanceira[];
  onAddTransacao: (transacao: Omit<TransacaoFinanceira, 'id'>) => void;
  onDeleteTransacao: (id: string) => void;
}

export default function FinancePanel({ financeiro, onAddTransacao, onDeleteTransacao }: FinancePanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterTipo, setFilterTipo] = useState<'Todos' | 'Receita' | 'Despesa'>('Todos');
  const [filterCategoria, setFilterCategoria] = useState('Todas');
  
  // New transaction attributes
  const [tipo, setTipo] = useState<'Receita' | 'Despesa'>('Receita');
  const [categoria, setCategoria] = useState('');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState(new Date().toISOString().substring(0, 10));

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valor || parseFloat(valor) <= 0 || !categoria || !descricao || !data) {
      alert('Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }

    onAddTransacao({
      tipo,
      categoria,
      valor: parseFloat(valor),
      descricao,
      data
    });

    // Reset controls
    setValor('');
    setDescricao('');
    setCategoria('');
    setShowAddForm(false);
  };

  // Finance totals
  const receitas = financeiro.filter(t => t.tipo === 'Receita');
  const despesas = financeiro.filter(t => t.tipo === 'Despesa');

  const totalReceitas = receitas.reduce((sum, item) => sum + item.valor, 0);
  const totalDespesas = despesas.reduce((sum, item) => sum + item.valor, 0);
  const saldoLiquido = totalReceitas - totalDespesas;

  // Categories list
  const todasCategorias = Array.from(new Set(financeiro.map(t => t.categoria)));

  // Filtered transactions
  const transacoesFiltradas = financeiro
    .filter(t => {
      if (filterTipo !== 'Todos' && t.tipo !== filterTipo) return false;
      if (filterCategoria !== 'Todas' && t.categoria !== filterCategoria) return false;
      return true;
    })
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  // Popular category templates for ease of registration 
  const SUGGESTED_RECEITAS = [
    'Doações de Cultos', 'Contribuições de Associados', 'Bazar Beneficente', 
    'Livraria Espírita', 'Chá Beneficente', 'Arrecadação Direta Pix'
  ];

  const SUGGESTED_DESPESAS = [
    'Água e Saneamento', 'Energia Elétrica', 'Insumos Cozinha Sopa Beneficente', 
    'Manutenção Predial', 'Livros Didáticos / Impressão', 'Cestas Básicas de Apoio'
  ];

  return (
    <div className="space-y-6">
      {/* Header action row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-white tracking-tight">Fluxo Financeiro Unificado</h2>
          <p className="text-xs text-slate-400">Gerenciamento do livro-caixa, prestação de contas e dotação financeira para caridade.</p>
        </div>
        <button
          id="btn-show-add-transite"
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-[var(--color-chakra-4)] to-[var(--color-chakra-5)] text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm ? 'Fechar Formulário' : 'Lançar Transação'}</span>
        </button>
      </div>

      {/* Financial indexes widget cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Total Receipts */}
        <div className="bg-slate-900/40 border border-emerald-950 p-6 rounded-3xl relative overflow-hidden backdrop-blur">
          <div className="absolute right-0 top-0 w-24 h-full bg-emerald-500/5 rounded-full filter blur-xl" />
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-slate-400 font-medium">Receitas / Entradas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/85 text-emerald-400 flex items-center justify-center text-xs border border-emerald-900">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h4 className="text-xl font-bold text-white font-mono">
            R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h4>
          <span className="text-[10px] text-emerald-400 block mt-2">Dízimos, bazares, eventos e dotações</span>
        </div>

        {/* Card 2: Total Payments */}
        <div className="bg-slate-900/40 border border-rose-950 p-6 rounded-3xl relative overflow-hidden backdrop-blur">
          <div className="absolute right-0 top-0 w-24 h-full bg-rose-500/5 rounded-full filter blur-xl" />
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-slate-400 font-medium">Despesas / Saídas</span>
            <div className="w-8 h-8 rounded-lg bg-red-950/85 text-rose-500 flex items-center justify-center text-xs border border-rose-900">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <h4 className="text-xl font-bold text-white font-mono">
            R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h4>
          <span className="text-[10px] text-rose-400 block mt-2">Manutenções, compras sociais e faturas</span>
        </div>

        {/* Card 3: Combined Net Balances with Chakra Color indicators */}
        <div className={`p-6 rounded-3xl border relative overflow-hidden backdrop-blur ${saldoLiquido >= 0 ? 'bg-slate-900/40 border-slate-800' : 'bg-red-950/20 border-red-900/50'}`}>
          <div className="absolute right-0 top-0 w-24 h-full bg-[var(--color-chakra-6)]/10 rounded-full filter blur-xl animate-pulse" />
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-slate-400 font-medium">Superávit Líquido do Centro</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-950/85 text-[var(--color-chakra-6)] flex items-center justify-center text-xs border border-indigo-900">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h4 className={`text-xl font-bold font-mono ${saldoLiquido >= 0 ? 'text-white' : 'text-red-400'}`}>
            R$ {saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h4>
          <span className="text-[10px] text-[var(--color-chakra-5)] block mt-2">Valores direcionados 100% às causas beneficentes</span>
        </div>
      </div>

      {/* Transaction Register Form Drawer */}
      {showAddForm && (
        <form onSubmit={submitForm} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 relative space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold font-display text-white">Novo Lançamento Financeiro</h3>
            <span className="text-[10px] text-slate-400">Preencha os valores para auditoria interna</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Type Selector */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Lançamento</label>
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-850">
                <button
                  type="button"
                  onClick={() => { setTipo('Receita'); setCategoria(''); }}
                  className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all ${tipo === 'Receita' ? 'bg-emerald-500/15 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
                >
                  Receita (+)
                </button>
                <button
                  type="button"
                  onClick={() => { setTipo('Despesa'); setCategoria(''); }}
                  className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all ${tipo === 'Despesa' ? 'bg-red-500/15 text-red-400' : 'text-slate-400 hover:text-white'}`}
                >
                  Despesa (-)
                </button>
              </div>
            </div>

            {/* Value */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Valor (R$)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">R$</span>
                <input
                  id="trans-val-input"
                  type="number"
                  step="0.01"
                  required
                  placeholder="0,00"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-chakra-6)]"
                />
              </div>
            </div>

            {/* Category selection */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria de Caixa</label>
              <input
                id="trans-cat-input"
                type="text"
                list="list-categorias-suggestedas"
                required
                placeholder="Ex: Bazar, Doação, SABESP"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-chakra-6)]"
              />
              <datalist id="list-categorias-suggestedas">
                {(tipo === 'Receita' ? SUGGESTED_RECEITAS : SUGGESTED_DESPESAS).map((sug, idx) => (
                  <option key={idx} value={sug} />
                ))}
              </datalist>
            </div>

            {/* Date */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Data Competência</label>
              <input
                id="trans-date-input"
                type="date"
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-chakra-6)]"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-12">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição / Histórico do Lançamento</label>
              <input
                id="trans-desc-input"
                type="text"
                required
                placeholder="Exemplo: Compra de saco de batatas de 50kg para os sopões dos sábados de manhã"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-chakra-6)]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-slate-950 hover:bg-slate-900 text-slate-400 border border-slate-850 px-4 py-2 rounded-xl text-xs font-medium"
            >
              Cancelar
            </button>
            <button
              id="trans-submit-btn"
              type="submit"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2 rounded-xl text-xs font-medium hover:opacity-95 shadow-md"
            >
              Confirmar e Lançar
            </button>
          </div>
        </form>
      )}

      {/* Search and Filters ledger */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="text-sm font-semibold font-display text-white flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-[var(--color-chakra-5)]" />
            <span>Livro Caixa de Lançamentos de Auditoria</span>
          </h3>

          <div className="flex items-center gap-2.5">
            {/* Filter 1: Tipo */}
            <div className="flex items-center bg-slate-950 rounded-xl p-0.5 border border-slate-850">
              <button
                onClick={() => setFilterTipo('Todos')}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all ${filterTipo === 'Todos' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterTipo('Receita')}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all ${filterTipo === 'Receita' ? 'bg-emerald-950 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Receitas
              </button>
              <button
                onClick={() => setFilterTipo('Despesa')}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all ${filterTipo === 'Despesa' ? 'bg-red-950 text-red-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Despesas
              </button>
            </div>

            {/* Filter 2: Category */}
            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className="bg-slate-950 border border-slate-850 text-slate-300 text-xs rounded-xl py-1.5 px-3 focus:outline-none"
            >
              <option value="Todas">Todas as Categorias</option>
              {todasCategorias.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Ledger table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-850 bg-slate-950/60">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-850 text-slate-400 font-display">
                <th className="py-3 px-4">Comprovante / Tipo</th>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4 text-right">Valor Bruto</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {transacoesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Nenhum lançamento foi localizado correspondente aos filtros ativos.
                  </td>
                </tr>
              ) : (
                transacoesFiltradas.map((trans) => (
                  <tr key={trans.id} className="hover:bg-slate-900/40 text-slate-300 transition-colors">
                    <td className="py-3 px-4">
                      {trans.tipo === 'Receita' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-2 py-0.5 rounded-full">
                          ▲ Receita
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-950/40 border border-red-900 px-2 py-0.5 rounded-full">
                          ▼ Despesa
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{trans.data}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                        {trans.categoria}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans font-medium text-white max-w-xs truncate" title={trans.descricao}>
                      {trans.descricao}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold font-mono ${trans.tipo === 'Receita' ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {trans.tipo === 'Receita' ? '+' : '-'} R$ {trans.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onDeleteTransacao(trans.id)}
                        className="text-[10px] text-red-500 hover:text-red-400 hover:underline cursor-pointer"
                        title="Deletar lançamento de auditoria"
                      >
                        Estornar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic visual graph visualization of Ledger entries using simple pure SVGs */}
        <div className="bg-slate-950/50 rounded-2xl border border-slate-850 p-5 mt-4">
          <h4 className="text-xs uppercase font-display text-slate-400 tracking-wider mb-4 font-semibold">Balanço Comparativo de Caixa</h4>
          
          <div className="space-y-4">
            {/* Total balance progress overlay */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Rendimento Líquido de Atividades</span>
                <span className="font-mono text-slate-300 font-semibold">
                  {totalReceitas > 0 ? Math.round((saldoLiquido / totalReceitas) * 100) : 0}% de lucro social
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[var(--color-chakra-2)] to-[var(--color-chakra-4)] h-full rounded-full"
                  style={{ width: `${Math.max(0, Math.min(100, (saldoLiquido / Math.max(1, totalReceitas)) * 100))}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850 flex items-center justify-between text-xs text-slate-400 text-left">
                <span>Média por Lançamento:</span>
                <strong className="text-white font-mono">
                  R$ {financeiro.length > 0 ? (financeiro.reduce((sum, item) => sum + item.valor, 0) / financeiro.length).toFixed(2) : '0.00'}
                </strong>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850 flex items-center justify-between text-xs text-slate-400 text-left">
                <span>Lançamentos Auditados:</span>
                <strong className="text-white font-mono">{financeiro.length} transações</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
