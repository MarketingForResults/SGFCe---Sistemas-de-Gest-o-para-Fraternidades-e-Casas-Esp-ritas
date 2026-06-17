import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Filter, 
  Calendar, 
  Coins, 
  Activity, 
  Gift, 
  Briefcase, 
  Search, 
  Plus, 
  Save, 
  CheckCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { 
  TransacaoFinanceira, 
  AtendimentoFraterno, 
  DoacaoRegistro, 
  Colaborador, 
  RelatorioSalvo 
} from '../types';

interface ReportsPanelProps {
  currentUser: { name: string; email: string; role: string; isAdmin: boolean };
  financeiro: TransacaoFinanceira[];
  atendimentos: AtendimentoFraterno[];
  doacoes: DoacaoRegistro[];
  colaboradores: Colaborador[];
  relatorios: RelatorioSalvo[];
  onAddRelatorio: (rel: Omit<RelatorioSalvo, 'id' | 'createdAt' | 'createdByName'>) => void;
  onDeleteRelatorio?: (id: string) => void;
}

export default function ReportsPanel({
  currentUser,
  financeiro,
  atendimentos,
  doacoes,
  colaboradores,
  relatorios,
  onAddRelatorio,
  onDeleteRelatorio
}: ReportsPanelProps) {
  // Primary reporting tabs
  const [reportType, setReportType] = useState<RelatorioSalvo['type']>('financeiro');

  // Filter state values
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [genericCategory, setGenericCategory] = useState('Todos');

  // New Save Report Form toggles
  const [saveTitle, setSaveTitle] = useState('');
  const [saveDesc, setSaveDesc] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // Apply visual preset configurations from a clicked saved report
  const handleApplySavedReport = (saved: RelatorioSalvo) => {
    setReportType(saved.type);
    setStartDate(saved.filters.startDate || '');
    setEndDate(saved.filters.endDate || '');
    setGenericCategory(saved.filters.category || 'Todos');
    setStatusFilter(saved.filters.status || 'Todos');
    setSearchTerm(saved.filters.searchTerm || '');
  };

  const handleSaveReportConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveTitle.trim()) return;

    onAddRelatorio({
      title: saveTitle.trim(),
      description: saveDesc.trim() || 'Filtros personalizados salvos para agilidade em auditorias.',
      type: reportType,
      filters: {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        category: genericCategory !== 'Todos' ? genericCategory : undefined,
        status: statusFilter !== 'Todos' ? statusFilter : undefined,
        searchTerm: searchTerm ? searchTerm : undefined
      }
    });

    setSaveTitle('');
    setSaveDesc('');
    setIsSaving(false);
  };

  // Safe Date parsing helper. Check if data date is within range
  const isWithinDateRange = (itemDateStr: string) => {
    if (!startDate && !endDate) return true;
    const dateVal = new Date(itemDateStr);
    
    if (startDate) {
      const start = new Date(`${startDate}T00:00:00`);
      if (dateVal < start) return false;
    }
    if (endDate) {
      const end = new Date(`${endDate}T23:59:59`);
      if (dateVal > end) return false;
    }
    return true;
  };

  // Filter processes based on Selected Tab
  const filteredFinance = financeiro.filter(item => {
    const matchesSearch = item.descricao.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = statusFilter === 'Todos' || item.tipo === statusFilter;
    const matchesCat = genericCategory === 'Todos' || item.categoria === genericCategory;
    return matchesSearch && matchesType && matchesCat && isWithinDateRange(item.data);
  });

  const filteredAtendimentos = atendimentos.filter(item => {
    const matchesSearch = item.visitanteNome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.atendedorNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.queixasFraternas.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || item.status === statusFilter;
    return matchesSearch && matchesStatus && isWithinDateRange(item.dataAtendimento);
  });

  const filteredDoacoes = doacoes.filter(item => {
    const matchesSearch = item.doador.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.destino.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = genericCategory === 'Todos' || item.tipo.toLowerCase().includes(genericCategory.toLowerCase());
    return matchesSearch && matchesCat && isWithinDateRange(item.data);
  });

  const filteredColaboradores = colaboradores.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || (statusFilter === 'Ativo' ? item.active : !item.active);
    const matchesCargo = genericCategory === 'Todos' || item.cargo === genericCategory;
    return matchesSearch && matchesStatus && matchesCargo;
  });

  // Calculate Aggregated Metrics for display
  const totalReceitas = filteredFinance.filter(f => f.tipo === 'Receita').reduce((sum, f) => sum + f.valor, 0);
  const totalDespesas = filteredFinance.filter(f => f.tipo === 'Despesa').reduce((sum, f) => sum + f.valor, 0);
  const saldoLiquido = totalReceitas - totalDespesas;

  const totalAtendimentosCount = filteredAtendimentos.length;
  const concludedAtendimentos = filteredAtendimentos.filter(a => a.status === 'Concluído').length;

  // Retrieve unique categories helper
  const uniqueFinanceCategories = Array.from(new Set(financeiro.map(f => f.categoria)));
  const uniqueDoacaoTypes = Array.from(new Set(doacoes.map(d => d.tipo)));

  // Generate simple mock bar chart data based on loaded filters
  const generateChartData = () => {
    if (reportType === 'financeiro') {
      return [
        { label: 'Receitas', val: totalReceitas, color: '#059669' },
        { label: 'Despesas', val: totalDespesas, color: '#dc2626' },
        { label: 'Saldo', val: Math.abs(saldoLiquido), color: saldoLiquido >= 0 ? '#4f46e5' : '#ea580c' }
      ];
    } else if (reportType === 'atendimentos') {
      const g1 = filteredAtendimentos.filter(a => a.status === 'Concluído').length;
      const g2 = filteredAtendimentos.filter(a => a.status === 'Em Atendimento').length;
      const g3 = filteredAtendimentos.filter(a => a.status === 'Agendado').length;
      return [
        { label: 'Concluído', val: g1, color: '#059669' },
        { label: 'Em Progresso', val: g2, color: '#4f46e5' },
        { label: 'Agendados', val: g3, color: '#d97706' }
      ];
    } else if (reportType === 'doacoes') {
      const totalKits = filteredDoacoes.reduce((acc, d) => acc + d.quantidade, 0);
      return [
        { label: 'Volume Total Itens', val: totalKits, color: '#0d9488' },
        { label: 'Doações Distintas', val: filteredDoacoes.length, color: '#4f46e5' }
      ];
    } else {
      const activeC = filteredColaboradores.filter(c => c.active).length;
      const inactiveC = filteredColaboradores.filter(c => !c.active).length;
      return [
        { label: 'Ativos', val: activeC, color: '#059669' },
        { label: 'Inativos/Licença', val: inactiveC, color: '#94a3b8' }
      ];
    }
  };

  const chartData = generateChartData();
  const maxChartVal = Math.max(...chartData.map(d => d.val), 1);

  return (
    <div className="space-y-6">
      
      {/* Visual Header Layout */}
      <div className="bg-white border border-slate-205 p-6 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-850 tracking-tight font-display">
              Gerador de Relatórios Personalizados
            </h2>
            <p className="text-xs text-slate-600 max-w-xl font-normal leading-relaxed">
              Consolide balanços de caixa, fluxos de cadastros assistenciais fraternos, inventário de donativos ou equipe ativa. Refine por faixas temporais ou metadados e salve-as para reuniões.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowPrintPreview(true)}
              className="py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Relatório</span>
            </button>
            <button
              onClick={() => setIsSaving(true)}
              className="py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Filtros</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid for Workspace Filters + Saved queries list */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Saved Queries List Sidebar */}
        <div className="xl:col-span-3 bg-white border border-slate-205 rounded-3xl p-4 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Biblioteca de Relatórios</span>
            <span className="text-[10.5px] text-slate-400 font-mono font-bold">({relatorios.length})</span>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {relatorios.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic text-center py-4">Nenhuma query inteligente salva por administradores.</p>
            ) : (
              relatorios.map((saved) => (
                <button
                  key={saved.id}
                  onClick={() => handleApplySavedReport(saved)}
                  className="w-full text-left p-3 rounded-xl border border-slate-150 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all space-y-1 block cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <h5 className="text-xs font-extrabold text-slate-800 line-clamp-1">{saved.title}</h5>
                    <span className="text-[8.5px] uppercase font-bold bg-indigo-50 text-indigo-750 px-1.5 py-0.2 rounded font-mono shrink-0">
                      {saved.type}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 line-clamp-2 leading-relaxed font-sans">{saved.description}</p>
                  <div className="text-[9px] text-slate-400 font-mono font-semibold pt-1 border-t border-slate-100/60 block">
                    Por: {saved.createdByName.split(' ')[0]}
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-[10.5px] text-slate-550 leading-relaxed font-sans">
            <span className="font-bold block text-slate-700 mb-0.5">💡 Utilização Rápida:</span>
            Ajuste as datas e métricas na tela central e clique em **"Salvar Filtros"** para automatizar coletas futuras de auditoria física da Sede.
          </div>
        </div>

        {/* Central Filters and Output Data Area */}
        <div className="xl:col-span-9 space-y-6">
          
          {/* Main Module tabs */}
          <div className="flex flex-wrap bg-slate-100 p-1 rounded-2xl border border-slate-200 gap-1">
            <button
              onClick={() => {
                setReportType('financeiro');
                setStatusFilter('Todos');
                setGenericCategory('Todos');
              }}
              className={`flex-1 min-w-[120px] px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${reportType === 'financeiro' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-650 hover:text-slate-800'}`}
            >
              <Coins className="w-4 h-4 text-emerald-600" />
              <span>Livro Caixa</span>
            </button>
            <button
              onClick={() => {
                setReportType('atendimentos');
                setStatusFilter('Todos');
                setGenericCategory('Todos');
              }}
              className={`flex-1 min-w-[120px] px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${reportType === 'atendimentos' ? 'bg-white text-indigo-805 shadow-sm' : 'text-slate-650 hover:text-slate-800'}`}
            >
              <Activity className="w-4 h-4 text-indigo-500" />
              <span>Atendimentos</span>
            </button>
            <button
              onClick={() => {
                setReportType('doacoes');
                setStatusFilter('Todos');
                setGenericCategory('Todos');
              }}
              className={`flex-1 min-w-[120px] px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${reportType === 'doacoes' ? 'bg-white text-indigo-705 shadow-sm' : 'text-slate-650 hover:text-slate-800'}`}
            >
              <Gift className="w-4 h-4 text-fuchsia-500" />
              <span>Donativos & Estoque</span>
            </button>
            <button
              onClick={() => {
                setReportType('colaboradores');
                setStatusFilter('Todos');
                setGenericCategory('Todos');
              }}
              className={`flex-1 min-w-[120px] px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${reportType === 'colaboradores' ? 'bg-white text-indigo-705 shadow-sm' : 'text-slate-650 hover:text-slate-800'}`}
            >
              <Briefcase className="w-4 h-4 text-indigo-500" />
              <span>Trabalhadores</span>
            </button>
          </div>

          {/* Filtering Configuration Form Block */}
          <div className="bg-white border border-slate-205 p-5 rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
              <Filter className="w-3.5 h-3.5 text-indigo-650" />
              <span>Filtros de Segmentação</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-650 mb-1 font-display">Data de Início</label>
                <input
                  id="filter-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-650 mb-1 font-display">Data Fim</label>
                <input
                  id="filter-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              {/* Dynamic Categorization dropdown based on selected domain */}
              {reportType === 'financeiro' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-650 mb-1 font-display font-sans">Tipo Transação</label>
                    <select
                      id="filter-finance-type"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full text-xs"
                    >
                      <option value="Todos">Todas as Movimentações</option>
                      <option value="Receita">Receitas (+)</option>
                      <option value="Despesa">Despesas (-)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-650 mb-1 font-display font-sans">Categoria Caixa</label>
                    <select
                      id="filter-finance-cat"
                      value={genericCategory}
                      onChange={(e) => setGenericCategory(e.target.value)}
                      className="w-full text-xs"
                    >
                      <option value="Todos">Todas as Categorias</option>
                      {uniqueFinanceCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {reportType === 'atendimentos' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-650 mb-1 font-display font-sans">Fase do Atendimento</label>
                    <select
                      id="filter-consult-status"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full text-xs"
                    >
                      <option value="Todos">Todos os Registros</option>
                      <option value="Agendado">Agendado</option>
                      <option value="Em Atendimento">Em Atendimento</option>
                      <option value="Concluído">Concluído</option>
                    </select>
                  </div>
                  <div className="flex items-end text-[10.5px] text-slate-450 pb-3 leading-tight font-sans">
                    <span>Filtre voluntários ou atendidos inserindo palavras no box de busca abaixo.</span>
                  </div>
                </>
              )}

              {reportType === 'doacoes' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-650 mb-1 font-display font-sans">Material Doador</label>
                    <select
                      id="filter-donation-cat"
                      value={genericCategory}
                      onChange={(e) => setGenericCategory(e.target.value)}
                      className="w-full text-xs"
                    >
                      <option value="Todos">Todos os Insumos</option>
                      {uniqueDoacaoTypes.map(typ => (
                        <option key={typ} value={typ}>{typ}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end text-[10.5px] text-slate-450 pb-3 leading-tight font-sans">
                    <span>Métricas integradas relacionam destinos gerais de distribuição da Sede.</span>
                  </div>
                </>
              )}

              {reportType === 'colaboradores' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-650 mb-1 font-display font-sans">Estado Cadastral</label>
                    <select
                      id="filter-colab-status"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full text-xs"
                    >
                      <option value="Todos">Todos os Status</option>
                      <option value="Ativo">Exclusivo Ativos</option>
                      <option value="Inativo">Exclusivo Inativos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-650 mb-1 font-display font-sans">Função/Cargo Espírita</label>
                    <select
                      id="filter-colab-cargo"
                      value={genericCategory}
                      onChange={(e) => setGenericCategory(e.target.value)}
                      className="w-full text-xs"
                    >
                      <option value="Todos">Todos os Cargos</option>
                      <option value="Tarefeiro">Tarefeiro</option>
                      <option value="Voluntário">Voluntário</option>
                      <option value="Presidente">Presidente</option>
                      <option value="Vice-Presidente">Vice-Presidente</option>
                      <option value="Conselheiro">Conselheiro</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Keyword Search Input string */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                id="report-search-keyword"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Busca livre por palavras-chave relevantes (nomes, CPFs, observações)..."
                className="w-full text-xs pl-9"
              />
            </div>
          </div>

          {/* Dynamic computed Bento widgets */}
          {reportType === 'financeiro' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-205 p-5 rounded-3xl shadow-sm text-center">
                <span className="text-[10px] pb-1 uppercase font-bold text-slate-500 tracking-wider block">Entrada Bruta Receita</span>
                <span className="text-xl font-black text-emerald-700 font-mono">
                  R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1 font-mono">{filteredFinance.filter(f => f.tipo === 'Receita').length} transações</span>
              </div>
              <div className="bg-white border border-slate-205 p-5 rounded-3xl shadow-sm text-center">
                <span className="text-[10px] pb-1 uppercase font-bold text-slate-500 tracking-wider block">Saída Bruta Despesa</span>
                <span className="text-xl font-black text-red-700 font-mono">
                  R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1 font-mono">{filteredFinance.filter(f => f.tipo === 'Despesa').length} transações</span>
              </div>
              <div className={`border p-5 rounded-3xl shadow-sm text-center ${saldoLiquido >= 0 ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800' : 'bg-orange-50/50 border-orange-200 text-orange-900'}`}>
                <span className="text-[10px] pb-1 uppercase font-bold text-slate-650 tracking-wider block">Saldo do Exercício</span>
                <span className="text-xl font-black font-mono">
                  R$ {saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1 font-medium font-display">Liquidez Líquida Restante</span>
              </div>
            </div>
          )}

          {reportType === 'atendimentos' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-205 p-5 rounded-3xl shadow-sm text-center">
                <span className="text-[10px] pb-1 uppercase font-bold text-slate-500 tracking-wider block font-sans">Volume Atendimentos</span>
                <span className="text-xl font-black text-slate-800 font-mono">
                  {totalAtendimentosCount} Registros
                </span>
                <span className="text-[10px] text-slate-400 block mt-1 font-sans">dentro do período ativo</span>
              </div>
              <div className="bg-white border border-slate-205 p-5 rounded-3xl shadow-sm text-center">
                <span className="text-[10px] pb-1 uppercase font-bold text-slate-500 tracking-wider block font-sans">Consultas Concluídas</span>
                <span className="text-xl font-black text-indigo-700 font-mono">
                  {concludedAtendimentos} Conclusões
                </span>
                <span className="text-[10px] text-slate-400 block mt-1 font-sans">
                  {totalAtendimentosCount > 0 ? Math.round((concludedAtendimentos / totalAtendimentosCount) * 100) : 0}% de taxa resolutiva
                </span>
              </div>
              <div className="bg-white border border-slate-205 p-5 rounded-3xl shadow-sm text-center">
                <span className="text-[10px] pb-1 uppercase font-bold text-slate-500 tracking-wider block font-sans">Passes Espirituais</span>
                <span className="text-xl font-black text-cyan-700 font-mono">
                  {filteredAtendimentos.filter(a => a.recomendacoes.passe).length} Recomendados
                </span>
                <span className="text-[10px] text-slate-500 block mt-1 font-sans">pela equipe mediúnica</span>
              </div>
            </div>
          )}

          {reportType === 'doacoes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-205 p-5 rounded-3xl shadow-sm text-center">
                <span className="text-[10px] pb-1 uppercase font-bold text-slate-500 tracking-wider block font-sans">Insumos Registrados</span>
                <span className="text-xl font-black text-teal-700 font-mono">
                  {filteredDoacoes.reduce((acc, current) => acc + current.quantidade, 0)} Unidades
                </span>
                <span className="text-[10px] text-slate-400 block mt-1 font-sans">em {filteredDoacoes.length} entradas de carregamento</span>
              </div>
              <div className="bg-white border border-slate-205 p-5 rounded-3xl shadow-sm text-center">
                <span className="text-[10px] pb-1 uppercase font-bold text-slate-500 tracking-wider block font-sans">Doadores Registrados</span>
                <span className="text-xl font-black text-indigo-700 font-mono">
                  {Array.from(new Set(filteredDoacoes.map(d => d.doador))).length} Entidades
                </span>
                <span className="text-[10px] text-slate-400 block mt-1 font-sans">comprovadas no sistema fiscal</span>
              </div>
            </div>
          )}

          {reportType === 'colaboradores' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-205 p-5 rounded-3xl shadow-sm text-center">
                <span className="text-[10px] pb-1 uppercase font-bold text-slate-500 tracking-wider block font-sans">Total Tarefeiros na Query</span>
                <span className="text-xl font-black text-slate-800 font-mono">
                  {filteredColaboradores.length} Registros
                </span>
                <span className="text-[10px] text-slate-400 block mt-1 font-sans">no escalonamento de ajuda</span>
              </div>
              <div className="bg-white border border-slate-205 p-5 rounded-3xl shadow-sm text-center">
                <span className="text-[10px] pb-1 uppercase font-bold text-slate-500 tracking-wider block font-sans">Voluntários Ativos</span>
                <span className="text-xl font-black text-green-700 font-mono">
                  {filteredColaboradores.filter(c => c.active).length} Membros
                </span>
                <span className="text-[10px] text-slate-400 block mt-1 font-sans">Disponíveis de imediato</span>
              </div>
              <div className="bg-white border border-slate-205 p-5 rounded-3xl shadow-sm text-center">
                <span className="text-[10px] pb-1 uppercase font-bold text-slate-500 tracking-wider block font-sans">Acesso à Administração</span>
                <span className="text-xl font-black text-indigo-700 font-mono">
                  {filteredColaboradores.filter(c => c.permissions.admin).length} Operadores
                </span>
                <span className="text-[10px] text-slate-450 block mt-1 font-mono">Possuem acesso às chaves do painel</span>
              </div>
            </div>
          )}

          {/* Visualization bento block with custom SVG bars */}
          <div className="bg-white border border-slate-205 p-5 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5 text-indigo-650" />
                Gráficos de Tendência & Engajamento
              </span>
              <span className="text-[10px] text-slate-400 font-sans font-medium">Balanço Computado Dinâmico</span>
            </div>

            <div className="space-y-4">
              {chartData.map((data, idx) => {
                const percentage = Math.round((data.val / maxChartVal) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                      <span>{data.label}</span>
                      <span className="font-mono font-bold" style={{ color: data.color }}>
                        {reportType === 'financeiro' ? `R$ ${data.val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : `${data.val} Unidades`}
                      </span>
                    </div>
                    {/* SVG bar container */}
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/50">
                      <div 
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{ 
                          width: `${Math.max(percentage, 3)}%`, 
                          backgroundColor: data.color 
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Save Settings query Overlay Modal */}
      {isSaving && (
        <div id="save-report-modal" className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="text-xs font-black uppercase text-slate-700 font-display">Salvar esta Configuração de Relatório</h4>
              <button onClick={() => setIsSaving(false)} className="text-xs text-slate-400 hover:text-slate-600 font-bold">X</button>
            </div>

            <form onSubmit={handleSaveReportConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-650 mb-1 font-display">Nome do Relatório Inteligente</label>
                <input
                  id="save-report-title-input"
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="Ex: Auditoria das Sopa de Outono 2026"
                  className="w-full text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-650 mb-1 font-display font-sans">Recorte ou Observações Administrativas</label>
                <textarea
                  id="save-report-desc-input"
                  rows={3}
                  value={saveDesc}
                  onChange={(e) => setSaveDesc(e.target.value)}
                  placeholder="Insira detalhes que elucidem o objetivo desta query..."
                  className="w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaving(false)}
                  className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-205 text-slate-655 text-xs font-semibold rounded-xl"
                >
                  Descartar
                </button>
                <button
                  id="confirm-save-report-btn"
                  type="submit"
                  className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-750 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Salvar Biblioteca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* High Fidelity Formal Print preview sheet overlay */}
      {showPrintPreview && (
        <div id="print-preview-modal" className="fixed inset-0 bg-white z-[100] overflow-y-auto p-4 md:p-12 font-sans text-slate-800">
          <div className="max-w-4xl mx-auto space-y-8 print-section bg-white border border-slate-300 p-8 rounded-2xl shadow-xl relative">
            
            {/* Control panel buttons at the top of preview sheet (hidden on actual printing) */}
            <div className="absolute top-4 right-4 flex gap-2 print:hidden z-10">
              <button
                onClick={() => window.print()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Confirmar Impressão</span>
              </button>
              <button
                onClick={() => setShowPrintPreview(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Fechar Visualização
              </button>
            </div>

            {/* Formal Report Letterhead Banner */}
            <div className="border-b-4 border-slate-900 pb-4 flex justify-between items-end">
              <div>
                <h1 className="text-xl font-bold font-sans tracking-tight text-slate-900">SOCIEDADE DE GESTÃO DA FRATERNIDADE CAMINHO DA ESPERANÇA</h1>
                <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mt-1">SGFCe • Relatório Oficial Unificado de Administração</p>
                <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">Sede Administrativa Central • CNPJ Ativo • São Paulo, SP</p>
              </div>
              <div className="text-right text-xs font-mono font-medium">
                <div>Documento: <strong>{reportType.toUpperCase()}</strong></div>
                <div>Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
              </div>
            </div>

            {/* Range and filters info banner */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">Recorte Temporal e Filtros de Operação</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium text-slate-650">
                <div>Filtro Período: <strong className="text-slate-800">{startDate || 'Inicial'} até {endDate || 'Final'}</strong></div>
                <div>Domínio: <strong className="text-slate-800 uppercase">{reportType}</strong></div>
                <div>Palavra-chave: <strong className="text-slate-800">"{searchTerm || 'Ausente'}"</strong></div>
                <div>Emissor: <strong className="text-slate-800">{currentUser.name}</strong></div>
              </div>
            </div>

            {/* Printed data metrics depending on active Tab */}
            {reportType === 'financeiro' && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-850 tracking-wider">Demonstração de Resultados Consolidados (DRE)</h3>
                <div className="grid grid-cols-3 gap-4 border border-slate-250 p-4 rounded-xl text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Total Receitas</span>
                    <p className="text-lg font-mono font-bold text-emerald-700">R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Total Despesas</span>
                    <p className="text-lg font-mono font-bold text-red-700">R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Saldo Final Líquido</span>
                    <p className="text-lg font-mono font-bold text-slate-900">R$ {saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>

                {/* Printed table data */}
                <table className="w-full text-xs text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold">
                      <th className="p-2 border border-slate-300">Data</th>
                      <th className="p-2 border border-slate-300">Tipo</th>
                      <th className="p-2 border border-slate-300">Categoria</th>
                      <th className="p-2 border border-slate-300">Valor Bruto</th>
                      <th className="p-2 border border-slate-300">Referência</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFinance.map((f) => (
                      <tr key={f.id} className="border-b border-slate-200">
                        <td className="p-2 border border-slate-300 font-mono">{f.data}</td>
                        <td className={`p-2 border border-slate-300 font-bold ${f.tipo === 'Receita' ? 'text-emerald-700' : 'text-red-700'}`}>{f.tipo}</td>
                        <td className="p-2 border border-slate-300">{f.categoria}</td>
                        <td className="p-2 border border-slate-300 font-mono font-bold">R$ {f.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="p-2 border border-slate-300">{f.descricao}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportType === 'atendimentos' && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-850 tracking-wider">Histórico de Atendimentos Fraternos e Harmonização</h3>
                <table className="w-full text-xs text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold">
                      <th className="p-2 border border-slate-300">Data</th>
                      <th className="p-2 border border-slate-300">Visitante</th>
                      <th className="p-2 border border-slate-300">Entrevistador</th>
                      <th className="p-2 border border-slate-300">Tratamentos Recomendados</th>
                      <th className="p-2 border border-slate-300">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAtendimentos.map((a) => (
                      <tr key={a.id} className="border-b border-slate-200">
                        <td className="p-2 border border-slate-300 font-mono">{a.dataAtendimento}</td>
                        <td className="p-2 border border-slate-300 font-bold">{a.visitanteNome}</td>
                        <td className="p-2 border border-slate-300">{a.atendedorNome}</td>
                        <td className="p-2 border border-slate-300 text-[11px]">
                          {[
                            a.recomendacoes.passe ? 'Passe' : '',
                            a.recomendacoes.aguaFluidificada ? 'Água Fluidificada' : '',
                            a.recomendacoes.evangelhoLar ? 'Evangelho no Lar' : '',
                            a.recomendacoes.palestrasPublicas ? 'Palestras' : '',
                            a.recomendacoes.desobsessao ? 'Desobsessão' : ''
                          ].filter(Boolean).join(', ') || 'Nenhum'}
                        </td>
                        <td className="p-2 border border-slate-300 font-bold">{a.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportType === 'doacoes' && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-850 tracking-wider">Planilha Fiscal de Entrada e Destinos de Donativos</h3>
                <table className="w-full text-xs text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold">
                      <th className="p-2 border border-slate-300">Data</th>
                      <th className="p-2 border border-slate-300">Doador</th>
                      <th className="p-2 border border-slate-300">Tipo Donativo</th>
                      <th className="p-2 border border-slate-300">Quantidade</th>
                      <th className="p-2 border border-slate-300">Destino de Distribuição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDoacoes.map((d) => (
                      <tr key={d.id} className="border-b border-slate-200">
                        <td className="p-2 border border-slate-300 font-mono">{d.data}</td>
                        <td className="p-2 border border-slate-300 font-bold">{d.doador}</td>
                        <td className="p-2 border border-slate-300">{d.tipo}</td>
                        <td className="p-2 border border-slate-300 font-mono font-bold">{d.quantidade} {d.unidade}</td>
                        <td className="p-2 border border-slate-300">{d.destino}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportType === 'colaboradores' && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-850 tracking-wider">Escala Geral de Tarefeiros e permissões</h3>
                <table className="w-full text-xs text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold">
                      <th className="p-2 border border-slate-300">Nome Completo</th>
                      <th className="p-2 border border-slate-300">Email Contato</th>
                      <th className="p-2 border border-slate-300">Cargo Espírita</th>
                      <th className="p-2 border border-slate-300">Nível Adm</th>
                      <th className="p-2 border border-slate-300">Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredColaboradores.map((c) => (
                      <tr key={c.id} className="border-b border-slate-200">
                        <td className="p-2 border border-slate-300 font-bold">{c.name}</td>
                        <td className="p-2 border border-slate-300 font-mono">{c.email}</td>
                        <td className="p-2 border border-slate-300">{c.cargo}</td>
                        <td className="p-2 border border-slate-300">{c.permissions.admin ? 'Administrador' : 'Visualizador'}</td>
                        <td className="p-2 border border-slate-300 font-bold">
                          {c.active ? 'Ativo' : 'Afastado'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Executive signatures and footer block */}
            <div className="grid grid-cols-2 gap-8 pt-12 text-center text-xs">
              <div className="space-y-1">
                <div className="w-48 mx-auto border-b border-slate-400 h-6" />
                <p className="font-bold text-slate-700">{currentUser.name}</p>
                <p className="text-slate-450 text-[10px]">{currentUser.role} - Emissor do Relatório</p>
              </div>
              <div className="space-y-1">
                <div className="w-48 mx-auto border-b border-slate-400 h-6" />
                <p className="font-bold text-slate-700">Maria Helena Souza</p>
                <p className="text-slate-450 text-[10px]">Presidência Geral - Fraternidade</p>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-serif text-center pt-8 border-t border-slate-100 italic">
              "Trabalhar, orar e vigiar pelo bem maior da caridade espiritual." • SGFCe © 2026
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
