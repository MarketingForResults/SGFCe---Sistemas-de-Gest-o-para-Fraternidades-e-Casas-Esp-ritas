import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Megaphone, 
  AlertCircle, 
  Users, 
  ChevronRight, 
  Plus, 
  MessageCircle, 
  Clock, 
  Tag, 
  User,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  Colaborador, 
  MensagemDireta, 
  ForumTopic, 
  ForumReply, 
  ComunicadoGeral, 
  ForumCategory 
} from '../types';

interface CommunicationsPanelProps {
  currentUser: { name: string; email: string; role: string; isAdmin: boolean };
  colaboradores: Colaborador[];
  mensagens: MensagemDireta[];
  topicos: ForumTopic[];
  respostas: ForumReply[];
  comunicados: ComunicadoGeral[];
  onAddMensagem: (msg: Omit<MensagemDireta, 'id' | 'timestamp' | 'senderId' | 'senderName'>) => void;
  onAddTopico: (topico: Omit<ForumTopic, 'id' | 'createdAt' | 'authorName' | 'authorEmail'>) => void;
  onAddResposta: (reply: Omit<ForumReply, 'id' | 'createdAt' | 'authorName' | 'authorEmail'>) => void;
  onAddComunicado: (com: Omit<ComunicadoGeral, 'id' | 'createdAt' | 'authorName'>) => void;
  onDeleteComunicado?: (id: string) => void;
}

