import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Sparkles, 
  Award, 
  HelpCircle, 
  Plus, 
  Clipboard, 
  ShieldAlert, 
  User, 
  CheckCircle,
  FileText,
  Sliders,
  Send,
  Heart,
  Tv,
  Users,
  Trash2,
  Volume2,
  Play,
  ArrowUpRight,
  Clock,
  Ticket,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  TrendingUp,
  Share2,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { AtendimentoFraterno, Visitante, DiagnosticoChakras, RecomendacoesAtendimento, SenhaAtendimento } from '../types';

interface AtendimentoPanelProps {
  atendimentos: AtendimentoFraterno[];
  visitantes: Visitante[];
  selectedVisitanteIdFromProps?: string; // Direct navigation
  currentUser: { name: string; email: string; role: string; isAdmin: boolean };
  onAddAtendimento: (registro: Omit<AtendimentoFraterno, 'id'>) => void;
  onUpdateAtendimentoStatus: (id: string, status: AtendimentoFraterno['status']) => void;
}

const CHAKRA_METADATA = [
  { key: 'coronario', label: '1. Coronário (Coroa)', color: 'var(--color-chakra-7)', symbol: '✨', element: 'Mental / Conexão', desc: 'Sintonia espiritual e paz' },
  { key: 'frontal', label: '2. Frontal (3º Olho)', color: 'var(--color-chakra-6)', symbol: '👁️', element: 'Pensamentos', desc: 'Ansiedade mental e preocupações' },
  { key: 'laringeo', label: '3. Laríngeo (Garganta)', color: 'var(--color-chakra-5)', symbol: '🗣️', element: 'Expressão', desc: 'Palavras proferidas e desabafos' },
  { key: 'cardiaco', label: '4. Cardíaco (Coração)', color: 'var(--color-chakra-4)', symbol: '💚', element: 'Afeição', desc: 'Perdão, luto e angústias' },
  { key: 'umbilical', label: '5. Umbilical / Plexo Solar', color: 'var(--color-chakra-3)', symbol: '☀️', element: 'Emoção', desc: 'Instabilidade emocional e pânico' },
  { key: 'esplenico', label: '6. Esplênico (Baço)', color: 'var(--color-chakra-2)', symbol: '🌊', element: 'Vitalidade', desc: 'Cansaço físico e apatia de fluidos' },
  { key: 'basico', label: '7. Básico (Raiz)', color: 'var(--color-chakra-1)', symbol: '✊', element: 'Físico', desc: 'Segurança interna e medos de sobrevivência' }
];

