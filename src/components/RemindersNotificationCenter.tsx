import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellRing, 
  Settings, 
  Mail, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Check, 
  CheckCircle, 
  Send, 
  Volume2, 
  VolumeX, 
  Info, 
  Eye, 
  X,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { AtendimentoFraterno, EventoAgenda, SenhaAtendimento } from '../types';

interface RemindersNotificationCenterProps {
  currentUser: { name: string; email: string; role: string; isAdmin: boolean };
  eventos: EventoAgenda[];
  atendimentos: AtendimentoFraterno[];
  senhas: SenhaAtendimento[];
}

interface Reminder {
  id: string;
  type: 'atendimento' | 'agenda' | 'fila';
  title: string;
  subtitle: string;
  time?: string;
  location?: string;
  category: string;
  isUrgent: boolean;
  timeAgoMinutes?: number;
}

export default function RemindersNotificationCenter({
  currentUser,
  eventos,
  atendimentos,
  senhas
}: RemindersNotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeReminders, setActiveReminders] = useState<Reminder[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('sgfce_notif_sound') !== 'false';
  });
  const [emailEnabled, setEmailEnabled] = useState(() => {
    return localStorage.getItem('sgfce_notif_email') === 'true';
  });
  const [targetEmail, setTargetEmail] = useState(currentUser.email);
  const [showConfig, setShowConfig] = useState(false);
  
  // Email sending states
  const [isSending, setIsSending] = useState(false);
  const [emailResult, setEmailResult] = useState<any | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);

  // Web Audio Hook - ping sound synthesis
  const playPingSound = () => {
    if (!soundEnabled) return;
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
    } catch (e) {
      console.warn('Audio Context is blocked or not supported yet:', e);
    }
  };

  // Run calculation loop for reminders
  useEffect(() => {
    const calculateReminders = () => {
      const reminders: Reminder[] = [];
      const now = Date.now();
      const todayStr = new Date().toISOString().substring(0, 10);

      // Read preference options dynamically from localStorage
      const cfgAgendaDays = Number(localStorage.getItem('sgfce_cfg_agenda_days') || '7');
      const cfgAgendaPush = localStorage.getItem('sgfce_cfg_agenda_push') !== 'false';
      
      const cfgAtendPush = localStorage.getItem('sgfce_cfg_atend_push') !== 'false';
      const cfgAtendFilaMinutos = Number(localStorage.getItem('sgfce_cfg_atend_fila_minutos') || '15');
      
      const cfgSoundEnabled = localStorage.getItem('sgfce_notif_sound') !== 'false';
      if (soundEnabled !== cfgSoundEnabled) {
        setSoundEnabled(cfgSoundEnabled);
      }

      // 1. Calculate Queue Delays (Senhas "Aguardando" for > cfgAtendFilaMinutos)
      if (cfgAtendPush) {
        senhas.forEach(ticket => {
          if (ticket.status === 'Aguardando') {
            const diffMs = now - ticket.timestampGerada;
            const diffMinutes = Math.floor(diffMs / 60000);
            if (diffMinutes >= cfgAtendFilaMinutos) {
              reminders.push({
                id: `rem-senha-${ticket.id}`,
                type: 'fila',
                title: `Senha ${ticket.numero} com Longa Espera`,
                subtitle: `Fila ${ticket.tipo}: ${ticket.visitanteNome} está aguardando há ${diffMinutes} minutos.`,
                category: 'Fila de Espera',
                isUrgent: diffMinutes >= (cfgAtendFilaMinutos + 10),
                timeAgoMinutes: diffMinutes
              });
            }
          }
        });
      }

      // 2. Calculate Fraternal Treatment Deadlines / Schedules (Agendado for Today)
      if (cfgAtendPush) {
        atendimentos.forEach(atend => {
          if (atend.status === 'Agendado') {
            // If scheduled for today or past uncompleted
            if (atend.dataAtendimento <= todayStr) {
              const isToday = atend.dataAtendimento === todayStr;
              reminders.push({
                id: `rem-atend-${atend.id}`,
                type: 'atendimento',
                title: `Atendimento Fraterno: ${atend.visitanteNome}`,
                subtitle: isToday 
                  ? `Está agendado para HOJE. Atendedor responsável: ${atend.atendedorNome || 'Não atribuído'}.` 
                  : `Atrasado! Agendado anteriormente em ${atend.dataAtendimento.split('-').reverse().join('/')}.`,
                category: 'Tratamento',
                isUrgent: !isToday, // Past days agendados are urgent
              });
            }
          }
        });
      }

      // 3. Calculate Upcoming Events (Next cfgAgendaDays)
      if (cfgAgendaPush) {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + cfgAgendaDays);
        const nextWeekStr = nextWeek.toISOString().substring(0, 10);

        eventos.forEach(ev => {
          if (ev.date >= todayStr && ev.date <= nextWeekStr) {
            const isToday = ev.date === todayStr;
            reminders.push({
              id: `rem-ev-${ev.id}`,
              type: 'agenda',
              title: ev.title,
              subtitle: `${ev.category} • ${ev.date.split('-').reverse().join('/')} às ${ev.time}`,
              time: ev.time,
              location: ev.location,
              category: 'Agenda Sede',
              isUrgent: isToday
            });
          }
        });
      }

      setActiveReminders(reminders);

      // Play ping sound if count of urgent/unprocessed reminders increased
      if (reminders.length > lastNotificationCount) {
        playPingSound();
      }
      setLastNotificationCount(reminders.length);
    };

    calculateReminders();
    // Re-check periodically every 15 seconds
    const interval = setInterval(calculateReminders, 15000);
    return () => clearInterval(interval);
  }, [eventos, atendimentos, senhas, soundEnabled, lastNotificationCount]);

  // Persist settings
  const toggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    localStorage.setItem('sgfce_notif_sound', String(nextVal));
  };

  const toggleEmail = () => {
    const nextVal = !emailEnabled;
    setEmailEnabled(nextVal);
    localStorage.setItem('sgfce_notif_email', String(nextVal));
  };

  // Execute real-time mock SMTP dispatch API on the backend
  const triggerEmailAlert = async () => {
    if (isSending) return;
    setIsSending(true);

    const emailItems = activeReminders.map(r => ({
      type: r.type,
      category: r.category,
      title: r.title + ' - ' + r.subtitle,
      time: r.time || undefined,
      location: r.location || undefined
    }));

    try {
      const response = await fetch('/api/send-reminder-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: targetEmail.trim(),
          workerName: currentUser.name,
          subject: `📋 Atividades & Lembretes SGFCe - ${currentUser.name}`,
          items: emailItems
        })
      });

      if (response.ok) {
        const data = await response.json();
        setEmailResult(data);
        setShowEmailModal(true);
      } else {
        alert('Erro ao processar envio de email.');
      }
    } catch (e) {
      console.error(e);
      alert('Erro de conexão ao servidor de mensageria.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative">
      {/* Visual Notification Bell Trigger Button */}
      <button
        id="reminders-notif-bell"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-full border transition-all cursor-pointer flex items-center justify-center ${activeReminders.length > 0 ? 'bg-red-50 border-red-200 hover:bg-red-100 text-red-650' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'}`}
        title="Lembretes do Tarefeiro"
      >
        {activeReminders.some(r => r.isUrgent) ? (
          <BellRing className="w-4 h-4 animate-swing text-red-605" />
        ) : (
          <Bell className="w-4 h-4" />
        )}
        
        {activeReminders.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white font-extrabold text-[9px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse border border-white">
            {activeReminders.length}
          </span>
        )}
      </button>

      {/* Dropdown overlay drawer */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3.5 w-96 max-w-[calc(100vw-32px)] bg-white border border-slate-200 rounded-3xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-250">
            {/* Header section */}
            <div className="bg-slate-900 text-white p-4 items-center justify-between flex">
              <div className="flex items-center gap-2">
                <Bell className="w-4.5 h-4.5 text-indigo-300" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider font-display">Lembretes do Tarefeiro</h3>
                  <p className="text-[10px] text-slate-300">Notificações e prazos automáticos</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowConfig(!showConfig)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${showConfig ? 'bg-slate-800 text-indigo-300' : 'hover:bg-slate-800 text-slate-400'}`}
                  title="Configurar Alertas"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Config panel area inside container if toggled */}
            {showConfig ? (
              <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3 animate-in slide-in-from-top-2 duration-150">
                <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Ajustes de Mensageria</h4>
                
                <div className="space-y-2 text-xs">
                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="text-slate-650 font-semibold flex items-center gap-1.5">
                      {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-slate-500" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
                      Sinal sonoro do painel
                    </span>
                    <input 
                      type="checkbox"
                      checked={soundEnabled} 
                      onChange={toggleSound}
                      className="rounded text-indigo-650 cursor-pointer focus:ring-indigo-605"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="text-slate-650 font-semibold flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      Alertas automáticos via e-mail
                    </span>
                    <input 
                      type="checkbox"
                      checked={emailEnabled} 
                      onChange={toggleEmail}
                      className="rounded text-indigo-650 cursor-pointer focus:ring-indigo-605"
                    />
                  </label>
                </div>

                <div className="space-y-1.5 pt-1.5 border-t border-slate-200">
                  <label className="block text-[10px] uppercase font-bold text-slate-500">E-mail para Recebimento</label>
                  <div className="flex gap-1.5">
                    <input
                      type="email"
                      value={targetEmail}
                      onChange={(e) => setTargetEmail(e.target.value)}
                      placeholder="seu.email@fraternidade.org"
                      className="bg-white border border-slate-200 px-2.5 py-1.5 text-xs rounded-xl flex-1 focus:ring-1 focus:ring-indigo-505 focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      disabled={isSending || activeReminders.length === 0}
                      onClick={triggerEmailAlert}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1 disabled:opacity-45 disabled:cursor-not-allowed select-none shadow-sm"
                      title="Enviar e-mail de teste com as pendências selecionadas"
                    >
                      <Send className="w-3 h-3" />
                      <span>{isSending ? '...' : 'Enviar'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {/* List container of active reminders */}
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 bg-white">
              {activeReminders.length === 0 ? (
                <div className="p-8 text-center text-slate-450 space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-550 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">Tudo em dia sob sua responsabilidade!</p>
                  <p className="text-[10px] text-slate-500 max-w-xs mx-auto">Nenhum prazo atrasado ou paciente aguardando há mais de 15 minutos na fila.</p>
                </div>
              ) : (
                activeReminders.map((rem) => (
                  <div 
                    key={rem.id} 
                    className={`p-3.5 flex gap-3 transition-colors hover:bg-slate-50/70 ${rem.isUrgent ? 'bg-rose-50/50' : ''}`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {rem.type === 'fila' ? (
                        <div className={`p-1.5 rounded-xl ${rem.isUrgent ? 'bg-rose-100 text-rose-750' : 'bg-amber-100 text-amber-700'}`}>
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                      ) : rem.type === 'atendimento' ? (
                        <div className="p-1.5 rounded-xl bg-cyan-50 text-cyan-705 border border-cyan-100">
                          <ClipboardList className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-750 border border-indigo-100">
                          <Calendar className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className={`text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded font-mono ${rem.isUrgent ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-650'}`}>
                          {rem.category}
                        </span>
                        {rem.isUrgent && (
                          <span className="text-[9.5px] font-black text-rose-700 uppercase animate-pulse">Urgente</span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-805 leading-snug">{rem.title}</h4>
                      <p className="text-[10.5px] text-slate-600 leading-relaxed font-normal">{rem.subtitle}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer details bar */}
            <div className="bg-slate-50 p-3 px-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <div className="flex items-center gap-1 text-slate-600">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Atualizado em tempo real</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-indigo-650 font-bold hover:underline cursor-pointer"
              >
                Fechar Painel
              </button>
            </div>
          </div>
        </>
      )}

      {/* Beautiful Simulated Email Delivery Modal */}
      {showEmailModal && emailResult && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-205 max-w-2xl w-full shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto animate-in scale-in duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-150 pb-3">
              <div className="flex items-center gap-2 text-emerald-650">
                <CheckCircle className="w-5 h-5 text-emerald-550" />
                <h3 className="text-base font-bold font-display text-slate-800">
                  Notificação via E-mail Simulada com Sucesso!
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-mono space-y-1.5 text-slate-650">
              <div><strong className="text-slate-800">Remetente SMTP:</strong> {emailResult.sender}</div>
              <div><strong className="text-slate-800">Destinatário:</strong> {emailResult.recipient}</div>
              <div><strong className="text-slate-800">Assunto:</strong> {emailResult.subject}</div>
              <div><strong className="text-slate-800">Status do Servidor:</strong> <span className="text-emerald-700 font-bold">250 OK (Despachado via Node Express Server)</span></div>
              <div className="text-[10px] text-slate-450 pt-1 border-t border-slate-200">Servidor em tempo real: <span className="text-indigo-650">{window.location.host}/api/send-reminder-email</span></div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-inner max-h-96 overflow-y-auto">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 text-[10.5px] uppercase font-bold text-slate-500 font-mono tracking-wider flex items-center justify-between">
                <span>Visualização do Conteúdo do E-mail</span>
                <span className="text-indigo-650 font-semibold">[HTML Rendered]</span>
              </div>
              <div 
                className="p-4 bg-white"
                dangerouslySetInnerHTML={{ __html: emailResult.bodyPreviewHtml }}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Fechar Visualização
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
