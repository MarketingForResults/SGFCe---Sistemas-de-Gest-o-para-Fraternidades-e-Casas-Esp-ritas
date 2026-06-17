import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Coins, 
  ShoppingCart, 
  Gift, 
  Briefcase, 
  UserCircle, 
  Activity, 
  LogOut, 
  Heart, 
  Sparkles,
  ClipboardList,
  MessageSquare,
  Calendar,
  BarChart3,
  Sliders
} from 'lucide-react';
import { motion } from 'motion/react';

// Data types
import { 
  Colaborador, 
  Visitante, 
  AtendimentoFraterno, 
  TransacaoFinanceira, 
  CompraItem, 
  DoacaoRegistro, 
  CampanhaArrecadacao,
  MensagemDireta,
  ForumTopic,
  ForumReply,
  ComunicadoGeral,
  EventoAgenda,
  RelatorioSalvo,
  SenhaAtendimento
} from './types';

// Persistent storage operations
import { loadAllData, saveAllData } from './utils/storage';

// Screens
import Login from './components/Login';
import RemindersNotificationCenter from './components/RemindersNotificationCenter';
import NotificationSettingsPanel from './components/NotificationSettingsPanel';
import DashboardOverview from './components/DashboardOverview';
import FinancePanel from './components/FinancePanel';
import PurchasesPanel from './components/PurchasesPanel';
import DonationsPanel from './components/DonationsPanel';
import ColaboradoresPanel from './components/ColaboradoresPanel';
import VisitantesPanel from './components/VisitantesPanel';
import AtendimentoPanel from './components/AtendimentoPanel';
import CommunicationsPanel from './components/CommunicationsPanel';
import EventsPanel from './components/EventsPanel';
import ReportsPanel from './components/ReportsPanel';
import TVQueueDisplay from './components/TVQueueDisplay';

