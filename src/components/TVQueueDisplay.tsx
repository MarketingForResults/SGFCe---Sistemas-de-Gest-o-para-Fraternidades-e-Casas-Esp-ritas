import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Clock, Volume2, VolumeX, ArrowRight, AppWindow } from 'lucide-react';
import { SenhaAtendimento } from '../types';

export default function TVQueueDisplay() {
  const [senhas, setSenhas] = useState<SenhaAtendimento[]>([]);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [currentDateShort, setCurrentDateShort] = useState<string>('');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [lastCalledId, setLastCalledId] = useState<string | null>(null);

  // Load and subscribe to queue state changes from localStorage + Server API
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

            // Detect if a ticket status transition to "Chamando" happened to play chime
            const currentCall = body.senhas.find((s: any) => s.status === 'Chamando');
            if (currentCall && currentCall.id !== lastCalledId) {
              setLastCalledId(currentCall.id);
              if (audioEnabled) {
                playChime();
              }
            }
          }
        }
      } catch (err) {
        // Silent error
      }

      if (!isSyncedWithServer && active) {
        const saved = localStorage.getItem('sgfce_senhas');
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as SenhaAtendimento[];
            setSenhas(parsed);
            
            // Detect if a ticket status transition to "Chamando" happened to play chime
            const currentCall = parsed.find(s => s.status === 'Chamando');
            if (currentCall && currentCall.id !== lastCalledId) {
              setLastCalledId(currentCall.id);
              if (audioEnabled) {
                playChime();
              }
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    };

    // Initial load
    loadState();

    // Listen to changes in other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sgfce_senhas' && active) {
        const saved = localStorage.getItem('sgfce_senhas');
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as SenhaAtendimento[];
            setSenhas(parsed);
            
            const currentCall = parsed.find(s => s.status === 'Chamando');
            if (currentCall && currentCall.id !== lastCalledId) {
              setLastCalledId(currentCall.id);
              if (audioEnabled) {
                playChime();
              }
            }
          } catch (err) {
            console.error(err);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Remote active synchronization via Express API short-poll (every 1.5s)
    const backupInterval = setInterval(loadState, 1500);

    return () => {
      active = false;
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(backupInterval);
    };
  }, [audioEnabled, lastCalledId]);

  // Update clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
      setCurrentDateShort(now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Web Audio API Synthesizer dual-tone chime (din-don)
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Sound 1 (High note)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gain1.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      
      // Sound 2 (Lower harmonic note)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(440.00, audioCtx.currentTime + 0.22); // A4
      gain2.gain.setValueAtTime(0.0, audioCtx.currentTime);
      gain2.gain.setValueAtTime(0.2, audioCtx.currentTime + 0.22);
      gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      
      osc1.start(audioCtx.currentTime);
      osc1.stop(audioCtx.currentTime + 0.8);
      
      osc2.start(audioCtx.currentTime + 0.22);
      osc2.stop(audioCtx.currentTime + 1.2);
    } catch (e) {
      console.warn("Flipped audio error during synthetic play: ", e);
    }
  };

  const currentCalling = senhas.find(s => s.status === 'Chamando');
  const activeAtendimentos = senhas.filter(s => s.status === 'Em Atendimento');
  
  // Previous called history candidates
  const calledHistory = senhas
    .filter(s => s.status === 'Concluido' || s.status === 'Em Atendimento' || s.status === 'Chamando')
    .sort((a, b) => (b.timestampChamada || 0) - (a.timestampChamada || 0))
    // Exclude the one currently blinking if there is one
    .filter(s => currentCalling ? s.id !== currentCalling.id : true)
    .slice(0, 4);

  return (
    <div className="fixed inset-0 bg-[#0f172a] text-white flex flex-col font-sans select-none overflow-hidden z-50">
      
      {/* Top Banner Header */}
      <header className="bg-[#1e293b] border-b border-slate-800 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-fuchsia-600 flex items-center justify-center shadow-lg shrink-0">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight font-display text-white truncate">
              SGFCE <span className="text-slate-400 font-normal hidden sm:inline">| Painel de Atendimento Digital</span>
            </h1>
            <p className="text-[8px] sm:text-[10px] uppercase font-bold tracking-wider text-indigo-400 truncate">Sociedade de Caridade e Consolo Espiritual</p>
          </div>
        </div>

        {/* Audio enabler widget */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            type="button"
            onClick={() => {
              setAudioEnabled(!audioEnabled);
              if (!audioEnabled) {
                // Instantly play a test sound to capture click interaction permissions
                try {
                  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                  const osc = audioCtx.createOscillator();
                  const gain = audioCtx.createGain();
                  osc.frequency.setValueAtTime(440, audioCtx.currentTime);
                  gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
                  gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
                  osc.connect(gain);
                  gain.connect(audioCtx.destination);
                  osc.start();
                  osc.stop(audioCtx.currentTime + 0.1);
                } catch(e){}
              }
            }}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase transition-all cursor-pointer ${audioEnabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'}`}
          >
            {audioEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 animate-bounce shrink-0" />
                <span>Ativado</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />
                <span className="hidden sm:inline">Ativar Som de Chamada</span>
                <span className="sm:hidden">Ativar Som</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Multi-Column Display Grid */}
      <section id="tv-queue-main" className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 p-4 sm:p-6 h-auto lg:h-[calc(100vh-148px)] overflow-y-auto lg:overflow-hidden">
        
        {/* Left Column: Huge main call card (Takes 7 Cols) */}
        <section className="lg:col-span-7 flex flex-col justify-between bg-slate-900/40 border border-slate-800 rounded-3xl p-4 sm:p-8 shadow-2xl relative">
          
          {currentCalling ? (
            <div className="flex-1 flex flex-col justify-center text-center space-y-4 sm:space-y-6 py-4">
              <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-widest text-indigo-400 font-mono animate-pulse bg-indigo-500/10 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full inline-block mx-auto">
                🔔 ULTIMA SENHA CHAMADA (EM DESTAQUE)
              </span>

              {/* Big blinking password badge */}
              <div className="my-1 sm:my-2 select-none">
                <div className={`text-6xl sm:text-7xl md:text-9xl font-black font-mono tracking-tight rounded-3xl py-6 sm:py-10 px-6 sm:px-8 inline-block shadow-2xl relative animate-pulse outline outline-2 sm:outline-4 outline-offset-2 sm:outline-offset-4 ${currentCalling.tipo === 'Amarela' ? 'bg-[#facc15] outline-[#facc15] text-[#0f172a]' : 'bg-[#3b82f6] text-white outline-[#3b82f6]'}`}>
                  {currentCalling.numero}
                </div>
              </div>

              {/* Visitor metadata */}
              <div className="space-y-1 sm:space-y-2">
                <p className="text-lg sm:text-2xl font-bold tracking-tight text-slate-300">Assistido</p>
                <h2 className="text-xl sm:text-3xl md:text-5xl font-black text-white px-2 tracking-tight block font-display uppercase leading-tight break-words">
                  {currentCalling.visitanteNome}
                </h2>
              </div>

              {/* Destination instruction box */}
              <div className="bg-slate-950/80 border border-indigo-505 p-4 sm:p-6 rounded-2xl max-w-xl mx-auto w-full flex items-center justify-center gap-3">
                <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400 animate-ping shrink-0" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-extrabold text-indigo-400 tracking-widest font-mono">Direcionamento / Destino</p>
                  <p className="text-lg sm:text-2xl md:text-3xl font-black text-white font-display uppercase tracking-tight">{currentCalling.consultorio}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4 py-10 sm:py-20">
              <Clock className="w-16 h-16 sm:w-20 sm:h-20 text-slate-700 animate-spin" style={{ animationDuration: '10s' }} />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-400">Nenhuma Senha Sendo Chamada Agora</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm px-4">Aguardando o coordenador do Atendimento Fraterno acionar o painel para chamar o próximo assistido da fila.</p>
            </div>
          )}

          {/* Prompt on audio if blocked */}
          {!audioEnabled && (
            <div className="relative md:absolute inset-x-0 bottom-2 md:bottom-6 mt-4 md:mt-0 flex justify-center z-20">
              <div className="bg-rose-650/90 text-white text-[10px] sm:text-[11px] font-bold px-3 py-2 sm:px-4 sm:py-2 rounded-xl flex items-center gap-2 shadow-lg animate-bounce max-w-sm text-center">
                <span>⚠️</span>
                <span>CLIQUE em "Ativar Som" para tocar o gongo automático!</span>
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Calls Timeline & Active Rooms (Takes 5 Cols) */}
        <section className="lg:col-span-5 flex flex-col gap-4 sm:gap-6 lg:overflow-hidden">
          
          {/* Subsection 1: Chamadas Recentes (Last calls) */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-4 sm:p-6 flex flex-col lg:flex-1 lg:overflow-hidden">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-3 sm:mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Chamadas Recentes / Painel Geral</span>
            </h3>
 
            <div className="lg:flex-1 lg:overflow-y-auto space-y-3 pr-1">
              {calledHistory.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-xs text-slate-600 py-10">
                  Nenhum histórico recente disponível.
                </div>
              ) : (
                calledHistory.map((hist) => (
                  <div 
                    key={hist.id} 
                    className="bg-[#1e293b]/60 border border-slate-800 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between transition-all hover:bg-slate-850 gap-2"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      {/* Ticket small indicator */}
                      <span className={`w-12 sm:w-14 py-1.5 sm:py-2 text-center text-xs sm:text-sm font-black font-mono rounded-xl block shrink-0 ${hist.tipo === 'Amarela' ? 'bg-[#facc15] text-[#0f172a]' : 'bg-[#3b82f6] text-white'}`}>
                        {hist.numero}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-100 truncate uppercase max-w-[120px] sm:max-w-[160px]">{hist.visitanteNome}</p>
                        <p className="text-[10px] text-slate-400 font-medium truncate max-w-[120px] sm:max-w-[160px]">{hist.consultorio}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[9.5px] sm:text-[10.5px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 sm:px-2 rounded-full border border-slate-850">
                        {hist.horaGerada}
                      </span>
                      {hist.status === 'Em Atendimento' && (
                        <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-extrabold text-emerald-400 block mt-1 animate-pulse">
                          ● Atendendo
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
 
          {/* Subsection 2: Atendimentos em Andamento (Active) */}
          <div className="bg-[#1e293b]/40 border border-slate-800 rounded-3xl p-4 sm:p-6 h-auto sm:h-48 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-2">
                <AppWindow className="w-4 h-4 text-emerald-400" />
                <span>Salas em Atendimento</span>
              </h3>
              <span className="text-[9px] sm:text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                {activeAtendimentos.length} Ativos
              </span>
            </div>
 
            <div className="flex-1 lg:overflow-y-auto space-y-2 pr-1 text-xs max-h-40 overflow-y-auto">
              {activeAtendimentos.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-[11px] py-4">
                  Nenhum consultório ativo no momento.
                </div>
              ) : (
                activeAtendimentos.map((act) => (
                  <div key={act.id} className="flex justify-between items-center bg-[#0f172a]/40 p-2 sm:p-2.5 rounded-xl border border-slate-850 gap-2">
                    <span className="font-bold text-indigo-400 uppercase truncate max-w-[120px] sm:max-w-[140px]">{act.consultorio}</span>
                    <span className="text-slate-300 font-medium truncate max-w-[110px] sm:max-w-[125px]">{act.visitanteNome}</span>
                    <span className={`font-mono text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.2 rounded font-bold shrink-0 ${act.tipo === 'Amarela' ? 'bg-[#facc15]/10 text-[#facc15]' : 'bg-[#3b82f6]/10 text-[#3b82f6]'}`}>{act.numero}</span>
                  </div>
                ))
              )}
            </div>
          </div>
 
        </section>
      </section>
 
      {/* Persistent Footer Ticker Belt */}
      <footer className="h-14 sm:h-16 bg-[#1e293b] border-t border-slate-800 px-4 sm:px-6 flex items-center justify-between text-xs font-mono text-slate-400 z-10 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="capitalize font-semibold text-slate-300 truncate hidden sm:inline">{currentDate}</span>
          <span className="capitalize font-semibold text-slate-300 truncate inline sm:hidden">{currentDateShort}</span>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <Clock className="w-4 h-4 text-indigo-400 ml-1 shrink-0" />
          <span className="text-white font-bold text-xs sm:text-sm tracking-wide sm:tracking-widest">{currentTime}</span>
        </div>
 
        {/* Message ticker */}
        <div className="hidden md:block flex-1 max-w-lg mx-6 text-center text-[10.5px] italic text-slate-500 truncate">
          "Fora da caridade não há salvação - Pratique e receba o passe em união harmônica."
        </div>
 
        <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-wider shrink-0">
          <span className="hidden sm:inline">● Conexão Segura Ativa</span>
          <span className="sm:hidden">● Ativa</span>
        </div>
      </footer>

    </div>
  );
}
