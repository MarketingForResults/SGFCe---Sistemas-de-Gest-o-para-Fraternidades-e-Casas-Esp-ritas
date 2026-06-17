import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  Bell, 
  CheckCircle,
  AlertCircle,
  Trash2,
  CalendarDays
} from 'lucide-react';
import { motion } from 'motion/react';
import { EventoAgenda } from '../types';

interface EventsPanelProps {
  currentUser: { name: string; email: string; role: string; isAdmin: boolean };
  eventos: EventoAgenda[];
  onAddEvento: (ev: Omit<EventoAgenda, 'id' | 'createdByName' | 'createdByEmail'>) => void;
  onDeleteEvento?: (id: string) => void;
}

export default function EventsPanel({
  currentUser,
  eventos,
  onAddEvento,
  onDeleteEvento
}: EventsPanelProps) {
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todos');
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventoAgenda['category']>('Palestra');

  // Verify authorization: admins or Presidente, Vice-Presidente, Conselheiro are authorized
  const isAuthorizedToCreate = currentUser.isAdmin || 
    ['Presidente', 'Vice-Presidente', 'Conselheiro', 'Voluntário'].includes(currentUser.role);

  // Calculate upcoming events in next 7 days for notifications
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  const notifications = eventos.filter(ev => {
    const evDate = new Date(`${ev.date}T12:00:00`); // general noon fallback to evade timezone flips
    return evDate >= today && evDate <= nextWeek;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Filter events list
  const filteredEvents = eventos.filter(ev => {
    const matchSearch = ev.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      ev.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchCat = categoryFilter === 'Todos' || ev.category === categoryFilter;

    return matchSearch && matchCat;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !time || !location.trim() || !description.trim()) return;

    onAddEvento({
      title: title.trim(),
      date,
      time,
      location: location.trim(),
      description: description.trim(),
      category
    });

    // Reset Form
    setTitle('');
    setDate('');
    setTime('');
    setLocation('');
    setDescription('');
    setCategory('Palestra');
    setIsCreatingEvent(false);
  };

  const getCategoryBadge = (cat: EventoAgenda['category']) => {
    switch (cat) {
      case 'Palestra': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Tratamento/Passe': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Bazar/Ação Social': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Reunião de Estudos': return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200';
      case 'Sopa Fraterna': return 'bg-teal-50 text-teal-700 border-teal-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Visual Header and Notification Center */}
      <div className="bg-white border border-slate-205 p-6 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-850 tracking-tight font-display">
              Agenda & Eventos da Sede
            </h2>
            <p className="text-xs text-slate-600 max-w-xl font-normal leading-relaxed">
              Consulte frentes assistenciais, reuniões de passes, palestras e estudos. Receba alertas automáticos de compromissos que necessitam do seu auxílio tarefeiro nesta semana.
            </p>
          </div>

          <div className="flex gap-2">
            {isAuthorizedToCreate && (
              <button
                id="toggle-add-event-btn"
                onClick={() => setIsCreatingEvent(!isCreatingEvent)}
                className="py-2.5 px-4 bg-indigo-650 hover:bg-indigo-750 text-white font-semibold text-xs rounded-xl flex items-center gap-1 shadow-md cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{isCreatingEvent ? 'Ver Toda a Agenda' : 'Organizar Novo Evento'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications Bar (Alert of future events in next 7 days) */}
      {notifications.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex gap-3">
          <div className="p-2 bg-indigo-100 rounded-xl text-indigo-700 self-start">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div className="space-y-1.5 flex-1">
            <strong className="text-xs text-indigo-900 font-extrabold flex items-center gap-1.5">
              <span>🔔 Próximos Eventos em Destaque (7 Dias)</span>
              <span className="text-[10px] bg-indigo-200 text-indigo-800 px-2 py-0.2 rounded-full font-bold">
                {notifications.length} {notifications.length === 1 ? 'evento em breve' : 'eventos em breve'}
              </span>
            </strong>
            <p className="text-[11px] text-indigo-700">Auxilie nossa casa nas vibrações corporativas. Os seguintes encontros acontecem essa semana:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-2">
              {notifications.map((notif) => {
                const formattedNotifDate = new Date(notif.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
                return (
                  <div key={notif.id} className="bg-white border border-indigo-150/60 p-2.5 px-3 rounded-xl flex items-center justify-between text-xs font-medium">
                    <div className="truncate pr-2">
                      <h5 className="font-bold text-slate-800 truncate">{notif.title}</h5>
                      <span className="text-[10.5px] text-slate-500 font-semibold">{notif.location}</span>
                    </div>
                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold shrink-0">
                      {formattedNotifDate} às {notif.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Primary Layout Block */}
      {isCreatingEvent ? (
        <div className="bg-white border border-slate-205 p-6 rounded-3xl space-y-4 shadow-sm max-w-2xl mx-auto">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold uppercase text-slate-550 tracking-wider">Agendar Novo Evento ou Atividade</h3>
            <button
              onClick={() => setIsCreatingEvent(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-650 mb-1 font-display">Nome do Evento / Atividade</label>
                <input
                  id="event-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Reunião do Bazar Beneficente Ampliado"
                  className="w-full text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-650 mb-1 font-display">Data</label>
                <input
                  id="event-date-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-650 mb-1 font-display">Horário de Início</label>
                <input
                  id="event-time-input"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-650 mb-1 font-display">Localização / Sala</label>
                <input
                  id="event-location-input"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Sala de Passes 02 / Salão Principal"
                  className="w-full text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-655 mb-1 font-display">Categoria</label>
                <select
                  id="event-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EventoAgenda['category'])}
                  className="w-full text-xs"
                >
                  <option value="Palestra">Palestra Pública / Geral</option>
                  <option value="Tratamento/Passe">Sessão de Passes e Fluidoterapia</option>
                  <option value="Bazar/Ação Social">Bazar ou Ações de Arrecadação</option>
                  <option value="Reunião de Estudos">Reunião de Estudos Doutrinários</option>
                  <option value="Sopa Fraterna">Preparo ou Entrega de Sopa Fraterna</option>
                  <option value="Outros">Outras Pautas</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-650 mb-1 font-display">Descrição Concisa (Instruções e Tarefeiros convocados)</label>
              <textarea
                id="event-desc-input"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Insira detalhes como material necessário e objetivos espirituais..."
                className="w-full text-xs"
                required
              />
            </div>

            <button
              id="event-submit-btn"
              type="submit"
              className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-md mt-2 cursor-pointer"
            >
              Confirmar e Publicar Evento na Grade
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Quick Filters Header */}
          <div className="bg-white border border-slate-205 p-4 rounded-3xl flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
            
            {/* Search Input */}
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                id="event-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por título ou sala..."
                className="w-full text-xs pl-10"
              />
            </div>

            {/* Category Select Filters */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 overflow-x-auto w-full md:w-auto">
              {['Todos', 'Palestra', 'Tratamento/Passe', 'Bazar/Ação Social', 'Reunião de Estudos', 'Sopa Fraterna'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 text-[10.5px] font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${categoryFilter === cat ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-650 hover:text-slate-900'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout of Active Events */}
          {filteredEvents.length === 0 ? (
            <div className="bg-white border border-slate-205 rounded-3xl p-12 text-center text-slate-400 space-y-2">
              <CalendarDays className="w-10 h-10 text-slate-350 mx-auto stroke-[1.5]" />
              <p className="text-xs font-semibold text-slate-500">Nenhum evento localizado com os filtros inseridos.</p>
              <p className="text-[10.5px]">Seja o responsável por impulsionar novas atividades registrando-as no painel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((ev) => {
                const eventDay = new Date(ev.date + 'T12:00:00');
                const formattedDate = eventDay.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
                const weekday = eventDay.toLocaleDateString('pt-BR', { weekday: 'long' });

                return (
                  <div 
                    key={ev.id} 
                    className="bg-white border border-slate-205 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3.5">
                      
                      {/* Badge and Title info */}
                      <div className="flex justify-between items-center">
                        <span className={`text-[9.5px] font-bold border px-2 py-0.5 rounded-full ${getCategoryBadge(ev.category)}`}>
                          {ev.category}
                        </span>
                        
                        {/* Event Date badge visual */}
                        <div className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-650 shrink-0" />
                          <span>{ev.date.split('-')[2]}/{ev.date.split('-')[1]}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-extrabold text-slate-800 tracking-tight line-clamp-1">{ev.title}</h4>
                        <p className="text-[10.5px] uppercase tracking-wide text-indigo-600 font-bold font-display">{weekday}</p>
                        <p className="text-[11px] text-slate-550 leading-relaxed font-sans line-clamp-3 pt-0.5">{ev.description}</p>
                      </div>

                      {/* Location and time tags list */}
                      <div className="space-y-2 pt-3 border-t border-slate-100/60">
                        <div className="flex items-center gap-2 text-[10.5px] text-slate-655 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Horário: <strong>{ev.time}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-[10.5px] text-slate-655 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">Local: <strong>{ev.location}</strong></span>
                        </div>
                      </div>

                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100/60 text-[10px] text-slate-450 font-medium font-mono">
                      <span className="truncate">Criador: {ev.createdByName.split(' ')[0]}</span>
                      {currentUser.isAdmin && onDeleteEvento && (
                        <button
                          onClick={() => onDeleteEvento(ev.id)}
                          className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer font-sans"
                        >
                          <Trash2 className="w-3.5 h-3.5 font-sans" />
                          <span>Excluir</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
