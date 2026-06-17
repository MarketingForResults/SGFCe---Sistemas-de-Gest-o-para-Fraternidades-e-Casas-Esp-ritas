import React from 'react';
import { 
  Users, 
  UserCheck, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Heart, 
  HelpCircle, 
  Package, 
  Sparkles 
} from 'lucide-react';
import { Colaborador, Visitante, AtendimentoFraterno, TransacaoFinanceira, DoacaoRegistro, CampanhaArrecadacao } from '../types';
import ChakraVisualizer from './ChakraVisualizer';

interface DashboardOverviewProps {
  colaboradores: Colaborador[];
  visitantes: Visitante[];
  atendimentos: AtendimentoFraterno[];
  financeiro: TransacaoFinanceira[];
  doacoes: DoacaoRegistro[];
  campanhas: CampanhaArrecadacao[];
  onNavigate: (tab: string) => void;
}

export default function DashboardOverview({
  colaboradores,
  visitantes,
  atendimentos,
  financeiro,
  doacoes,
  campanhas,
  onNavigate
}: DashboardOverviewProps) {
  
  // Calculate financial indexes
  const totalReceitas = financeiro
    .filter(t => t.tipo === 'Receita')
    .reduce((sum, item) => sum + item.valor, 0);

  const totalDespesas = financeiro
    .filter(t => t.tipo === 'Despesa')
    .reduce((sum, item) => sum + item.valor, 0);

  const saldoLiquido = totalReceitas - totalDespesas;

  // Active counts
  const totalVoluntarios = colaboradores.filter(c => c.active).length;
  const totalAtendimentosProntos = atendimentos.filter(a => a.status === 'Concluído').length;
  const atendimentosPendentes = atendimentos.filter(a => a.status === 'Agendado' || a.status === 'Em Atendimento').length;

  return (
    <div className="space-y-6">
      {/* Visual greeting card */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-[var(--color-chakra-6)]/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[var(--color-chakra-4)] animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-750 font-display">Espaço da Luz Ativa</span>
            </div>
            <h2 className="text-2xl md:text-3.5xl font-bold text-slate-850 tracking-tight font-display">
              Gerenciando o Bem com Tecnologia e Amor
            </h2>
            <p className="text-sm text-slate-600 max-w-xl font-normal leading-relaxed">
              SGFCe consolida a gestão financeira, o controle de estoque de doações e os prontuários de Atendimento Fraterno da sua fraternidade espírita.
            </p>
          </div>
          <div>
            <button
              onClick={() => onNavigate('atendimento')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              <span>Novo Atendimento Fraterno</span>
            </button>
          </div>
        </div>
      </div>

      {/* Numerical Indexes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Index 1: Financeiro */}
        <div className="bg-white border border-slate-205 p-5 rounded-3xl flex items-center justify-between hover:border-slate-300 hover:shadow-md transition-all">
          <div className="space-y-1">
            <span className="text-xs text-slate-650 font-medium">Saldo Caixa Líquido</span>
            <h3 className="text-xl font-bold text-slate-800 font-mono">
              R$ {saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className={saldoLiquido >= 0 ? "text-emerald-600 font-semibold" : "text-red-650 font-semibold"}>
                {saldoLiquido >= 0 ? 'Equilíbrio Estável' : 'Atenção ao Caixa'}
              </span>
            </div>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${saldoLiquido >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {saldoLiquido >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </div>
        </div>

        {/* Index 2: Voluntários */}
        <div className="bg-white border border-slate-205 p-5 rounded-3xl flex items-center justify-between hover:border-slate-300 hover:shadow-md transition-all">
          <div className="space-y-1">
            <span className="text-xs text-slate-655 font-medium">Trabalhadores Ativos</span>
            <h3 className="text-xl font-bold text-slate-800 font-mono">{totalVoluntarios} Membros</h3>
            <span className="text-[10px] text-indigo-650 font-medium">Voluntários & Tarefeiros</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Index 3: Visitantes Cadastrados */}
        <div className="bg-white border border-slate-205 p-5 rounded-3xl flex items-center justify-between hover:border-slate-300 hover:shadow-md transition-all">
          <div className="space-y-1">
            <span className="text-xs text-slate-655 font-medium">Visitantes Assistidos</span>
            <h3 className="text-xl font-bold text-slate-800 font-mono">{visitantes.length} Pessoas</h3>
            <span className="text-[10px] text-teal-650 font-medium">Fichas e prontuários ativos</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Index 4: Atendimentos Fraternos */}
        <div className="bg-white border border-slate-205 p-5 rounded-3xl flex items-center justify-between hover:border-slate-300 hover:shadow-md transition-all">
          <div className="space-y-1">
            <span className="text-xs text-slate-655 font-medium">Atendimentos Efetuados</span>
            <h3 className="text-xl font-bold text-slate-800 font-mono">{totalAtendimentosProntos} Concluídos</h3>
            <span className="text-[10px] text-amber-650 font-medium">{atendimentosPendentes} em andamento / fila</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Interative Chakra System guide */}
        <div className="lg:col-span-8 space-y-6">
          <div>
            <h4 className="text-sm font-semibold uppercase text-slate-600 tracking-wider mb-3 flex items-center gap-2 font-display">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Anatomia Energética Espiritual (Guia dos Chakras)</span>
            </h4>
            <ChakraVisualizer />
          </div>

          {/* Quick List of Active campaigns */}
          <div className="bg-white border border-slate-205 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h4 className="text-sm font-semibold uppercase text-slate-755 tracking-wider font-display">
                Campanhas de Arrecadação Ativas
              </h4>
              <button 
                onClick={() => onNavigate('financeiro')} 
                className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                Ver Finanças
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {campanhas.filter(c => c.status === 'Ativa').map((camp) => {
                const percent = Math.min(Math.round((camp.arrecadado / camp.meta) * 100), 100);
                return (
                  <div key={camp.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex justify-between items-start">
                      <h5 className="text-xs font-bold font-display text-slate-800 line-clamp-1">{camp.titulo}</h5>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-250 font-medium">
                        Ativa
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-550 line-clamp-2 md:h-8">{camp.descricao}</p>
                    
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-mono text-slate-500 font-semibold">
                        <span>Meta R$ {camp.meta}</span>
                        <span className="text-indigo-650 font-extrabold">{percent}%</span>
                      </div>
                      {/* Bar indicator */}
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-slate-655 flex justify-between">
                        <span>Arrecadado:</span>
                        <strong className="text-slate-800">R$ {camp.arrecadado.toLocaleString('pt-BR')}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Quick Recent logs and donations list */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-205 rounded-3xl p-5 space-y-4 shadow-sm">
            <h4 className="text-xs font-semibold uppercase text-slate-550 tracking-wider flex items-center gap-2 font-display">
              <Package className="w-4 h-4 text-emerald-500" />
              <span>Doações Recentes Recebidas</span>
            </h4>

            <div className="divide-y divide-slate-100 space-y-3">
              {doacoes.slice(0, 4).map((doador, i) => (
                <div key={doador.id} className="pt-3 first:pt-0 flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs flex-shrink-0">
                    🎁
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h5 className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">{doador.doador}</h5>
                      <span className="text-[9px] text-slate-400 font-mono font-bold">{doador.data}</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Entregou: <strong className="text-slate-800">{doador.quantidade} {doador.unidade}</strong> de {doador.tipo}
                    </p>
                    <p className="text-[9px] text-slate-450 font-medium">Destino: {doador.destino}</p>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => onNavigate('recursos')}
              className="w-full text-center py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs text-slate-700 border border-slate-200 transition-colors cursor-pointer font-medium"
            >
              Controlar Doações
            </button>
          </div>

          {/* Spiritual Reflection Quote */}
          <div className="bg-gradient-to-tr from-indigo-50 to-indigo-100/50 border border-indigo-200/60 rounded-3xl p-5 relative overflow-hidden text-center shadow-sm">
            <Heart className="w-8 h-8 text-fuchsia-500 mx-auto mb-3 animate-pulse" />
            <p className="text-xs text-indigo-900 leading-relaxed italic font-medium">
              "A caridade é o processo de burilamento espiritual mais seguro do qual dispomos. Quem auxilia o próximo, ampara a si mesmo."
            </p>
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-indigo-700 block mt-3">
              — Emmanuel
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