export default function CommunicationsPanel({
  currentUser,
  colaboradores,
  mensagens,
  topicos,
  respostas,
  comunicados,
  onAddMensagem,
  onAddTopico,
  onAddResposta,
  onAddComunicado,
  onDeleteComunicado
}: CommunicationsPanelProps) {
  const [subTab, setSubTab] = useState<'direct' | 'forum' | 'announcements'>('direct');
  
  // Direct Messages state
  const [selectedColab, setSelectedColab] = useState<Colaborador | null>(
    colaboradores.find(c => c.email !== currentUser.email) || null
  );
  const [typedMessage, setTypedMessage] = useState('');

  // Forum state
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(topicos[0] || null);
  const [selectedCategory, setSelectedCategory] = useState<ForumCategory | 'Todos'>('Todos');
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [newTopicCat, setNewTopicCat] = useState<ForumCategory>('Geral');
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [typedReply, setTypedReply] = useState('');

  // Announcement state
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnImportant, setNewAnnImportant] = useState(false);
  const [isCreatingAnn, setIsCreatingAnn] = useState(false);

  // Filter out current user from message partner selection
  const otherColaboradores = colaboradores.filter(c => c.email !== currentUser.email && c.active);

  // Filter messages between currentUser and selectedColab
  const currentChatMessages = mensagens.filter(
    m => 
      selectedColab && (
        (m.senderId === currentUser.email && m.receiverId === selectedColab.email) ||
        (m.senderId === selectedColab.email && m.receiverId === currentUser.email)
      )
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Forum filter
  const filteredTopics = selectedCategory === 'Todos' 
    ? topicos 
    : topicos.filter(t => t.category === selectedCategory);

  const topicCountByCategory = (cat: ForumCategory) => {
    return topicos.filter(t => t.category === cat).length;
  };

  // Submit direct message
  const handleSendDM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !selectedColab) return;

    onAddMensagem({
      receiverId: selectedColab.email,
      receiverName: selectedColab.name,
      content: typedMessage.trim()
    });
    setTypedMessage('');
  };

  // Submit new topic
  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicDesc.trim()) return;

    onAddTopico({
      title: newTopicTitle.trim(),
      description: newTopicDesc.trim(),
      category: newTopicCat
    });

    setNewTopicTitle('');
    setNewTopicDesc('');
    setIsCreatingTopic(false);
  };

  // Submit forum reply
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedReply.trim() || !selectedTopic) return;

    onAddResposta({
      topicId: selectedTopic.id,
      content: typedReply.trim()
    });
    setTypedReply('');
  };

  // Submit announcement
  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return;

    onAddComunicado({
      title: newAnnTitle.trim(),
      content: newAnnContent.trim(),
      important: newAnnImportant
    });

    setNewAnnTitle('');
    setNewAnnContent('');
    setNewAnnImportant(false);
    setIsCreatingAnn(false);
  };

  const getCategoryColor = (cat: ForumCategory) => {
    switch (cat) {
      case 'Doutrina': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Assistência Social': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Sopa Fraterna': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Mediunidade': return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200';
      case 'Administração': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual Header Grid */}
      <div className="bg-white border border-slate-205 p-6 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-850 tracking-tight font-display">
              Comunicação Interna Fraterna
            </h2>
            <p className="text-xs text-slate-600 max-w-xl font-normal leading-relaxed">
              Troque mensagens diretas com outros trabalhadores do bem, debata tópicos espirituais e administrativos por fóruns ou acompanhe comunicados gerais importantes.
            </p>
          </div>

          {/* Tab Selection Toggles */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start md:self-auto">
            <button
              onClick={() => setSubTab('direct')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${subTab === 'direct' ? 'bg-white text-indigo-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-800'}`}
            >
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Mensagens Diretas</span>
              </div>
            </button>
            <button
              onClick={() => setSubTab('forum')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${subTab === 'forum' ? 'bg-white text-indigo-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-800'}`}
            >
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Fórum Espírita</span>
              </div>
            </button>
            <button
              onClick={() => setSubTab('announcements')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${subTab === 'announcements' ? 'bg-white text-indigo-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-800'}`}
            >
              <div className="flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5" />
                <span>Comunicados</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* SUB PANELS */}
      {subTab === 'direct' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-slate-205 rounded-3xl overflow-hidden min-h-[500px]">
          
          {/* Active Contacts Sidebar */}
          <div className="lg:col-span-4 border-r border-slate-200 bg-slate-50 p-4 space-y-4">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Trabalhadores Ativos ({otherColaboradores.length})</span>
            <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
              {otherColaboradores.map((colab) => {
                const isSelected = selectedColab?.id === colab.id;
                // Count unread helper if desired, but we can display clean rows
                return (
                  <button
                    key={colab.id}
                    onClick={() => setSelectedColab(colab)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all text-xs cursor-pointer ${isSelected ? 'bg-white shadow-sm border border-slate-200/80 font-semibold text-slate-900 ring-2 ring-indigo-500/10' : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent'}`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                        {colab.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-bold text-slate-800 truncate">{colab.name}</h5>
                        <p className="text-[10px] text-slate-500 truncate">{colab.cargo}</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 text-slate-400 shrink-0 ${isSelected ? 'opacity-100 translate-x-0.5' : 'opacity-40'}`} />
                  </button>
                );
              })}
            </div>
            
            <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-[11px] text-indigo-900 font-medium flex items-center gap-2.5">
              <span className="text-base">🤝</span>
              <span>Conecte-se em tempo real para delegar ou organizar as frentes de auxílio da Sede.</span>
            </div>
          </div>

          {/* Actual Chat Windows Area */}
          <div className="lg:col-span-8 flex flex-col justify-between h-[500px]">
            {selectedColab ? (
              <>
                {/* Header info */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-xs">
                      {selectedColab.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{selectedColab.name}</h4>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" />
                        <span className="text-[10px] text-slate-500 font-semibold">{selectedColab.cargo} • Contato Disponível</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200/50 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">{selectedColab.email}</span>
                </div>

                {/* Messages body scrolling container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/10">
                  {currentChatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
                      <MessageSquare className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                      <p className="text-xs font-medium text-slate-500">Início de conversa segura e fraterna.</p>
                      <p className="text-[10px] text-slate-400">Envie uma mensagem edificante para iniciar o contato espiritual de trabalho.</p>
                    </div>
                  ) : (
                    currentChatMessages.map((msg) => {
                      const isMe = msg.senderId === currentUser.email;
                      const msgDate = new Date(msg.timestamp);
                      const displayTime = msgDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                      return (
                        <div 
                          key={msg.id} 
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] space-y-1`}>
                            {/* Visual bubble layout */}
                            <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${isMe ? 'bg-indigo-650 text-white rounded-br-none shadow-sm' : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'}`}>
                              {msg.content}
                            </div>
                            <div className={`text-[9px] text-slate-400 font-mono flex items-center gap-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <span>{isMe ? 'Você' : msg.senderName}</span>
                              <span>•</span>
                              <span>{displayTime}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* MessageBox Input sender */}
                <form onSubmit={handleSendDM} className="p-3 border-t border-slate-100 bg-slate-50/50 flex gap-2">
                  <input
                    id="dm-message-input"
                    type="text"
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    placeholder={`Escreva uma mensagem fraterna para ${selectedColab.name.split(' ')[0]}...`}
                    className="flex-1 py-2.5 px-4 text-xs font-sans rounded-xl focus:outline-none"
                    required
                  />
                  <button
                    id="dm-send-btn"
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <Users className="w-10 h-10 text-slate-300 mb-2 stroke-[1.5]" />
                <p className="text-xs font-medium">Nenhum voluntário ativo selecionado.</p>
                <p className="text-[10.5px]">Selecione um tarefeiro na barra lateral para carregar a conversa.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {subTab === 'forum' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Forums Categories and Topic Titles Column */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Quick stats categories */}
            <div className="bg-white border border-slate-205 p-4 rounded-3xl space-y-3.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Tópicos por Departamento</span>
                <button
                  onClick={() => {
                    setIsCreatingTopic(true);
                    setSelectedTopic(null);
                  }}
                  className="p-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>Novo Tópico</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedCategory('Todos')}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all border cursor-pointer ${selectedCategory === 'Todos' ? 'bg-indigo-600 text-white border-indigo-650' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                >
                  Expandir Todos ({topicos.length})
                </button>
                {(['Doutrina', 'Assistência Social', 'Sopa Fraterna', 'Mediunidade', 'Administração', 'Geral'] as ForumCategory[]).map((cat) => {
                  const isSelected = selectedCategory === cat;
                  const count = topicCountByCategory(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all border cursor-pointer ${isSelected ? 'bg-indigo-600 text-white border-indigo-650' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* List of filtered topics */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto">
              {filteredTopics.length === 0 ? (
                <div className="bg-white border border-slate-205 rounded-3xl p-6 text-center text-slate-400 text-xs">
                  Nenhum tópico ativo nesta categoria. Seja o primeiro a iniciar a pauta!
                </div>
              ) : (
                filteredTopics.map((top) => {
                  const isSelected = selectedTopic?.id === top.id && !isCreatingTopic;
                  const repliesCount = respostas.filter(r => r.topicId === top.id).length;
                  const formattedDate = new Date(top.createdAt).toLocaleDateString('pt-BR');

                  return (
                    <button
                      key={top.id}
                      onClick={() => {
                        setSelectedTopic(top);
                        setIsCreatingTopic(false);
                      }}
                      className={`w-full bg-white border p-4 rounded-2xl text-left transition-all relative ${isSelected ? 'border-indigo-500 shadow-sm ring-2 ring-indigo-550/10' : 'border-slate-205 hover:border-slate-300'}`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className={`text-[9px] font-bold border px-1.5 py-0.2 rounded-md ${getCategoryColor(top.category)}`}>
                            {top.category}
                          </span>
                          <span className="text-[9.5px] text-slate-400 font-mono font-semibold">{formattedDate}</span>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{top.title}</h4>
                          <p className="text-[11px] text-slate-550 line-clamp-1 mt-0.5">{top.description}</p>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-100/60 font-medium">
                          <span className="truncate max-w-[150px]">Ator: <strong>{top.authorName}</strong></span>
                          <span className="flex items-center gap-1 text-slate-600 font-mono font-bold bg-slate-50 px-1.5 py-0.5 rounded-md">
                            <MessageCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            {repliesCount} {repliesCount === 1 ? 'resposta' : 'respostas'}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

          </div>

          {/* Interactive Topic Thread Detail or Create New Forum Topic Screen */}
          <div className="lg:col-span-7">
            {isCreatingTopic ? (
              <div className="bg-white border border-slate-205 rounded-3xl p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-bold uppercase text-slate-550 tracking-wider">Lançar Nova Discussão Coletiva</h4>
                  <button
                    onClick={() => setIsCreatingTopic(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                  >
                    Cancelar
                  </button>
                </div>

                <form onSubmit={handleCreateTopic} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-650 mb-1 font-display">Título do Tópico</label>
                    <input
                      id="topic-title-input"
                      type="text"
                      value={newTopicTitle}
                      onChange={(e) => setNewTopicTitle(e.target.value)}
                      placeholder="Ex: Novo cronograma das Doutrinárias Virtuais"
                      className="w-full text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-655 mb-1 font-display">Categoria/Departamento</label>
                      <select
                        id="topic-category-select"
                        value={newTopicCat}
                        onChange={(e) => setNewTopicCat(e.target.value as ForumCategory)}
                        className="w-full text-xs"
                      >
                        <option value="Doutrina">Doutrina Espírita</option>
                        <option value="Assistência Social">Assistência Social</option>
                        <option value="Sopa Fraterna">Sopa Fraterna</option>
                        <option value="Mediunidade">Mediunidade</option>
                        <option value="Administração">Administração</option>
                        <option value="Geral">Assuntos Gerais</option>
                      </select>
                    </div>
                    <div className="flex items-end text-[10px] text-slate-400 pb-3 leading-tight">
                      <span>Este tópico ficará visível de imediato para todos os tarefeiros credenciados na plataforma.</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-650 mb-1 font-display">O que deseja discutir? (Pauta Detalhada)</label>
                    <textarea
                      id="topic-desc-input"
                      rows={4}
                      value={newTopicDesc}
                      onChange={(e) => setNewTopicDesc(e.target.value)}
                      placeholder="Descreva aqui o assunto de forma amorosa e coordenada para colher retorno..."
                      className="w-full text-xs"
                      required
                    />
                  </div>

                  <button
                    id="topic-submit-btn"
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-md mt-2 cursor-pointer"
                  >
                    Lançar Tópico no Painel
                  </button>
                </form>
              </div>
            ) : selectedTopic ? (
              <div className="bg-white border border-slate-205 rounded-3xl p-5 space-y-4 shadow-sm h-full flex flex-col justify-between min-h-[460px]">
                
                {/* Topic Header details */}
                <div className="space-y-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-bold border px-1.5 py-0.2 rounded-md ${getCategoryColor(selectedTopic.category)}`}>
                      {selectedTopic.category}
                    </span>
                    <span className="text-[10px] text-slate-450 font-mono font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Lançado: {new Date(selectedTopic.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-850">{selectedTopic.title}</h3>
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-1 whitespace-pre-wrap">{selectedTopic.description}</p>
                  </div>
                  
                  <div className="text-[10.5px] text-slate-500 font-medium bg-slate-50 p-2.5 rounded-xl flex items-center gap-2 border border-slate-200/50">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] text-indigo-700 font-bold">
                      {selectedTopic.authorName.charAt(0)}
                    </div>
                    <span>Proposto por <strong>{selectedTopic.authorName}</strong> ({selectedTopic.authorEmail})</span>
                  </div>
                </div>

                {/* Sub Replies Threads List */}
                <div className="flex-1 overflow-y-auto max-h-[220px] p-2 space-y-3 my-2 scrollbar-style">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">Respostas Fraternas</span>
                  {respostas.filter(r => r.topicId === selectedTopic.id).length === 0 ? (
                    <div className="p-4 bg-slate-50/50 border border-slate-150 rounded-xl text-center text-slate-400 text-[11px]">
                      Ainda não há respostas para esta discussão. Seja o primeiro a opinar!
                    </div>
                  ) : (
                    respostas.filter(r => r.topicId === selectedTopic.id).map((rep) => (
                      <div key={rep.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <strong className="text-slate-700">{rep.authorName} <span className="text-[9px] font-normal text-slate-400">({rep.authorEmail})</span></strong>
                          <span className="text-[9px] text-slate-400 font-mono font-bold">{new Date(rep.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <p className="text-[11px] text-slate-655 leading-relaxed font-sans">{rep.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Reply Form Input */}
                <form onSubmit={handleSendReply} className="border-t border-slate-100 pt-3 flex gap-2">
                  <input
                    id="reply-content-input"
                    type="text"
                    value={typedReply}
                    onChange={(e) => setTypedReply(e.target.value)}
                    placeholder="Escreva sua opinião com moderação e amor..."
                    className="flex-1 text-xs py-2.5 px-3.5"
                    required
                  />
                  <button
                    id="reply-submit-btn"
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

              </div>
            ) : (
              <div className="bg-white border border-slate-205 rounded-3xl p-8 text-center text-slate-400 min-h-[300px] flex flex-col items-center justify-center">
                <Users className="w-10 h-10 text-slate-300 stroke-[1.5] mb-2" />
                <p className="text-xs font-semibold text-slate-500">Nenhum tópico selecionado.</p>
                <p className="text-[11px] text-slate-400 mt-1">Selecione uma pauta na listagem à esquerda ou as filtre por departamento para contribuir espiritual ou tecnicamente com a Sede.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {subTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Post New Announcement Sidebar - Only for Admins or authorized */}
          <div className="lg:col-span-4 bg-white border border-slate-205 p-5 rounded-3xl space-y-4">
            <h4 className="text-xs font-bold uppercase text-slate-550 tracking-wider">Gestão do Canal de Avisos</h4>
            <div className="text-[11px] text-slate-550 leading-relaxed font-sans space-y-2">
              <p>Somente administradores ou a presidência podem enviar **Comunicados Gerais** que disparam notificações globais no cabeçalho e constam no painel permanente de avisos importantes.</p>
              <div>• Usuário atual: <strong className="text-indigo-650">{currentUser.name}</strong></div>
              <div>• Nível: <span className="bg-indigo-50 px-1 py-0.2 rounded border border-indigo-200 text-indigo-700 font-semibold text-[9.5px] font-sans">{currentUser.role}</span></div>
            </div>

            {currentUser.isAdmin ? (
              <button
                onClick={() => setIsCreatingAnn(!isCreatingAnn)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{isCreatingAnn ? 'Ver Lista de Avisos' : 'Publicar Comunicado'}</span>
              </button>
            ) : (
              <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 text-[10.5px] text-amber-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Seu nível de acesso limita a postagem de comunicados oficiais. Entre em contato com a Sede para novos avisos.</span>
              </div>
            )}

            <div className="bg-indigo-50/50 rounded-2xl p-3 border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed">
              <span className="font-bold block mb-1">📢 Dica de Harmonização:</span>
              Mantenha o tom dos editais sempre acolhedor, transparente e motivador de forma a expandir as vibrações positivas de ajuda mútua.
            </div>
          </div>

          {/* List of active official announcements or Creation form */}
          <div className="lg:col-span-8">
            {isCreatingAnn ? (
              <div className="bg-white border border-slate-205 rounded-3xl p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-bold uppercase text-slate-550 tracking-wider">Escrever Comunicado Oficial à Congregação</h4>
                  <button
                    onClick={() => setIsCreatingAnn(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                  >
                    Voltar
                  </button>
                </div>

                <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-650 mb-1 font-display">Assunto ou Título Principal</label>
                    <input
                      id="ann-title-input"
                      type="text"
                      value={newAnnTitle}
                      onChange={(e) => setNewAnnTitle(e.target.value)}
                      placeholder="Ex: Alerta de Reescalonamento para Plantonistas"
                      className="w-full text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-655 mb-1 font-display">Conteúdo do Aviso (Oficial)</label>
                    <textarea
                      id="ann-content-input"
                      rows={5}
                      value={newAnnContent}
                      onChange={(e) => setNewAnnContent(e.target.value)}
                      placeholder="Insira as diretrizes oficiais..."
                      className="w-full text-xs"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <input
                      type="checkbox"
                      id="ann-important-cb"
                      checked={newAnnImportant}
                      onChange={(e) => setNewAnnImportant(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-650 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="ann-important-cb" className="text-xs text-slate-750 font-semibold cursor-pointer">
                      Marcar como Importante / Urgente 🚨 (Coloca bordas vermelhas e destaque no painel)
                    </label>
                  </div>

                  <button
                    id="ann-submit-btn"
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-750 text-white font-semibold text-xs py-3 rounded-xl shadow-md cursor-pointer hover:opacity-95 transition-all"
                  >
                    Disparar Comunicado Geral para Membros
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Quadro de Avisos Ativos ({comunicados.length})</span>
                {comunicados.length === 0 ? (
                  <div className="bg-white border border-slate-205 rounded-3xl p-8 text-center text-slate-400 text-xs">
                    Nenhum comunicado oficial registrado até o momento.
                  </div>
                ) : (
                  comunicados.map((com) => {
                    const comDate = new Date(com.createdAt).toLocaleDateString('pt-BR');
                    return (
                      <div 
                        key={com.id} 
                        className={`bg-white border rounded-3xl p-5 relative overflow-hidden transition-all shadow-sm ${com.important ? 'border-red-200 ring-2 ring-red-500/5' : 'border-slate-205 hover:border-slate-300'}`}
                      >
                        {com.important && (
                          <div className="absolute top-0 left-0 w-2 h-full bg-red-650" />
                        )}
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex items-center gap-2">
                              {com.important ? (
                                <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  ATENÇÃO GERAL
                                </span>
                              ) : (
                                <span className="bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                  Aviso Geral
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono font-semibold">{comDate}</span>
                          </div>

                          <div>
                            <h4 className="text-sm font-extrabold text-slate-800 leading-tight">{com.title}</h4>
                            <p className="text-xs text-slate-655 leading-relaxed mt-2 whitespace-pre-wrap">{com.content}</p>
                          </div>

                          <div className="flex justify-between items-center text-[10.5px] text-slate-500 pt-3 border-t border-slate-100 font-medium">
                            <span>Publicado por: <strong>{com.authorName}</strong></span>
                            {currentUser.isAdmin && onDeleteComunicado && (
                              <button
                                onClick={() => onDeleteComunicado(com.id)}
                                className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Excluir Aviso</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