export default function App() {
  // Render standalone TV display if URL is appended with ?tv=true
  if (typeof window !== 'undefined' && window.location.search.includes('tv=true')) {
    return <TVQueueDisplay />;
  }

  const [user, setUser] = useState<{ name: string; email: string; role: string; isAdmin: boolean } | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('sgfce_current_user');
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch (e) {}
      }
    }
    return null;
  });
  const [activeTab, setActiveTab] = useState<'painel' | 'financeiro' | 'compras' | 'recursos' | 'trabalhadores' | 'visitantes' | 'atendimento' | 'comunicacoes' | 'agenda' | 'relatorios' | 'notificacoes'>('painel');
  const [selectedVisitanteIdForAtendimento, setSelectedVisitanteIdForAtendimento] = useState<string | undefined>(undefined);

  // Core Persistent State loaded synchronously for robust instant validation
  const [colaboradores, setColaboradores] = useState<Colaborador[]>(() => {
    try {
      return loadAllData().colaboradores;
    } catch (e) {
      return [];
    }
  });
  const [visitantes, setVisitantes] = useState<Visitante[]>(() => {
    try {
      return loadAllData().visitantes;
    } catch (e) {
      return [];
    }
  });
  const [atendimentos, setAtendimentos] = useState<AtendimentoFraterno[]>(() => {
    try {
      return loadAllData().atendimentos;
    } catch (e) {
      return [];
    }
  });
  const [financeiro, setFinanceiro] = useState<TransacaoFinanceira[]>(() => {
    try {
      return loadAllData().financeiro;
    } catch (e) {
      return [];
    }
  });
  const [compras, setCompras] = useState<CompraItem[]>(() => {
    try {
      return loadAllData().compras;
    } catch (e) {
      return [];
    }
  });
  const [doacoes, setDoacoes] = useState<DoacaoRegistro[]>(() => {
    try {
      return loadAllData().doacoes;
    } catch (e) {
      return [];
    }
  });
  const [campanhas, setCampanhas] = useState<CampanhaArrecadacao[]>(() => {
    try {
      return loadAllData().campanhas;
    } catch (e) {
      return [];
    }
  });
  
  // New States
  const [mensagens, setMensagens] = useState<MensagemDireta[]>(() => {
    try {
      return loadAllData().mensagens;
    } catch (e) {
      return [];
    }
  });
  const [topicos, setTopicos] = useState<ForumTopic[]>(() => {
    try {
      return loadAllData().topicos;
    } catch (e) {
      return [];
    }
  });
  const [respostas, setRespostas] = useState<ForumReply[]>(() => {
    try {
      return loadAllData().respostas;
    } catch (e) {
      return [];
    }
  });
  const [comunicados, setComunicados] = useState<ComunicadoGeral[]>(() => {
    try {
      return loadAllData().comunicados;
    } catch (e) {
      return [];
    }
  });
  const [eventos, setEventos] = useState<EventoAgenda[]>(() => {
    try {
      return loadAllData().eventos;
    } catch (e) {
      return [];
    }
  });
  const [relatorios, setRelatorios] = useState<RelatorioSalvo[]>(() => {
    try {
      return loadAllData().relatorios;
    } catch (e) {
      return [];
    }
  });
  const [senhas, setSenhas] = useState<SenhaAtendimento[]>([]);

  // Load and subscribe to queue state changes from localStorage + Server API for Header alerts
  useEffect(() => {
    let active = true;

    const loadQueue = async () => {
      try {
        const res = await fetch('/api/senhas');
        if (res.ok) {
          const body = await res.json();
          if (active && body.senhas) {
            setSenhas(body.senhas);
            localStorage.setItem('sgfce_senhas', JSON.stringify(body.senhas));
          }
        }
      } catch (err) {
        // Fallback to localStorage
        const saved = localStorage.getItem('sgfce_senhas');
        if (saved && active) {
          try {
            setSenhas(JSON.parse(saved));
          } catch (e) {
            console.error(e);
          }
        }
      }
    };

    loadQueue();
    // Short-poll every 6 seconds to keep header notifications perfectly updated across machines
    const interval = setInterval(loadQueue, 6000);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'sgfce_senhas' && active) {
        const saved = localStorage.getItem('sgfce_senhas');
        if (saved) {
          try {
            setSenhas(JSON.parse(saved));
          } catch (e) {
            console.error(e);
          }
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Load state on startup checks
  useEffect(() => {
    // Dynamic recovery of previous logged-in session if any (already handled by state initializer but kept as fallback)
    const savedUser = localStorage.getItem('sgfce_current_user');
    if (savedUser && !user) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        // Safe skip
      }
    }
  }, [user]);

  // Save state on any change
  useEffect(() => {
    if (colaboradores.length > 0 || visitantes.length > 0) {
      saveAllData({
        colaboradores,
        visitantes,
        atendimentos,
        financeiro,
        compras,
        doacoes,
        campanhas,
        mensagens,
        topicos,
        respostas,
        comunicados,
        eventos,
        relatorios
      });
    }
  }, [
    colaboradores, 
    visitantes, 
    atendimentos, 
    financeiro, 
    compras, 
    doacoes, 
    campanhas,
    mensagens,
    topicos,
    respostas,
    comunicados,
    eventos,
    relatorios
  ]);

  const handleLogin = (loggedUser: { name: string; email: string; role: string; isAdmin: boolean }) => {
    setUser(loggedUser);
    localStorage.setItem('sgfce_current_user', JSON.stringify(loggedUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('sgfce_current_user');
  };

  // State manipulation closures
  const addTransacao = (newTrans: Omit<TransacaoFinanceira, 'id'>) => {
    const item: TransacaoFinanceira = {
      ...newTrans,
      id: `fin-${Date.now()}`
    };
    const updated = [item, ...financeiro];
    setFinanceiro(updated);
  };

  const deleteTransacao = (id: string) => {
    setFinanceiro(financeiro.filter(t => t.id !== id));
  };

  const addCompra = (newCompra: Omit<CompraItem, 'id'>) => {
    const item: CompraItem = {
      ...newCompra,
      id: `compra-${Date.now()}`
    };
    setCompras([item, ...compras]);
  };

  const updateCompraStatus = (id: string, newStatus: CompraItem['status']) => {
    setCompras(compras.map(c => {
      if (c.id === id) {
        // If purchased successfully, also post a dynamic finance debit entry
        if (newStatus === 'Comprado' && c.status !== 'Comprado') {
          addTransacao({
            tipo: 'Despesa',
            categoria: 'Compra de Insumos Beneficentes',
            valor: c.valorEstimado * c.quantidade,
            descricao: `Adquirido: ${c.item} (Solicitado por ${c.solicitante})`,
            data: new Date().toISOString().substring(0, 10)
          });
        }
        return { ...c, status: newStatus };
      }
      return c;
    }));
  };

  const deleteCompra = (id: string) => {
    setCompras(compras.filter(c => c.id !== id));
  };

  const addDoacao = (newDoar: Omit<DoacaoRegistro, 'id'>) => {
    const item: DoacaoRegistro = {
      ...newDoar,
      id: `doar-${Date.now()}`
    };
    setDoacoes([item, ...doacoes]);
  };

  const deleteDoacao = (id: string) => {
    setDoacoes(doacoes.filter(d => d.id !== id));
  };

  const addCampanha = (newCamp: Omit<CampanhaArrecadacao, 'id'>) => {
    const item: CampanhaArrecadacao = {
      ...newCamp,
      id: `camp-${Date.now()}`
    };
    setCampanhas([item, ...campanhas]);
  };

  const updateCampanhaFunds = (id: string, amount: number) => {
    setCampanhas(campanhas.map(c => {
      if (c.id === id) {
        const total = c.arrecadado + amount;
        // Also register an income transacao in financial book
        addTransacao({
          tipo: 'Receita',
          categoria: 'Arrecadação Campanhas',
          valor: amount,
          descricao: `Contribuição caridosa para campanha: ${c.titulo}`,
          data: new Date().toISOString().substring(0, 10)
        });
        return { ...c, arrecadado: total };
      }
      return c;
    }));
  };

  const addColaborador = (newColab: Omit<Colaborador, 'id'>) => {
    const item: Colaborador = {
      ...newColab,
      id: `colab-${Date.now()}`
    };
    setColaboradores([...colaboradores, item]);
  };

  const toggleColaboradorStatus = (id: string) => {
    setColaboradores(colaboradores.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const deleteColaborador = (id: string) => {
    setColaboradores(colaboradores.filter(c => c.id !== id));
  };

  const addVisitante = (newVis: Omit<Visitante, 'id'>) => {
    const item: Visitante = {
      ...newVis,
      id: `visit-${Date.now()}`
    };
    setVisitantes([item, ...visitantes]);
  };

  const updateVisitante = (updatedVis: Visitante) => {
    setVisitantes(visitantes.map(v => v.id === updatedVis.id ? updatedVis : v));
  };

  const deleteVisitante = (id: string) => {
    setVisitantes(visitantes.filter(v => v.id !== id));
  };

  const addAtendimento = (newAtend: Omit<AtendimentoFraterno, 'id'>) => {
    const item: AtendimentoFraterno = {
      ...newAtend,
      id: `atend-${Date.now()}`
    };
    setAtendimentos([item, ...atendimentos]);
    setSelectedVisitanteIdForAtendimento(undefined); // Reset direct pointer
  };

  const updateAtendimentoStatus = (id: string, status: AtendimentoFraterno['status']) => {
    setAtendimentos(atendimentos.map(a => a.id === id ? { ...a, status } : a));
  };

  const selectVisitanteForAtendimentoTab = (id: string, nombre: string) => {
    setSelectedVisitanteIdForAtendimento(id);
    setActiveTab('atendimento');
  };

  // === NEW MUTATORS ===
  const addMensagem = (msg: Omit<MensagemDireta, 'id' | 'timestamp' | 'senderId' | 'senderName'>) => {
    if (!user) return;
    const item: MensagemDireta = {
      ...msg,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      senderId: user.email,
      senderName: user.name
    };
    setMensagens(prev => [...prev, item]);
  };

  const addTopico = (topico: Omit<ForumTopic, 'id' | 'createdAt' | 'authorName' | 'authorEmail'>) => {
    if (!user) return;
    const item: ForumTopic = {
      ...topico,
      id: `topico-${Date.now()}`,
      createdAt: new Date().toISOString(),
      authorName: user.name,
      authorEmail: user.email
    };
    setTopicos(prev => [item, ...prev]);
  };

  const addResposta = (reply: Omit<ForumReply, 'id' | 'createdAt' | 'authorName' | 'authorEmail'>) => {
    if (!user) return;
    const item: ForumReply = {
      ...reply,
      id: `rep-${Date.now()}`,
      createdAt: new Date().toISOString(),
      authorName: user.name,
      authorEmail: user.email
    };
    setRespostas(prev => [...prev, item]);
  };

  const addComunicado = (com: Omit<ComunicadoGeral, 'id' | 'createdAt' | 'authorName'>) => {
    if (!user) return;
    const item: ComunicadoGeral = {
      ...com,
      id: `com-${Date.now()}`,
      createdAt: new Date().toISOString(),
      authorName: user.name
    };
    setComunicados(prev => [item, ...prev]);
  };

  const deleteComunicado = (id: string) => {
    setComunicados(prev => prev.filter(c => c.id !== id));
  };

  const addEvento = (ev: Omit<EventoAgenda, 'id' | 'createdByName' | 'createdByEmail'>) => {
    if (!user) return;
    const item: EventoAgenda = {
      ...ev,
      id: `ev-${Date.now()}`,
      createdByName: user.name,
      createdByEmail: user.email
    };
    setEventos(prev => [item, ...prev]);
  };

  const deleteEvento = (id: string) => {
    setEventos(prev => prev.filter(e => e.id !== id));
  };

  const addRelatorio = (rel: Omit<RelatorioSalvo, 'id' | 'createdAt' | 'createdByName'>) => {
    if (!user) return;
    const item: RelatorioSalvo = {
      ...rel,
      id: `rep-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdByName: user.name
    };
    setRelatorios(prev => [item, ...prev]);
  };

  const deleteRelatorio = (id: string) => {
    setRelatorios(prev => prev.filter(r => r.id !== id));
  };

  if (!user) {
    return (
      <Login 
        colaboradores={colaboradores} 
        onLoginSuccess={handleLogin} 
        onAddColaborador={addColaborador} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col md:flex-row">
      
      {/* Decorative spectrum bar for desktop on the outer left or outer top margin */}
      <div className="w-full md:w-1.5 h-1.5 md:h-screen bg-gradient-to-b chakra-gradient absolute md:top-0 left-0 z-50 pointer-events-none" />

      {/* Primary Navigation Sidebar */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 shadow-xl flex flex-col justify-between p-4 flex-shrink-0 relative z-30">
        
        {/* Core title banner */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2 py-3.5 border-b border-slate-100 bg-white">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-fuchsia-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 id="sidebar-logo-text" className="text-lg font-display font-bold tracking-tight text-slate-800 flex items-center gap-1">
                <span>SGFCe</span>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 py-0.2 px-1 rounded-full">v1.2</span>
              </h1>
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold font-display">Fraternidade</p>
            </div>
          </div>

          {/* Navigation Menus Mapped to Chakra Themes */}
          <nav className="space-y-1.5">
            <button
              id="sidebar-tab-painel"
              onClick={() => setActiveTab('painel')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold font-display tracking-wide transition-all uppercase cursor-pointer ${activeTab === 'painel' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}
            >
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              <span>Dashboard Geral</span>
            </button>

            <button
              id="sidebar-tab-visitantes"
              onClick={() => setActiveTab('visitantes')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold font-display tracking-wide transition-all uppercase cursor-pointer ${activeTab === 'visitantes' ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'}`}
            >
              <UserCircle className="w-4 h-4 flex-shrink-0" />
              <span>Fichas Visitantes</span>
            </button>

            <button
              id="sidebar-tab-atendimento"
              onClick={() => setActiveTab('atendimento')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold font-display tracking-wide transition-all uppercase cursor-pointer ${activeTab === 'atendimento' ? 'bg-green-50 text-green-700 border-l-4 border-green-600 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-green-600'}`}
            >
              <Activity className="w-4 h-4 flex-shrink-0" />
              <span>Atendimento Fraterno</span>
            </button>

            <button
              id="sidebar-tab-financeiro"
              onClick={() => setActiveTab('financeiro')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold font-display tracking-wide transition-all uppercase cursor-pointer ${activeTab === 'financeiro' ? 'bg-red-50 text-red-700 border-l-4 border-red-600 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-red-600'}`}
            >
              <Coins className="w-4 h-4 flex-shrink-0" />
              <span>Financeiro (Livro)</span>
            </button>

            <button
              id="sidebar-tab-recursos"
              onClick={() => setActiveTab('recursos')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold font-display tracking-wide transition-all uppercase cursor-pointer ${activeTab === 'recursos' ? 'bg-orange-50 text-orange-700 border-l-4 border-orange-600 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-orange-600'}`}
            >
              <Gift className="w-4 h-4 flex-shrink-0" />
              <span>Estoque & Doações</span>
            </button>

            <button
              id="sidebar-tab-compras"
              onClick={() => setActiveTab('compras')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold font-display tracking-wide transition-all uppercase cursor-pointer ${activeTab === 'compras' ? 'bg-amber-50 text-amber-705 border-l-4 border-amber-500 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-amber-600'}`}
            >
              <ShoppingCart className="w-4 h-4 flex-shrink-0" />
              <span>Compras & Insumos</span>
            </button>

            <button
              id="sidebar-tab-trabalhadores"
              onClick={() => setActiveTab('trabalhadores')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold font-display tracking-wide transition-all uppercase cursor-pointer ${activeTab === 'trabalhadores' ? 'bg-fuchsia-50 text-fuchsia-700 border-l-4 border-fuchsia-600 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-fuchsia-650'}`}
            >
              <Briefcase className="w-4 h-4 flex-shrink-0" />
              <span>Trabalhadores</span>
            </button>

            <div className="h-px bg-slate-100 my-2" />

            <button
              id="sidebar-tab-comunicacoes"
              onClick={() => setActiveTab('comunicacoes')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold font-display tracking-wide transition-all uppercase cursor-pointer ${activeTab === 'comunicacoes' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span>Comunicações</span>
            </button>

            <button
              id="sidebar-tab-agenda"
              onClick={() => setActiveTab('agenda')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold font-display tracking-wide transition-all uppercase cursor-pointer ${activeTab === 'agenda' ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-600 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-purple-600'}`}
            >
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>Agenda & Eventos</span>
            </button>

            <button
              id="sidebar-tab-relatorios"
              onClick={() => setActiveTab('relatorios')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold font-display tracking-wide transition-all uppercase cursor-pointer ${activeTab === 'relatorios' ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-600 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-teal-600'}`}
            >
              <BarChart3 className="w-4 h-4 flex-shrink-0" />
              <span>Relatórios</span>
            </button>

            <button
              id="sidebar-tab-notificacoes"
              onClick={() => setActiveTab('notificacoes')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold font-display tracking-wide transition-all uppercase cursor-pointer ${activeTab === 'notificacoes' ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}
            >
              <Sliders className="w-4 h-4 flex-shrink-0" />
              <span>Configurar Alertas</span>
            </button>
          </nav>
        </div>

        {/* User context footer card */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 mt-6 md:mt-0">
          <div className="flex items-center gap-2.5 mb-2 truncate">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-fuchsia-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-bold text-slate-800 truncate max-w-[120px]">{user.name}</h4>
              <span className="text-[9.5px] text-indigo-755 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-150 block truncate font-medium">{user.role}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full text-center py-1.5 bg-white hover:bg-red-50 hover:text-red-600 rounded-lg text-[10px] text-slate-500 transition-all font-semibold flex items-center justify-center gap-1 border border-slate-200 hover:border-red-200 cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            <span>Sair do Sistema</span>
          </button>
        </div>

      </aside>

      {/* Main viewport Container */}
      <main className="flex-1 min-w-0 overflow-y-auto relative h-screen p-4 md:p-6 pb-20 md:pb-6 bg-slate-50">
        
        {/* Dynamic header stats bar ribbon */}
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center bg-white border border-slate-200 p-3.5 px-[16px] md:px-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2.5 font-display text-xs">
              <span className="text-green-600 font-bold whitespace-nowrap">● ONLINE</span>
              <span className="text-slate-300 font-mono hidden sm:inline">|</span>
              <span className="text-slate-600 font-semibold uppercase tracking-wider text-[10px] hidden sm:inline">Portal de Gestão Unificado SGFCe</span>
            </div>
            <div className="flex items-center gap-4">
              <RemindersNotificationCenter 
                currentUser={user}
                eventos={eventos}
                atendimentos={atendimentos}
                senhas={senhas}
              />
              <span className="text-slate-200 font-mono">|</span>
              <div className="text-[10px] text-slate-500 font-mono font-bold whitespace-nowrap">
                Frente Social • {new Date().toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>

          {/* Core Content Switching Routing panels */}
          {activeTab === 'painel' && (
            <DashboardOverview 
              colaboradores={colaboradores}
              visitantes={visitantes}
              atendimentos={atendimentos}
              financeiro={financeiro}
              doacoes={doacoes}
              campanhas={campanhas}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'financeiro' && (
            <FinancePanel 
              financeiro={financeiro}
              onAddTransacao={addTransacao}
              onDeleteTransacao={deleteTransacao}
            />
          )}

          {activeTab === 'compras' && (
            <PurchasesPanel 
              compras={compras}
              currentUser={user}
              onAddCompra={addCompra}
              onUpdateStatus={updateCompraStatus}
              onDeleteCompra={deleteCompra}
            />
          )}

          {activeTab === 'recursos' && (
            <DonationsPanel 
              doacoes={doacoes}
              campanhas={campanhas}
              onAddDoacao={addDoacao}
              onAddCampanha={addCampanha}
              onDeleteDoacao={deleteDoacao}
              onUpdateCampanhaFunds={updateCampanhaFunds}
            />
          )}

          {activeTab === 'trabalhadores' && (
            <ColaboradoresPanel 
              colaboradores={colaboradores}
              onAddColaborador={addColaborador}
              onToggleColaboradorStatus={toggleColaboradorStatus}
              onDeleteColaborador={deleteColaborador}
            />
          )}

          {activeTab === 'visitantes' && (
            <VisitantesPanel 
              visitantes={visitantes}
              onAddVisitante={addVisitante}
              onUpdateVisitante={updateVisitante}
              onDeleteVisitante={deleteVisitante}
              onSelectVisitanteForAtendimento={selectVisitanteForAtendimentoTab}
            />
          )}

          {activeTab === 'atendimento' && (
            <AtendimentoPanel 
              atendimentos={atendimentos}
              visitantes={visitantes}
              selectedVisitanteIdFromProps={selectedVisitanteIdForAtendimento}
              currentUser={user}
              onAddAtendimento={addAtendimento}
              onUpdateAtendimentoStatus={updateAtendimentoStatus}
            />
          )}

          {activeTab === 'comunicacoes' && (
            <CommunicationsPanel
              currentUser={user}
              colaboradores={colaboradores}
              comunicados={comunicados}
              topicos={topicos}
              respostas={respostas}
              mensagens={mensagens}
              onAddComunicado={addComunicado}
              onDeleteComunicado={deleteComunicado}
              onAddTopico={addTopico}
              onAddResposta={addResposta}
              onAddMensagem={addMensagem}
            />
          )}

          {activeTab === 'agenda' && (
            <EventsPanel
              currentUser={user}
              eventos={eventos}
              onAddEvento={addEvento}
              onDeleteEvento={deleteEvento}
            />
          )}

          {activeTab === 'relatorios' && (
            <ReportsPanel
              currentUser={user}
              financeiro={financeiro}
              atendimentos={atendimentos}
              doacoes={doacoes}
              colaboradores={colaboradores}
              relatorios={relatorios}
              onAddRelatorio={addRelatorio}
              onDeleteRelatorio={deleteRelatorio}
            />
          )}

          {activeTab === 'notificacoes' && (
            <NotificationSettingsPanel
              currentUser={user}
              eventos={eventos}
              atendimentos={atendimentos}
              senhas={senhas}
            />
          )}
        </div>
      </main>
    </div>
  );
}