export default function AtendimentoPanel({
  atendimentos,
  visitantes,
  selectedVisitanteIdFromProps,
  currentUser,
  onAddAtendimento,
  onUpdateAtendimentoStatus
}: AtendimentoPanelProps) {
  
  // Navigation Tabs: 'pronturario' (Chakra form) or 'senhas' (Virtual Queue Manager)
  const [subTab, setSubTab] = useState<'prontuario' | 'senhas'>('prontuario');

  // Form States
  const [showForm, setShowForm] = useState(false);
  const [visitanteId, setVisitanteId] = useState('');
  const [atendedorNome, setAtendedorNome] = useState(currentUser.name || 'Maria Helena Souza');
  const [queixasFraternas, setQueixasFraternas] = useState('');
  
  // Chakras status values (1 to 10)
  const [coronario, setCoronario] = useState(7);
  const [frontal, setFrontal] = useState(7);
  const [laringeo, setLaringeo] = useState(7);
  const [cardiaco, setCardiaco] = useState(7);
  const [umbilical, setUmbilical] = useState(7);
  const [esplenico, setEsplenico] = useState(7);
  const [basico, setBasico] = useState(7);

  // Recommendations checkboxes
  const [passe, setPasse] = useState(true);
  const [aguaFluidificada, setAguaFluidificada] = useState(true);
  const [evangelhoLar, setEvangelhoLar] = useState(true);
  const [palestrasPublicas, setPalestrasPublicas] = useState(true);
  const [desobsessao, setDesobsessao] = useState(false);
  const [observacoesFinais, setObservacoesFinais] = useState('');

  // Queue System State
  const [senhas, setSenhas] = useState<SenhaAtendimento[]>([]);
  const [ticketColor, setTicketColor] = useState<'Amarela' | 'Azul'>('Amarela');
  const [selectedVisitanteIdForTicket, setSelectedVisitanteIdForTicket] = useState<string>('');
  const [manualTicketName, setManualTicketName] = useState<string>('');
  const [showSharePanel, setShowSharePanel] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [selectedRoomForCall, setSelectedRoomForCall] = useState<{ [ticketId: string]: string }>({});
  const [secondsTicker, setSecondsTicker] = useState(0);

  // Load and sync Queue from localStorage + Server API
  useEffect(() => {
    let active = true;

    const loadState = async () => {
      let isSyncedWithServer = false;
      
      try {
        const res = await fetch('/api/senhas');
        if (res.ok) {
          const body = await res.json();
          if (active && body.senhas && body.senhas.length > 0) {
            setSenhas(body.senhas);
            localStorage.setItem('sgfce_senhas', JSON.stringify(body.senhas));
            isSyncedWithServer = true;
          }
        }
      } catch (err) {
        console.warn('Could not sync on startup with background server:', err);
      }

      if (!isSyncedWithServer && active) {
        const saved = localStorage.getItem('sgfce_senhas');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setSenhas(parsed);
            
            // Push local tickets to server to initialize it
            fetch('/api/senhas', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(parsed)
            }).catch(e => console.warn('Could not push initial local state:', e));
          } catch (e) {
            console.error(e);
          }
        } else {
          // High quality mock tickets out of the box
          const initialSenhas: SenhaAtendimento[] = [
            {
              id: 'ticket-1',
              numero: 'AM-042',
              tipo: 'Amarela',
              visitanteNome: 'Pedro de Alcântara Oliveira',
              visitanteId: 'visit-1',
              status: 'Concluido',
              consultorio: 'Acolhimento Fraterno 1',
              data: new Date().toISOString().substring(0, 10),
              horaGerada: '07:22',
              timestampGerada: Date.now() - 3600000,
              timestampChamada: Date.now() - 3000000,
              timestampFinalizada: Date.now() - 1800000,
              tempoAtendimentoSegundos: 1200
            },
            {
              id: 'ticket-2',
              numero: 'AZ-043',
              tipo: 'Azul',
              visitanteNome: 'Joana dArc Silva',
              visitanteId: 'visit-2',
              status: 'Em Atendimento',
              consultorio: 'Sala de Passes B',
              data: new Date().toISOString().substring(0, 10),
              horaGerada: '07:42',
              timestampGerada: Date.now() - 1800000,
              timestampChamada: Date.now() - 1200000,
            },
            {
              id: 'ticket-3',
              numero: 'AM-044',
              tipo: 'Amarela',
              visitanteNome: 'Ronaldo de Souza Cruz',
              status: 'Aguardando',
              consultorio: '',
              data: new Date().toISOString().substring(0, 10),
              horaGerada: '07:50',
              timestampGerada: Date.now() - 600000
            }
          ];
          setSenhas(initialSenhas);
          localStorage.setItem('sgfce_senhas', JSON.stringify(initialSenhas));
          
          fetch('/api/senhas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(initialSenhas)
          }).catch(e => console.warn('Could not push initial mock state:', e));
        }
      }
    };

    loadState();

    // Sync across worker tabs on same machine
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sgfce_senhas') {
        const saved = localStorage.getItem('sgfce_senhas');
        if (saved && active) {
          try {
            setSenhas(JSON.parse(saved));
          } catch (err) {
            console.error(err);
          }
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Active polling interval from server to allow multi-device sync
    const syncInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/senhas');
        if (res.ok) {
          const body = await res.json();
          if (active && body.senhas && body.senhas.length > 0) {
            const currentStr = localStorage.getItem('sgfce_senhas') || '';
            const newStr = JSON.stringify(body.senhas);
            if (currentStr !== newStr) {
              setSenhas(body.senhas);
              localStorage.setItem('sgfce_senhas', newStr);
            }
          }
        }
      } catch (err) {
        // Silent fallback when server is building / restarting
      }
    }, 1500);

    return () => {
      active = false;
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(syncInterval);
    };
  }, []);

  // Timer loop for tracking stopwatch counters
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsTicker(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle direct navigation from visitor panel
  useEffect(() => {
    if (selectedVisitanteIdFromProps) {
      setVisitanteId(selectedVisitanteIdFromProps);
      setSubTab('prontuario');
      setShowForm(true);
    }
  }, [selectedVisitanteIdFromProps]);

  // Submit assessment form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitanteId) {
      alert('Selecione o Assistido que passará pelo Atendimento Fraterno.');
      return;
    }

    const selectedVisitante = visitantes.find(v => v.id === visitanteId);
    if (!selectedVisitante) return;

    const diagnosticoChakras: DiagnosticoChakras = {
      coronario,
      frontal,
      laringeo,
      cardiaco,
      umbilical,
      esplenico,
      basico
    };

    const recomendacoes: RecomendacoesAtendimento = {
      passe,
      aguaFluidificada,
      evangelhoLar,
      palestrasPublicas,
      desobsessao
    };

    onAddAtendimento({
      visitanteId,
      visitanteNome: selectedVisitante.nomeCompleto,
      dataAtendimento: new Date().toISOString().substring(0, 10),
      atendedorNome,
      queixasFraternas,
      diagnosticoChakras,
      recomendacoes,
      observacoesFinais,
      status: 'Concluído'
    });

    // Reset controls
    setQueixasFraternas('');
    setObservacoesFinais('');
    setDesobsessao(false);
    setShowForm(false);
  };

  const getInsights = () => {
    const list: string[] = [];
    if (frontal < 5) list.push('Chakra Frontal baixo indica perturbação mental ou insônia severa. Recomendado prece ativa e leitura de Evangelho antes de deitar.');
    if (cardiaco < 5) list.push('Chakra Cardíaco debilitado revela mágoas prolongadas ou luto. Passe de rearmonização (passe misto) ajudará nas energias cardíacas.');
    if (umbilical < 5) list.push('Chakra Umbilical desalinhado indica irritabilidade constante ou fobia de pânico. Fluidoterapia (bebida de águas fluidificadas) trará paz ao plexo.');
    if (esplenico < 5) list.push('Chakra Esplênico desgastado expressa fadiga fluídica crônica. Recomendado passe e repouso de atividades mundanas fúteis.');
    
    if (list.length === 0) {
      list.push('Alinhamento energético estável. Indique conservação de pensamentos positivos e caridade voluntária de manutenção.');
    }
    return list;
  };

  // Helper to persist senhas list to state, localStorage, and Server API
  const saveSenhas = (newSenhas: SenhaAtendimento[]) => {
    setSenhas(newSenhas);
    localStorage.setItem('sgfce_senhas', JSON.stringify(newSenhas));
    // Push immediately to backend sync server
    fetch('/api/senhas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSenhas)
    }).catch(e => console.warn('Could not push update to server:', e));
  };

  // Generate a virtual queue ticket
  const handleGenerateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    
    let visitorName = '';
    let visitorId = undefined;

    if (selectedVisitanteIdForTicket) {
      const vis = visitantes.find(v => v.id === selectedVisitanteIdForTicket);
      if (vis) {
        visitorName = vis.nomeCompleto;
        visitorId = vis.id;
      }
    } else if (manualTicketName.trim()) {
      visitorName = manualTicketName.trim();
    } else {
      alert('Por favor, selecione um visitante cadastrado ou preencha a Entrada Rápida de visitante.');
      return;
    }

    // Determine sequence number
    const colorTickets = senhas.filter(s => s.tipo === ticketColor);
    const sequence = colorTickets.length + 1;
    const numeroPrefix = ticketColor === 'Amarela' ? 'AM' : 'AZ';
    const numero = `${numeroPrefix}-${String(sequence).padStart(3, '0')}`;

    const now = new Date();
    const newTicket: SenhaAtendimento = {
      id: `ticket-${Date.now()}`,
      numero,
      tipo: ticketColor,
      visitanteId,
      visitanteNome: visitorName,
      status: 'Aguardando',
      consultorio: '',
      data: now.toISOString().substring(0, 10),
      horaGerada: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      timestampGerada: Date.now()
    };

    saveSenhas([...senhas, newTicket]);

    // Cleanup form inputs
    setSelectedVisitanteIdForTicket('');
    setManualTicketName('');
  };

  // Trigger calling event for TV
  const handleCallTicket = (ticketId: string) => {
    const targetRoom = selectedRoomForCall[ticketId] || 'Consultório 1';
    
    // First, change any existing "Chamando" ticket back to "Em Atendimento" or similar
    // to prevent two tickets blinking at the exact same time
    const updated = senhas.map(s => {
      let state = s.status;
      if (s.id === ticketId) {
        state = 'Chamando';
        return { 
          ...s, 
          status: state, 
          consultorio: targetRoom,
          timestampChamada: Date.now()
        };
      } else if (s.status === 'Chamando') {
        // Demote previous blinking ticket to "Em Atendimento"
        state = 'Em Atendimento';
        return { ...s, status: state };
      }
      return s;
    });

    saveSenhas(updated);
  };

  // Move ticket from "Calling" to "Active Treatment"
  const handleStartTreatment = (ticketId: string) => {
    const updated = senhas.map(s => {
      if (s.id === ticketId) {
        return { 
          ...s, 
          status: 'Em Atendimento' as const,
          timestampChamada: s.timestampChamada || Date.now() // set start time
        };
      }
      return s;
    });
    saveSenhas(updated);
  };

  // Finalize attendance session
  const handleEndTreatment = (ticketId: string, visitorId?: string, visitorNome?: string) => {
    const updated = senhas.map(s => {
      if (s.id === ticketId) {
        const durationSec = s.timestampChamada ? Math.floor((Date.now() - s.timestampChamada) / 1000) : 0;
        return { 
          ...s, 
          status: 'Concluido' as const,
          timestampFinalizada: Date.now(),
          tempoAtendimentoSegundos: durationSec
        };
      }
      return s;
    });

    saveSenhas(updated);

    // Ask worker if they want to immediately launch spiritual chakra diagnosis for this visitor
    const wantsDiagnosis = window.confirm(`Atendimento finalizado com sucesso!\n\nDeseja abrir o prontuário para registrar a avaliação de Chakras do(a) assistido(a) "${visitorNome}" agora?`);
    if (wantsDiagnosis) {
      if (visitorId) {
        setVisitanteId(visitorId);
      } else {
        // Try parsing linked cadastrado by searching names
        const matched = visitantes.find(v => v.nomeCompleto.toLowerCase() === visitorNome?.toLowerCase());
        if (matched) {
          setVisitanteId(matched.id);
        } else {
          // Trigger alert to invite adding registration
          alert('Assistido em Entrada Rápida sem ficha cadastral. Insira-o no "Cadastro de Visitantes" primeiro para salvar o prontuário.');
        }
      }
      // Switch tab and present form
      setSubTab('prontuario');
      setShowForm(true);
    }
  };

  // Cancel/Remover ticket
  const handleCancelTicket = (ticketId: string) => {
    if (window.confirm('Deseja realmente cancelar este ticket da fila presencial?')) {
      const updated = senhas.map(s => s.id === ticketId ? { ...s, status: 'Cancelado' as const } : s);
      saveSenhas(updated);
    }
  };

  // Clear entire queue session
  const handleResetQueue = () => {
    if (window.confirm('ATENÇÃO: Deseja realmente finalizar o expediente de hoje e limpar todos as senhas da fila de atendimento do cache local?')) {
      saveSenhas([]);
    }
  };

  // Helpers to format seconds count to duration string
  const formatDuration = (secCount: number) => {
    const minutes = Math.floor(secCount / 60);
    const secs = secCount % 60;
    return `${minutes}m ${secs}s`;
  };

  // Queue Calculations & Statistics
  const todaySenhas = senhas.filter(s => s.status !== 'Cancelado');
  const waitingList = senhas.filter(s => s.status === 'Aguardando');
  const activeList = senhas.filter(s => s.status === 'Chamando' || s.status === 'Em Atendimento');
  const finishedList = senhas.filter(s => s.status === 'Concluido');

  const averageDuration = () => {
    const finishedWithTimes = finishedList.filter(s => s.tempoAtendimentoSegundos && s.tempoAtendimentoSegundos > 0);
    if (finishedWithTimes.length === 0) return '0 min';
    const sum = finishedWithTimes.reduce((acc, curr) => acc + (curr.tempoAtendimentoSegundos || 0), 0);
    const avgSec = Math.floor(sum / finishedWithTimes.length);
    if (avgSec < 60) return `${avgSec} seg`;
    return `${Math.floor(avgSec / 60)} min`;
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-Tabs switching buttons */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setSubTab('prontuario')}
          className={`px-5 py-3 text-xs font-bold font-display uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            subTab === 'prontuario' 
              ? 'border-indigo-600 text-indigo-700 font-extrabold bg-[#1e293b]/5 rounded-t-xl' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Fichas e Prontuários Clinicos</span>
        </button>
        <button
          onClick={() => setSubTab('senhas')}
          className={`px-5 py-3 text-xs font-bold font-display uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            subTab === 'senhas' 
              ? 'border-indigo-600 text-indigo-700 font-extrabold bg-[#1e293b]/5 rounded-t-xl' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span className="relative">
            Controle de Senhas Real-Time
            {waitingList.length > 0 && (
              <span className="absolute -top-2.5 -right-6 bg-rose-500 text-white text-[9.5px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                {waitingList.length}
              </span>
            )}
          </span>
        </button>
      </div>

      {subTab === 'prontuario' ? (
        <>
          {/* Header action Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold font-display text-slate-800 tracking-tight">Atendimento Fraterno Individual</h2>
              <p className="text-xs text-slate-500">Escuta fraterna amorosa, diagnóstico e harmonização fluídica complementar dos sete centros energéticos (Chakras).</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow"
            >
              {showForm ? 'Fechar Sessão' : 'Iniciar Novo Atendimento'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 relative space-y-6 shadow-sm">
              <div className="pb-3 border-b border-slate-100 flex justify-between items-center text-xs">
                <h3 className="text-sm font-bold text-slate-800 font-display">Prontuário de Atendimento Fraterno Individual</h3>
                <span className="text-xs text-indigo-600 tracking-wider uppercase font-semibold">Conselho de Caridade Ativo</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Assistido dropdown */}
                <div className="md:col-span-6">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 font-display">Escolha o Assistido da Ficha Cadastral *</label>
                  <select
                    id="atend-vis-select"
                    required
                    value={visitanteId}
                    onChange={(e) => setVisitanteId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none"
                  >
                    <option value="">-- Clique para selecionar o visitante assistido --</option>
                    {visitantes.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.nomeCompleto} - (Filtro ID: {v.id.toUpperCase()})
                      </option>
                    ))}
                  </select>
                  <p className="text-[9.5px] text-slate-500 mt-1">Dica: Se o nome não constar, primeiro cadastre-o na aba 'Cadastro de Visitantes'.</p>
                </div>

                {/* Atendedor */}
                <div className="md:col-span-6">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 font-display font-medium">Nome do Atendedor (Doutrinador/Acolhedor)</label>
                  <input
                    id="atend-doctor-input"
                    type="text"
                    required
                    placeholder="Insira seu nome"
                    value={atendedorNome}
                    onChange={(e) => setAtendedorNome(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none"
                  />
                </div>

                {/* Relato e Queixas */}
                <div className="md:col-span-12">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 font-display font-medium">Relato de Queixas e Desabafos do Assistido</label>
                  <textarea
                    id="atend-complaints-input"
                    required
                    rows={3}
                    placeholder="Insira as palavras-chave do assistido, sentimentos de remorso, luto, cansaço espiritual, fobias ou obsesses..."
                    value={queixasFraternas}
                    onChange={(e) => setQueixasFraternas(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none"
                  />
                </div>

                {/* Chakras Diagnostics sliders */}
                <div className="md:col-span-12">
                  <div className="pb-2 border-b border-slate-100 mb-3 flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">Passo 2: Diagnóstico dos 7 Centros de Força (Chakras)</h4>
                    <span className="text-[10px] text-slate-500">Regularize de 1 (Bloqueado) a 10 (Alinhado)</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    {/* Visual sliders list */}
                    <div className="space-y-4">
                      {/* Slider 1: Corona */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="flex items-center gap-1 text-[var(--color-chakra-7)] font-semibold">
                            <span>✨</span> Coronário (Conexão Espiritual)
                          </span>
                          <span className="font-mono font-bold text-slate-800">{coronario} / 10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={coronario}
                          onChange={(e) => setCoronario(parseInt(e.target.value))}
                          className="w-full accent-[var(--color-chakra-7)] cursor-pointer"
                        />
                      </div>

                      {/* Slider 2: Frontal */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="flex items-center gap-1 text-[var(--color-chakra-6)] font-semibold">
                            <span>👁️</span> Frontal (Pensamentos / Pineal)
                          </span>
                          <span className="font-mono font-bold text-slate-800">{frontal} / 10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={frontal}
                          onChange={(e) => setFrontal(parseInt(e.target.value))}
                          className="w-full accent-[var(--color-chakra-6)] cursor-pointer"
                        />
                      </div>

                      {/* Slider 3: Laringeo */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="flex items-center gap-1 text-[var(--color-chakra-5)] font-semibold">
                            <span>🗣️</span> Laríngeo (Falta de Voz / Comunicação)
                          </span>
                          <span className="font-mono font-bold text-slate-800">{laringeo} / 10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={laringeo}
                          onChange={(e) => setLaringeo(parseInt(e.target.value))}
                          className="w-full accent-[var(--color-chakra-5)] cursor-pointer"
                        />
                      </div>

                      {/* Slider 4: Cardiaco */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="flex items-center gap-1 text-[var(--color-chakra-4)] font-semibold">
                            <span>💚</span> Cardíaco (Perdão / Mágoa / Timo)
                          </span>
                          <span className="font-mono font-bold text-slate-800">{cardiaco} / 10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={cardiaco}
                          onChange={(e) => setCardiaco(parseInt(e.target.value))}
                          className="w-full accent-[var(--color-chakra-4)] cursor-pointer"
                        />
                      </div>

                      {/* Slider 5: Umbilical */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="flex items-center gap-1 text-[var(--color-chakra-3)] font-semibold">
                            <span>☀️</span> Umbilical (Ansiedade / Estômago)
                          </span>
                          <span className="font-mono font-bold text-slate-800">{umbilical} / 10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={umbilical}
                          onChange={(e) => setUmbilical(parseInt(e.target.value))}
                          className="w-full accent-[var(--color-chakra-3)] cursor-pointer"
                        />
                      </div>

                      {/* Slider 6: Esplenico */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="flex items-center gap-1 text-[var(--color-chakra-2)] font-semibold">
                            <span>🌊</span> Esplênico / Sacro (Vitalidade / Sangue)
                          </span>
                          <span className="font-mono font-bold text-slate-800">{esplenico} / 10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={esplenico}
                          onChange={(e) => setEsplenico(parseInt(e.target.value))}
                          className="w-full accent-[var(--color-chakra-2)] cursor-pointer"
                        />
                      </div>

                      {/* Slider 7: Basico */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="flex items-center gap-1 text-[var(--color-chakra-1)] font-semibold">
                            <span>✊</span> Básico (Coluna / Raiz / Medos)
                          </span>
                          <span className="font-mono font-bold text-slate-800">{basico} / 10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={basico}
                          onChange={(e) => setBasico(parseInt(e.target.value))}
                          className="w-full accent-[var(--color-chakra-1)] cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Right Side: Live recommendations tips based on Sliders */}
                    <div className="flex flex-col justify-between">
                      <div className="space-y-3">
                        <h5 className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-4 h-4" />
                          <span>Análise Energética ao Vivo</span>
                        </h5>
                        
                        <div className="divide-y divide-slate-100 border border-slate-200 p-4 rounded-xl bg-white space-y-2.5">
                          {getInsights().map((insight, idx) => (
                            <p key={idx} className="text-xs text-slate-650 leading-relaxed pt-2 first:pt-0">
                              🎯 {insight}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Recommendations options list checkboxes */}
                      <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
                        <h5 className="text-[11px] uppercase text-slate-500 font-bold block mb-2 font-display">Prescrever Condutas Doutrinárias:</h5>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={passe} onChange={(e) => setPasse(e.target.checked)} className="rounded border-slate-350 text-indigo-650 focus:ring-indigo-600" />
                            <span>Passe de Harmonização</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={aguaFluidificada} onChange={(e) => setAguaFluidificada(e.target.checked)} className="rounded border-slate-350 text-indigo-350 focus:ring-indigo-600" />
                            <span>Água Fluidificada diária</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={evangelhoLar} onChange={(e) => setEvangelhoLar(e.target.checked)} className="rounded border-slate-350 text-indigo-350" />
                            <span>Culto do Evangelho no Lar</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={palestrasPublicas} onChange={(e) => setPalestrasPublicas(e.target.checked)} className="rounded border-slate-350 text-indigo-350" />
                            <span>Palestras Públicas de consolo</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer col-span-2">
                            <input type="checkbox" checked={desobsessao} onChange={(e) => setDesobsessao(e.target.checked)} className="rounded border-slate-350 text-red-650 focus:ring-red-600" />
                            <span className="text-red-600 font-semibold">Tratamento de Desobsessão Auxiliar</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Observacoes Finais */}
                <div className="md:col-span-12">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 font-display font-medium">Diretrizes do Diagnóstico / Observações do Acolhimento</label>
                  <textarea
                    id="atend-obs-input"
                    rows={2}
                    placeholder="Prescreva os dias recomendados de visitação, conselho literário doutrinário ou atitudes mentais para o reequilíbrio emocional no lar..."
                    value={observacoesFinais}
                    onChange={(e) => setObservacoesFinais(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  id="atend-submit-btn"
                  type="submit"
                  className="bg-indigo-650 text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:opacity-95 shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Finalizar Atendimento e Registrar</span>
                </button>
              </div>
            </form>
          )}

          {/* Audit timeline of spiritual consultations */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 font-display">Histórico de Atendimentos do Centro</h3>

            <div className="space-y-4 divide-y divide-slate-100">
              {atendimentos.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  Nenhuma sessão de atendimento registrada até o momento.
                </div>
              ) : (
                atendimentos.map((atend) => (
                  <div key={atend.id} className="pt-4 first:pt-0 flex flex-col md:flex-row gap-4 items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                          Sessão {atend.id.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{atend.dataAtendimento}</span>
                      </div>

                      <h4 className="text-base font-bold text-slate-800 font-display">
                        Assistido: <strong className="text-indigo-600">{atend.visitanteNome}</strong>
                      </h4>
                      
                      <p className="text-xs text-slate-600 leading-relaxed">
                        <strong className="text-slate-500 font-semibold">Queixa Inicial:</strong> "{atend.queixasFraternas}"
                      </p>

                      <p className="text-xs text-slate-600 leading-relaxed italic border-l-2 border-indigo-200 pl-3">
                        <strong className="text-indigo-500 font-semibold not-italic font-medium">Prescrito por {atend.atendedorNome}:</strong> {atend.observacoesFinais}
                      </p>

                      {/* Treatment tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {atend.recomendacoes.passe && <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-900 font-medium">Passe</span>}
                        {atend.recomendacoes.aguaFluidificada && <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-900 font-medium">Água Fluida</span>}
                        {atend.recomendacoes.evangelhoLar && <span className="text-[10px] bg-yellow-950 text-yellow-300 px-2 py-0.5 rounded border border-yellow-900 font-medium font-medium">Culto no Lar</span>}
                        {atend.recomendacoes.palestrasPublicas && <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-900 font-medium">Palestras</span>}
                        {atend.recomendacoes.desobsessao && <span className="text-[10px] bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-900 font-bold">Tratamento Desobsessão</span>}
                      </div>
                    </div>

                    {/* Micro Chakra status bars display on right */}
                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl w-full md:w-56 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider mb-2 font-display">Alinhamento Estimado:</span>
                      
                      <div className="space-y-1.5 text-[10px]">
                        <div className="flex justify-between font-medium text-slate-700">
                          <span className="text-[var(--color-chakra-7)]">Coronário</span>
                          <span className="font-mono text-slate-800">{atend.diagnosticoChakras.coronario}/10</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                          <div className="bg-[var(--color-chakra-7)] h-full" style={{ width: `${atend.diagnosticoChakras.coronario * 10}%` }} />
                        </div>

                        <div className="flex justify-between font-medium text-slate-700">
                          <span className="text-[var(--color-chakra-6)]">Frontal</span>
                          <span className="font-mono text-slate-800">{atend.diagnosticoChakras.frontal}/10</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                          <div className="bg-[var(--color-chakra-6)] h-full" style={{ width: `${atend.diagnosticoChakras.frontal * 10}%` }} />
                        </div>

                        <div className="flex justify-between font-medium text-slate-700">
                          <span className="text-[var(--color-chakra-4)]">Cardíaco</span>
                          <span className="font-mono text-slate-800">{atend.diagnosticoChakras.cardiaco}/10</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                          <div className="bg-[var(--color-chakra-4)] h-full" style={{ width: `${atend.diagnosticoChakras.cardiaco * 10}%` }} />
                        </div>

                        <div className="flex justify-between font-medium text-slate-700">
                          <span className="text-[var(--color-chakra-3)]">Umbilical</span>
                          <span className="font-mono text-slate-800">{atend.diagnosticoChakras.umbilical}/10</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                          <div className="bg-[var(--color-chakra-3)] h-full" style={{ width: `${atend.diagnosticoChakras.umbilical * 10}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        /* VIRTUAL QUEUE SYSTEM TAB */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold font-display text-slate-800 tracking-tight flex items-center gap-2">
                <span>Controle de Atendimento e Senhas Presenciais</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300 font-extrabold uppercase animate-pulse">● Em Tempo Real</span>
              </h2>
              <p className="text-xs text-slate-500">Gestão de fila clínica. Atribua senhas amarelas/azuis aos cadastros, chame no painel eletrônico com som e acompanhe o cronômetro sutil.</p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => window.open(window.location.origin + '?tv=true', '_blank')}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Tv className="w-4 h-4 text-indigo-400" />
                <span>Abrir Tela de TV (Painel Monitor)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSharePanel(!showSharePanel)}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-750 text-xs font-semibold px-4 py-2.5 border border-indigo-200 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-indigo-600" />
                <span>{showSharePanel ? 'Ocultar Compartilhamento' : 'Enviar para outro Aparelho'}</span>
              </button>
              
              <button
                type="button"
                onClick={handleResetQueue}
                className="bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold px-3 py-2.5 rounded-xl transition-all flex items-center gap-1 border border-rose-200 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Fila do Expediente</span>
              </button>
            </div>
          </div>

          {/* Share/Sync Monitor Info Panel */}
          {showSharePanel && (
            <div className="bg-indigo-50/45 border border-indigo-100 rounded-3xl p-6 space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                
                {/* QR Code column */}
                <div className="bg-white p-3 rounded-2xl border border-indigo-100 shadow-md flex-shrink-0 flex flex-col items-center gap-1.5">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '?tv=true')}&color=312e81&bgcolor=ffffff`}
                    alt="QR Code Painel Monitor"
                    className="w-32 h-32 md:w-36 md:h-36 block object-contain"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2' py-0.5 rounded uppercase tracking-wider font-mono">
                    Escaneie para Abrir
                  </span>
                </div>

                {/* Explanation and link copy column */}
                <div className="space-y-3 flex-1">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded border border-indigo-200 uppercase tracking-widest font-mono">
                      Sincronização Remota Ativa
                    </span>
                    <h3 className="text-base font-bold text-slate-850 font-display">
                      Painel Monitor de TV em outros aparelhos
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                      Nosso sistema possui sincronização de dados via servidor na nuvem em tempo real. Escaneie o QR Code ou copie o link abaixo para abrir em <strong>Smart TVs, celulares, tablets ou monitores secundários</strong>. Qualquer senha chamada aqui tocará o sinal sonoro e se atualizará remotamente em todos os aparelhos sincronizados!
                    </p>
                  </div>

                  {/* Copy Link Input Bar */}
                  <div className="flex flex-wrap md:flex-nowrap gap-2 max-w-xl">
                    <input
                      type="text"
                      readOnly
                      value={window.location.origin + '?tv=true'}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-mono flex-1 focus:outline-none min-w-0"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.origin + '?tv=true');
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all text-white cursor-pointer select-none shrink-0 ${copiedLink ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar Link</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => window.open(window.location.origin + '?tv=true', '_blank')}
                      className="bg-slate-100 border border-slate-250 text-slate-700 hover:bg-slate-250 px-3 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer shrink-0"
                      title="Abrir em nova guia"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className="text-[10px] text-slate-500 font-mono">
                    Sinalizador de Dados: <span className="text-slate-700 font-semibold">{window.location.origin}/api/senhas</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Core Analytics Badges belt */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total de Senhas</p>
                <h4 className="text-2xl font-black text-slate-850 font-display mt-0.5">{todaySenhas.length}</h4>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                <Ticket className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Aguardando Fila</p>
                <h4 className="text-2xl font-black text-[#b45309] font-display mt-0.5">{waitingList.length}</h4>
              </div>
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-[#b45309]">
                <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Em Atendimento</p>
                <h4 className="text-2xl font-black text-emerald-700 font-display mt-0.5">{activeList.length}</h4>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-555">
                <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tempo Médio</p>
                <h4 className="text-2xl font-black text-indigo-700 font-display mt-0.5">{averageDuration()}</h4>
              </div>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
              </div>
            </div>
          </div>

          {/* Queue Resiliency Alert info banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-4.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-inner">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">Resiliência Local-First Ativa!</p>
                <p className="text-[10.5px] text-slate-300">As senhas são salvas no armazenamento local. Em caso de queda de energia ou navegação sem internet, todos os dados são recuperados automaticamente.</p>
              </div>
            </div>
            <span className="text-[9.5px] bg-slate-800 text-emerald-400 border border-emerald-900/50 px-2 py-0.5 rounded font-mono font-bold align-middle uppercase">
              Offline-Safe e Seguro
            </span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* Left Box: Generate / Recepcionar Fichas (Takes 4 columns) */}
            <div className="xl:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight font-display flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-indigo-600" />
                  <span>Acolhimento: Gerar Senha</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">Visitante chegou na casa? Cadastre ele na ficha ou preencha a Entrada Rápida para emitir a senha física correta.</p>
              </div>

              <form onSubmit={handleGenerateTicket} className="space-y-4">
                
                {/* 1. Associated Visitor Dropdown */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 font-display">1. Associar a Cadastro Existente (Opcional)</label>
                  <select
                    value={selectedVisitanteIdForTicket}
                    onChange={(e) => {
                      setSelectedVisitanteIdForTicket(e.target.value);
                      if (e.target.value) setManualTicketName(''); // prioritize cadastrado
                    }}
                    className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="">-- Selecione Visitante Cadastrado --</option>
                    {visitantes.map(v => (
                      <option key={v.id} value={v.id}>{v.nomeCompleto}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-px bg-slate-100 flex-grow" />
                  <span className="text-[9.5px] uppercase text-slate-350 font-bold">OU</span>
                  <div className="h-px bg-slate-100 flex-grow" />
                </div>

                {/* 2. Manual / Fast Input name */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 font-display">2. Entrada Rápida (Se não cadastrado)</label>
                  <input
                    type="text"
                    disabled={!!selectedVisitanteIdForTicket}
                    placeholder="Digite o nome completo do visitante..."
                    value={manualTicketName}
                    onChange={(e) => setManualTicketName(e.target.value)}
                    className="w-full bg-slate-50 disabled:bg-slate-100 disabled:opacity-50 border border-slate-250 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                  {selectedVisitanteIdForTicket && (
                    <p className="text-[9px] text-[#b45309] font-medium">Usando o visitante cadastrado selecionado acima.</p>
                  )}
                </div>

                {/* 3. Ticket Color (Yellow vs Blue) */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700 font-display">3. Tipo de Ficha de Senha Física dada</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTicketColor('Amarela')}
                      className={`py-3 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        ticketColor === 'Amarela'
                          ? 'bg-[#fffbeb] border-[#fde68a] text-[#b45309] scale-[1.02] shadow-sm'
                          : 'bg-white border-slate-200 text-slate-450 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-[#facc15] border border-amber-400" />
                      <span>Ficha Amarela</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTicketColor('Azul')}
                      className={`py-3 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        ticketColor === 'Azul'
                          ? 'bg-[#eff6ff] border-[#bfdbfe] text-[#1d4ed8] scale-[1.02] shadow-sm'
                          : 'bg-white border-slate-200 text-slate-450 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-[#3b82f6] border border-blue-400" />
                      <span>Ficha Azul</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold font-display uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Ticket className="w-4 h-4 text-indigo-200" />
                  <span>Gerar e Enfileirar Senha</span>
                </button>
              </form>
            </div>

            {/* Right Box: Enfileirados e Ativos Panels (Takes 8 columns) */}
            <div className="xl:col-span-8 space-y-6">
              
              {/* Box 1: Fila de Espera (Aguardando Atendimento) */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight font-display">Aguardando Chamada ({waitingList.length})</h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Ordenado por ordem de chegada</span>
                </div>

                <div className="space-y-2.5">
                  {waitingList.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                      Não há nenhuma senha aguardando na fila. Gere uma senha no painel ao lado para iniciar.
                    </div>
                  ) : (
                    waitingList.map((ticket, idx) => {
                      const waitingMin = Math.floor((Date.now() - ticket.timestampGerada) / 60000);
                      const currentRoom = selectedRoomForCall[ticket.id] || 'Acolhimento 1';
                      
                      return (
                        <div 
                          key={ticket.id} 
                          className={`border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                            ticket.tipo === 'Amarela' 
                              ? 'bg-amber-50/20 border-amber-100 hover:bg-amber-50/30' 
                              : 'bg-blue-50/10 border-blue-100 hover:bg-blue-50/20'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 flex-1 min-w-0">
                            {/* Queue Index badge */}
                            <span className="text-xs text-slate-400 font-mono font-bold select-none p-1 bg-slate-100 rounded-md">
                              #{idx + 1}
                            </span>
                            
                            {/* Colorful Ticket code */}
                            <div className={`w-18 py-3 text-center text-base font-black font-mono rounded-xl block shadow-sm border-2 ${
                              ticket.tipo === 'Amarela' 
                                ? 'bg-[#facc15] text-[#0f172a] border-[#eab308]' 
                                : 'bg-[#3b82f6] text-white border-[#2563eb]'
                            }`}>
                              {ticket.numero}
                            </div>

                            {/* Visitor Details */}
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight truncate">{ticket.visitanteNome}</h4>
                              <p className="text-[10.5px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>Chegou às {ticket.horaGerada}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-[#b45309] font-semibold">Esperando há {waitingMin} m</span>
                              </p>
                            </div>
                          </div>

                          {/* Action call console */}
                          <div className="flex flex-wrap items-center gap-2 bg-white/70 backdrop-blur p-2 rounded-xl border border-dotted border-slate-200">
                            <div className="flex flex-col">
                              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider px-1">Consultório / Sala</span>
                              <select
                                value={currentRoom}
                                onChange={(e) => setSelectedRoomForCall({ ...selectedRoomForCall, [ticket.id]: e.target.value })}
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] focus:outline-none"
                              >
                                <option value="Acolhimento Fraterno 1">Acolhimento 1</option>
                                <option value="Acolhimento Fraterno 2">Acolhimento 2</option>
                                <option value="Sala de Passes A">Sala de Passes A</option>
                                <option value="Sala de Passes B">Sala de Passes B</option>
                                <option value="Vibrações de Equilíbrio">Sala de Vibrações</option>
                              </select>
                            </div>

                            <button
                              onClick={() => handleCallTicket(ticket.id)}
                              className="self-end px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Volume2 className="w-3.5 h-3.5 text-indigo-200 animate-bounce" />
                              <span>Chamar no Painel</span>
                            </button>

                            <button
                              onClick={() => handleCancelTicket(ticket.id)}
                              className="self-end p-2 text-rose-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Cancelar Ticket"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Box 2: Atendimentos em Andamento (Treated) */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight font-display">Atendimento Ativo ({activeList.length})</h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Em consultório/sala agora</span>
                </div>

                <div className="space-y-3">
                  {activeList.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      Não há profissionais realizando atendimentos ativos neste momento.
                    </div>
                  ) : (
                    activeList.map((ticket) => {
                      const callTime = ticket.timestampChamada || Date.now();
                      const secondsInSession = Math.floor((Date.now() - callTime) / 1000);
                      const isBlinking = ticket.status === 'Chamando';

                      return (
                        <div 
                          key={ticket.id} 
                          className={`bg-slate-50 border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                            isBlinking 
                              ? 'ring-2 ring-indigo-500 bg-indigo-50/10' 
                              : 'border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Color ticket display */}
                            <span className={`w-16 py-2.5 text-center text-sm font-black font-mono rounded-xl block border ${
                              ticket.tipo === 'Amarela' ? 'bg-[#facc15] text-[#0f172a] border-[#eab308]' : 'bg-[#3b82f6] text-white border-[#2563eb]'
                            }`}>
                              {ticket.numero}
                            </span>

                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight truncate">
                                {ticket.visitanteNome}
                              </h4>
                              <p className="text-[10.5px] text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
                                <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-bold">{ticket.consultorio}</span>
                                <span className="text-slate-300">•</span>
                                <span className="flex items-center gap-0.5 text-emerald-600 font-bold">
                                  <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                                  <span>{formatDuration(secondsInSession)}</span>
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* State Actions */}
                          <div className="flex items-center gap-2">
                            {isBlinking && (
                              <button
                                onClick={() => handleStartTreatment(ticket.id)}
                                className="px-3 py-1.5 bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold rounded-lg hover:bg-emerald-200 transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Play className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Iniciar Atend.</span>
                              </button>
                            )}

                            {/* Trigger repeat voice paging */}
                            <button
                              onClick={() => handleCallTicket(ticket.id)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-600 text-[11px] font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                              title="Chamar Novamente no Monitor"
                            >
                              <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                              <span>Re-Chamar</span>
                            </button>

                            <button
                              onClick={() => handleEndTreatment(ticket.id, ticket.visitanteId, ticket.visitanteNome)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-indigo-10s" />
                              <span>Concluir</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Box 3: Senhas Finalizadas Recentes (Log List) */}
              <div className="bg-slate-50/60 border border-slate-200 rounded-3xl p-6 space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Log de Atendimentos Concluídos ({finishedList.length})</h3>
                
                <div className="space-y-1.5">
                  {finishedList.length === 0 ? (
                    <p className="text-slate-400 text-xs italic text-center py-2">Nenhum atendimento finalizado na sessão corrente.</p>
                  ) : (
                    finishedList.map((f) => (
                      <div key={f.id} className="text-xs flex items-center justify-between p-2 rounded-xl bg-white border border-slate-150">
                        <div className="flex items-center gap-2 truncate flex-1 min-w-0 pr-2">
                          <span className={`w-14 py-1 text-center font-black font-mono text-[10.5px] rounded-lg border block ${
                            f.tipo === 'Amarela' ? 'bg-[#facc15]/10 text-[#5f4900] border-[#facc15]/30' : 'bg-[#3b82f6]/10 text-[#1d4ed8] border-[#3b82f6]/30'
                          }`}>
                            {f.numero}
                          </span>
                          <span className="font-bold text-slate-800 uppercase truncate text-[11px]">{f.visitanteNome}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-450 text-[10px] font-mono font-medium">
                          <span className="bg-slate-100 px-1.5 py-0.3 rounded">{f.consultorio}</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-semibold">{f.tempoAtendimentoSegundos ? formatDuration(f.tempoAtendimentoSegundos) : '0s'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
