import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Eye, 
  Check, 
  Settings, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Users, 
  ShieldAlert, 
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  Info
} from 'lucide-react';
import { AtendimentoFraterno, EventoAgenda, SenhaAtendimento } from '../types';

interface NotificationSettingsPanelProps {
  currentUser: { name: string; email: string; role: string; isAdmin: boolean };
  eventos: EventoAgenda[];
  atendimentos: AtendimentoFraterno[];
  senhas: SenhaAtendimento[];
}

export default function NotificationSettingsPanel({
  currentUser,
  eventos,
  atendimentos,
  senhas
}: NotificationSettingsPanelProps) {
  // --- Persistent States from LocalStorage ---
  // Agenda Configuration
  const [agendaEmail, setAgendaEmail] = useState(() => localStorage.getItem('sgfce_cfg_agenda_email') !== 'false');
  const [agendaPush, setAgendaPush] = useState(() => localStorage.getItem('sgfce_cfg_agenda_push') !== 'false');
  const [agendaDays, setAgendaDays] = useState(() => Number(localStorage.getItem('sgfce_cfg_agenda_days') || '7'));

  // Atendimento Configuration
  const [atendEmail, setAtendEmail] = useState(() => localStorage.getItem('sgfce_cfg_atend_email') !== 'false');
  const [atendPush, setAtendPush] = useState(() => localStorage.getItem('sgfce_cfg_atend_push') !== 'false');
  const [atendFilaMinutos, setAtendFilaMinutos] = useState(() => Number(localStorage.getItem('sgfce_cfg_atend_fila_minutos') || '15'));

  // General Notification preferences
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('sgfce_notif_sound') !== 'false');
  const [targetEmail, setTargetEmail] = useState(() => localStorage.getItem('sgfce_notif_target_email') || currentUser.email);
  const [workerName, setWorkerName] = useState(() => localStorage.getItem('sgfce_notif_worker_name') || currentUser.name);

  // Interface States
  const [testMode, setTestMode] = useState<'none' | 'push' | 'email'>('none');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<any | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Save modifications to localStorage
  const handleSaveSettings = () => {
    localStorage.setItem('sgfce_cfg_agenda_email', String(agendaEmail));
    localStorage.setItem('sgfce_cfg_agenda_push', String(agendaPush));
    localStorage.setItem('sgfce_cfg_agenda_days', String(agendaDays));
    
    localStorage.setItem('sgfce_cfg_atend_email', String(atendEmail));
    localStorage.setItem('sgfce_cfg_atend_push', String(atendPush));
    localStorage.setItem('sgfce_cfg_atend_fila_minutos', String(atendFilaMinutos));
    
    localStorage.setItem('sgfce_notif_sound', String(soundEnabled));
    localStorage.setItem('sgfce_notif_target_email', targetEmail);
    localStorage.setItem('sgfce_notif_worker_name', workerName);

    // Also update legacy key used by the bell component to keep them synchronized
    localStorage.setItem('sgfce_notif_email', String(agendaEmail || atendEmail));

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Sound play simulation
  const triggerSoundTest = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 high note
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);

      setTestMode('push');
      setTimeout(() => setTestMode('none'), 2000);
    } catch (e) {
      console.warn('Audio Context is blocked or not supported:', e);
    }
  };

  // Email payload simulation via real backend API
  const triggerEmailTest = async () => {
    if (isSendingTest) return;
    setIsSendingTest(true);

    const testItems = [
      {
        type: 'agenda',
        category: 'Agenda Sede',
        title: 'Palestra Pública de Doutrina Espírita - O Livro dos Espíritos',
        time: '19:30',
        location: 'Salão Principal'
      },
      {
        type: 'atendimento',
        category: 'Fila de Espera',
        title: 'Senha AM-048 (Pedro de Alcântara) ultrapassou o limite de 15 minutos na fila de espera.',
        time: 'Gerada às 08:30'
      }
    ];

    try {
      const res = await fetch('/api/send-reminder-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail.trim(),
          workerName: workerName.trim(),
          subject: '🔔 TESTE DE MENSAGERIA: Preferências de Remetente Ativas',
          items: testItems
        })
      });

      if (res.ok) {
        const data = await res.json();
        setTestEmailResult(data);
        setTestMode('email');
      } else {
        alert('Erro ao processar envio do email de teste.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão com o servidor de mensageria.');
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Visual Header Banner block */}
      <header className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider font-mono border border-indigo-400/20 inline-block">
              Preferências do Usuário
            </span>
            <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
              <Sliders className="w-6 h-6 text-indigo-400" />
              Configuração e Alertería de Remessas
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Ajuste como e quando você prefere receber alertas sobre prazos de atendimentos caritativos e prazos da agenda espírita na sede. A sincronização remota opera em tempo real!
            </p>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleSaveSettings}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-3 rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer relative"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300 animate-scale" />
                  <span>Configurações Salvas!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Salvar Preferências</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main configuration settings grid */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Core Toggles & Rules (Takes 8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section 1: Agenda Reminders */}
          <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-750 border border-purple-100">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 font-display">Lembretes de Agenda & Eventos</h3>
                  <p className="text-[11px] text-slate-450">Agende palestras, mutirões, passes e reuniões doutrinárias</p>
                </div>
              </div>
            </div>

            {/* Config rules nested */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-150 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-slate-400" />
                    Receber por e-mail
                  </span>
                  <button
                    type="button"
                    onClick={() => setAgendaEmail(!agendaEmail)}
                    className="text-indigo-605 transition-colors cursor-pointer"
                  >
                    {agendaEmail ? <ToggleRight className="w-9 h-9 text-indigo-600" /> : <ToggleLeft className="w-9 h-9 text-slate-400" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-550 leading-relaxed font-normal">
                  Dispara um resumo contendo a agenda e atividades coletadas diretamente no seu e-mail de contato cadastrado.
                </p>
              </div>

              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-150 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-slate-400" />
                    Push no Painel (Sinal Auditivo)
                  </span>
                  <button
                    type="button"
                    onClick={() => setAgendaPush(!agendaPush)}
                    className="text-indigo-605 transition-colors cursor-pointer"
                  >
                    {agendaPush ? <ToggleRight className="w-9 h-9 text-indigo-600" /> : <ToggleLeft className="w-9 h-9 text-slate-400" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-550 leading-relaxed font-normal">
                  Exibe avisos visuais vermelhos com badge piscante de eventos recentes na barra superior da ferramenta de administração.
                </p>
              </div>

            </div>

            {/* Threshold Slider or Input */}
            <div className="bg-indigo-50/20 border border-indigo-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-750 flex items-center gap-1 text-indigo-950">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  Janela de Antecedência de Eventos
                </h4>
                <p className="text-[11px] text-slate-550 max-w-md">
                  Determina quantos dias antes do início do compromisso o sistema passará a alertar na tela.
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="range"
                  min="1"
                  max="14"
                  value={agendaDays}
                  onChange={(e) => setAgendaDays(Number(e.target.value))}
                  className="w-32 accent-indigo-600 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold bg-white border border-slate-205 px-2.5 py-1 rounded-xl text-indigo-755 shadow-xs whitespace-nowrap">
                  {agendaDays === 1 ? 'Nas próximas 24 horas' : `Próximos ${agendaDays} dias`}
                </span>
              </div>
            </div>
          </section>

          {/* Section 2: Attendance Deadlines */}
          <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-750 border border-emerald-100">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 font-display">Prazos de Atendimento Fraterno & Filas</h3>
                  <p className="text-[11px] text-slate-450">Inspeção de tempo de espera limite para chamadas presenciais e atendimentos</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-150 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-slate-400" />
                    Avisar por E-mail
                  </span>
                  <button
                    type="button"
                    onClick={() => setAtendEmail(!atendEmail)}
                    className="text-indigo-605 transition-colors cursor-pointer"
                  >
                    {atendEmail ? <ToggleRight className="w-9 h-9 text-indigo-600" /> : <ToggleLeft className="w-9 h-9 text-slate-400" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-550 leading-relaxed font-normal">
                  Transmite alertas urgentes por e-mail quando tratamentos agendados em atrasos passados continuam em aberto.
                </p>
              </div>

              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-150 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-slate-400" />
                    Push no Painel (Urgentes)
                  </span>
                  <button
                    type="button"
                    onClick={() => setAtendPush(!atendPush)}
                    className="text-indigo-605 transition-colors cursor-pointer"
                  >
                    {atendPush ? <ToggleRight className="w-9 h-9 text-indigo-600" /> : <ToggleLeft className="w-9 h-9 text-slate-400" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-550 leading-relaxed font-normal">
                  Identifica pacientes na recepção aguardando por longos períodos sem triagem correspondente.
                </p>
              </div>

            </div>

            {/* Queue limit setup Input */}
            <div className="bg-emerald-50/20 border border-emerald-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-750 flex items-center gap-1 text-emerald-950">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  Espera Máxima Recomendada na Fila (Minutos)
                </h4>
                <p className="text-[11px] text-slate-550 max-w-md">
                  Gera um alerta de urgência vermelha caso o paciente na recepção passe mais do que este valor sem ser chamado.
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={atendFilaMinutos}
                  onChange={(e) => setAtendFilaMinutos(Number(e.target.value))}
                  className="bg-white border border-slate-250 text-slate-805 text-xs font-mono font-bold px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-505 shadow-xs"
                >
                  <option value="5">05 Minutos (Sensível)</option>
                  <option value="10">10 Minutos</option>
                  <option value="15">15 Minutos (Padrão)</option>
                  <option value="20">20 Minutos</option>
                  <option value="25">25 Minutos (Tolerante)</option>
                  <option value="30">30 Minutos (Crítico)</option>
                </select>
              </div>
            </div>
          </section>

        </div>

        {/* Right column: Target Receiver Configuration & Test simulator (Takes 4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Section 3: Destinatary info */}
          <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Destinatário & Som</h3>
            
            <div className="space-y-3 text-xs">
              
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Nome do Tarefeiro</label>
                <input 
                  type="text" 
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  placeholder="Nome do operador"
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">E-mail para Recebimento</label>
                <input 
                  type="email" 
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder="email@fraternidade.org"
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-mono rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-450">Será onde os e-mails com as pendências serão despachados.</span>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-750 font-bold flex items-center gap-1.5">
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-emerald-600 animate-bounce" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-400" />
                    )}
                    Som nos Alertas de Painel
                  </span>
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="rounded text-indigo-605 cursor-pointer accent-indigo-600"
                  />
                </label>
                <p className="text-[10px] text-slate-500 mt-1">Gera um aviso sonoro (ping) no painel quando novas ocorrências surgirem.</p>
              </div>

            </div>
          </section>

          {/* Section 4: Live Test Simulator sandbox */}
          <section className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 text-slate-800">
              <Sparkles className="w-12 h-12 text-slate-700/25 pointer-events-none" />
            </div>

            <div className="space-y-1">
              <span className="text-[9px] bg-slate-800 text-indigo-300 font-extrabold px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-widest font-mono">
                Ambiente de Testes
              </span>
              <h3 className="text-sm font-bold text-white font-display">Testar Canal de Comunicações</h3>
              <p className="text-[11px] text-slate-350 leading-relaxed">
                Simule imediatamente os alertas que os tarefeiros receberão para garantir que as portas e filtros estejam operacionais:
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              
              <button
                type="button"
                onClick={triggerSoundTest}
                className="w-full bg-slate-800 hover:bg-slate-750 text-indigo-300 hover:text-white border border-slate-700 p-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer shadow-sm select-none"
              >
                <span className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-indigo-400" />
                  Disparar Som (Push de Painel)
                </span>
                {testMode === 'push' ? (
                  <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase animate-pulse">Reproduzido!</span>
                ) : (
                  <span className="text-[9.5px] font-mono text-slate-500 font-bold uppercase">Testar</span>
                )}
              </button>

              <button
                type="button"
                disabled={isSendingTest}
                onClick={triggerEmailTest}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer shadow-md select-none disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-indigo-200" />
                  Enviar E-mail de Teste
                </span>
                {isSendingTest ? (
                  <span className="text-[9.5px] font-mono text-indigo-200 animate-pulse">Despachando...</span>
                ) : (
                  <span className="text-[9.5px] font-mono text-indigo-200 uppercase">Enviar</span>
                )}
              </button>

            </div>

            <div className="text-[10px] text-slate-400 leading-normal bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
              <strong>Simulação SMTP:</strong> O Express criará uma visualização estática fiel da mensagem e simulará seu recebimento em tempo real.
            </div>
          </section>

        </div>

      </main>

      {/* Beautiful Simulated Email Delivery Modal - exact match from RemindersNotificationCenter but custom styles */}
      {testMode === 'email' && testEmailResult && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white text-slate-800 rounded-3xl border border-slate-205 max-w-2xl w-full shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto animate-in scale-in duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-150 pb-3">
              <div className="flex items-center gap-2 text-indigo-650">
                <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold font-display text-slate-805">
                  Notificação Preferencial Enviada!
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTestMode('none')}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
              >
                <span className="font-bold text-xs uppercase px-2 py-1 bg-slate-100 rounded-lg text-slate-650">Fechar</span>
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-mono space-y-1 text-slate-650">
              <div><strong>Filtro de Compromissos:</strong> <span className="text-purple-700 font-semibold">{agendaDays} dias de antecedência</span></div>
              <div><strong>Alerta de Fila:</strong> <span className="text-emerald-700 font-semibold">{atendFilaMinutos} minutos limites</span></div>
              <div><strong>Destinatário Selecionado:</strong> <span className="text-slate-800">{testEmailResult.recipient} ({workerName})</span></div>
              <div className="text-[10.5px] border-t border-slate-200 pt-1 text-slate-500">Atestado de envio: <span className="text-green-700 font-bold">250 OK - SMTP Real-time local</span></div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-inner max-h-96 overflow-y-auto">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider flex items-center justify-between">
                <span>Visualização Final do Cliente de E-mail</span>
                <span className="text-indigo-600 font-semibold">[Simulador HTML]</span>
              </div>
              <div 
                className="p-4 bg-white"
                dangerouslySetInnerHTML={{ __html: testEmailResult.bodyPreviewHtml }}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setTestMode('none')}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Retornar ao Painel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
