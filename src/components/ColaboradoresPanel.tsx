import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldAlert, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Briefcase,
  Sliders,
  Check,
  X
} from 'lucide-react';
import { Colaborador, CargoColaborador } from '../types';

interface ColaboradoresPanelProps {
  colaboradores: Colaborador[];
  onAddColaborador: (colab: Omit<Colaborador, 'id'>) => void;
  onToggleColaboradorStatus: (id: string) => void;
  onDeleteColaborador: (id: string) => void;
}

export default function ColaboradoresPanel({
  colaboradores,
  onAddColaborador,
  onToggleColaboradorStatus,
  onDeleteColaborador
}: ColaboradoresPanelProps) {
  const [showForm, setShowForm] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState<CargoColaborador>('Voluntário');
  
  // Permission toggles
  const [admin, setAdmin] = useState(false);
  const [atendimento, setAtendimento] = useState(true);
  const [financeiro, setFinanceiro] = useState(false);
  const [cadastro, setCadastro] = useState(true);

  // Form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert('Por favor, preencha o Nome e o E-mail.');
      return;
    }

    onAddColaborador({
      name,
      email,
      cargo,
      permissions: { admin, atendimento, financeiro, cadastro },
      active: true
    });

    // Reset fields
    setName('');
    setEmail('');
    setCargo('Voluntário');
    setAdmin(false);
    setAtendimento(true);
    setFinanceiro(false);
    setCadastro(true);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header action Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-white tracking-tight">Quadro de Trabalhadores (Tarefeiros)</h2>
          <p className="text-xs text-slate-400">Cadastre novos tarefeiros da casa espírita e estabeleça chaves granulares de permissão de acesso.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-[var(--color-chakra-6)] to-[var(--color-chakra-5)] text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
        >
          {showForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          <span>{showForm ? 'Fechar Cadastro' : 'Cadastrar Trabalhador'}</span>
        </button>
      </div>

      {/* Form Drawer */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 relative space-y-4">
          <div className="pb-2 border-b border-slate-850 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white font-display">Ficha de Admissão de Tarefeiro</h3>
            <span className="text-[10px] text-slate-400">Insira as permissões corretas segundo as diretrizes da diretoria</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Nome */}
            <div className="md:col-span-5">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nome Completo</label>
              <input
                id="col-name-input"
                type="text"
                required
                placeholder="Exemplo: Francisco Cândido Xavier"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Email */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">E-mail Institucional</label>
              <input
                id="col-email-input"
                type="email"
                required
                placeholder="chico@fraternidade.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Cargo Select */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cargo / Tarefa Principal</label>
              <select
                id="col-cargo-select"
                value={cargo}
                onChange={(e) => setCargo(e.target.value as CargoColaborador)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Tarefeiro">Tarefeiro Interno</option>
                <option value="Voluntário">Voluntário e Atendedor</option>
                <option value="Presidente">Presidente da Casa</option>
                <option value="Vice-Presidente">Vice-Presidente</option>
                <option value="Conselheiro">Conselheiro Administrativo</option>
              </select>
            </div>

            {/* Permissions Swite Selector (Switch) */}
            <div className="md:col-span-12">
              <h4 className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-3 font-display">Perfis e Níveis de Permissões de Acesso (Switches Seletores)</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-950/80 border border-slate-850 rounded-2xl p-4">
                {/* Switch 1: Admin */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-850/60 font-sans">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">Acesso Admin</span>
                    <span className="text-[9px] text-slate-400 block leading-tight">Configurações globais e diretoria</span>
                  </div>
                  {/* Customized HTML toggle switch */}
                  <button
                    id="switch-admin-perm"
                    type="button"
                    onClick={() => setAdmin(!admin)}
                    className={`w-11 h-6 rounded-full p-1 transition-all ${admin ? 'bg-[var(--color-chakra-6)]' : 'bg-slate-800'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${admin ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Switch 2: Atendimento */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-850/60 font-sans">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">Atendimento</span>
                    <span className="text-[9px] text-slate-400 block leading-tight">Escrever prontuários espirituais</span>
                  </div>
                  <button
                    id="switch-atend-perm"
                    type="button"
                    onClick={() => setAtendimento(!atendimento)}
                    className={`w-11 h-6 rounded-full p-1 transition-all ${atendimento ? 'bg-[var(--color-chakra-5)]' : 'bg-slate-800'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${atendimento ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Switch 3: Financeiro */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-850/60 font-sans">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">Painel Financeiro</span>
                    <span className="text-[9px] text-slate-400 block leading-tight">Lançar fluxos de caixa e compras</span>
                  </div>
                  <button
                    id="switch-finance-perm"
                    type="button"
                    onClick={() => setFinanceiro(!financeiro)}
                    className={`w-11 h-6 rounded-full p-1 transition-all ${financeiro ? 'bg-[var(--color-chakra-4)]' : 'bg-slate-800'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${financeiro ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Switch 4: Cadastro */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-850/60 font-sans">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">Cadastro Visitantes</span>
                    <span className="text-[9px] text-slate-400 block leading-tight">Admitir prontuários e fichas</span>
                  </div>
                  <button
                    id="switch-cadastro-perm"
                    type="button"
                    onClick={() => setCadastro(!cadastro)}
                    className={`w-11 h-6 rounded-full p-1 transition-all ${cadastro ? 'bg-[var(--color-chakra-2)]' : 'bg-slate-800'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${cadastro ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-850">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 px-4 py-2 rounded-xl text-xs"
            >
              Cancelar
            </button>
            <button
              id="col-submit-btn"
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-semibold hover:opacity-95 shadow"
            >
              Admitir Tarefeiro
            </button>
          </div>
        </form>
      )}

      {/* Workers grid list */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
        <h3 className="text-sm font-semibold text-white font-display mb-4">Membros Integrantes Cadastrados</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colaboradores.map((colab) => (
            <div key={colab.id} className={`p-5 rounded-2xl bg-slate-950/60 border hover:border-slate-750 transition-all ${colab.active ? 'border-slate-850' : 'border-red-950/40 opacity-70'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    {colab.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white max-w-[140px] truncate">{colab.name}</h4>
                    <span className="text-[10px] text-[var(--color-chakra-3)]">{colab.cargo}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {/* Status Indicator */}
                  <button
                    onClick={() => onToggleColaboradorStatus(colab.id)}
                    className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${colab.active ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-red-950 text-red-400 border border-red-900'} cursor-pointer`}
                    title="Mudar status do colaborador"
                  >
                    {colab.active ? 'Ativo' : 'Inativo'}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 font-sans flex items-center gap-1 mb-3">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{colab.email}</span>
              </div>

              <div className="h-0.5 bg-slate-900 w-full mb-3" />

              {/* Collapsed view of access rights */}
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 block mb-1.5 font-bold">Chaves de Acesso Ativas:</span>
                <div className="flex flex-wrap gap-1">
                  {colab.permissions.admin && (
                    <span className="text-[9px] bg-red-950 text-red-400 px-2 py-0.5 rounded border border-red-900 font-semibold">Admin</span>
                  )}
                  {colab.permissions.atendimento && (
                    <span className="text-[9px] bg-purple-950 text-purple-400 px-2 py-0.5 rounded border border-purple-900 font-semibold">Preces/Passe</span>
                  )}
                  {colab.permissions.financeiro && (
                    <span className="text-[9px] bg-green-950 text-green-400 px-2 py-0.5 rounded border border-green-900 font-semibold">Financeiro</span>
                  )}
                  {colab.permissions.cadastro && (
                    <span className="text-[9px] bg-blue-950 text-blue-400 px-2 py-0.5 rounded border border-blue-900 font-semibold">Cadastros</span>
                  )}
                  {!colab.permissions.admin && !colab.permissions.atendimento && !colab.permissions.financeiro && !colab.permissions.cadastro && (
                    <span className="text-[9.5px] text-slate-500">Sem acessos habilitados</span>
                  )}
                </div>
              </div>

              {/* Action delete */}
              <div className="flex justify-end pt-3 mt-1.5 border-t border-slate-900">
                <button
                  onClick={() => onDeleteColaborador(colab.id)}
                  className="text-[10px] text-slate-500 hover:text-red-400 cursor-pointer"
                  title="Expulsar ou desligar tarefeiro definitivo"
                >
                  Expulsar Membro
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
