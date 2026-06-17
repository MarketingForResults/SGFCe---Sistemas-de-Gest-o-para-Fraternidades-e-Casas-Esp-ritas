import React, { useState } from 'react';
import { 
  UserPlus, 
  Search, 
  MapPin, 
  Calendar, 
  Phone, 
  Mail, 
  PlusCircle, 
  Clipboard, 
  Trash2,
  X,
  FileCheck,
  Zap,
  Edit2,
  FileText,
  Printer,
  Save,
  Plus
} from 'lucide-react';
import { Visitante, ProntuarioInicial } from '../types';

interface VisitantesPanelProps {
  visitantes: Visitante[];
  onAddVisitante: (visitante: Omit<Visitante, 'id'>) => void;
  onUpdateVisitante: (visitante: Visitante) => void;
  onDeleteVisitante: (id: string) => void;
  onSelectVisitanteForAtendimento: (id: string, nome: string) => void;
}

const POPULAR_CEPS: Record<string, { endereco: string; bairro: string; cidade: string; estado: string }> = {
  '01310100': { endereco: 'Avenida Paulista', bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP' },
  '01310-100': { endereco: 'Avenida Paulista', bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP' },
  '20040002': { endereco: 'Avenida Rio Branco', bairro: 'Centro', cidade: 'Rio de Janeiro', estado: 'RJ' },
  '20040-002': { endereco: 'Avenida Rio Branco', bairro: 'Centro', cidade: 'Rio de Janeiro', estado: 'RJ' },
  '30140010': { endereco: 'Avenida Getúlio Vargas', bairro: 'Savassi', cidade: 'Belo Horizonte', estado: 'MG' },
  '30140-010': { endereco: 'Avenida Getúlio Vargas', bairro: 'Savassi', cidade: 'Belo Horizonte', estado: 'MG' },
  '40026280': { endereco: 'Rua Chile', bairro: 'Centro', cidade: 'Salvador', estado: 'BA' },
  '40026-280': { endereco: 'Rua Chile', bairro: 'Centro', cidade: 'Salvador', estado: 'BA' },
  '70070600': { endereco: 'SBS Quadra 1', bairro: 'Asa Sul', cidade: 'Brasília', estado: 'DF' },
  '70070-600': { endereco: 'SBS Quadra 1', bairro: 'Asa Sul', cidade: 'Brasília', estado: 'DF' },
  '90010310': { endereco: 'Rua dos Andradas', bairro: 'Centro Histórico', cidade: 'Porto Alegre', estado: 'RS' },
  '90010-310': { endereco: 'Rua dos Andradas', bairro: 'Centro Histórico', cidade: 'Porto Alegre', estado: 'RS' }
};

export default function VisitantesPanel({
  visitantes,
  onAddVisitante,
  onUpdateVisitante,
  onDeleteVisitante,
  onSelectVisitanteForAtendimento
}: VisitantesPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingVisitante, setEditingVisitante] = useState<Visitante | null>(null);
  const [newObservations, setNewObservations] = useState<Record<string, string>>({});

  // Form profile states
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  
  // Address states
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState('');

  // Initial medical spiritual folder prontuario
  const [motivoAtendimento, setMotivoAtendimento] = useState('');
  const [primeiraVisita, setPrimeiraVisita] = useState(true);
  const [observacoesGerais, setObservacoesGerais] = useState('');

  // Real CEP query via ViaCEP (Free, public, no authentication key needed)
  const handleCepBlur = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setLoadingCep(true);
    setCepError('');
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      if (!response.ok) {
        throw new Error('Serviço indisponível');
      }
      const data = await response.json();
      if (data.erro) {
        setCepError('CEP não encontrado. Digite um CEP válido.');
      } else {
        setEndereco(data.logradouro || '');
        setBairro(data.bairro || '');
        setCidade(data.localidade || '');
        setEstado(data.uf || '');
      }
    } catch (e) {
      console.warn('Erro ao buscar ViaCEP, aplicando contingência local:', e);
      // Fallback pre-defined local codes
      const found = POPULAR_CEPS[cleanCep] || POPULAR_CEPS[cep];
      if (found) {
        setEndereco(found.endereco);
        setBairro(found.bairro);
        setCidade(found.cidade);
        setEstado(found.estado);
      } else {
        // Fallback simulate correct zip format with realistic Brazilian local towns
        setEndereco('Rua das Flores do Campo');
        setBairro('Bairro Alvorada Espírita');
        setCidade('Estrela da Luz');
        setEstado('SP');
        setCepError('Endereço preenchido com dados demonstrativos offline.');
      }
    } finally {
      setLoadingCep(false);
    }
  };

  const resetForm = () => {
    setNomeCompleto('');
    setDataNascimento('');
    setEmail('');
    setTelefone('');
    setCep('');
    setEndereco('');
    setNumero('');
    setComplemento('');
    setBairro('');
    setCidade('');
    setEstado('');
    setMotivoAtendimento('');
    setPrimeiraVisita(true);
    setObservacoesGerais('');
    setCepError('');
    setEditingVisitante(null);
    setShowForm(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeCompleto || !dataNascimento || !telefone || !cep) {
      alert('Por favor, preencha todos os campos obrigatórios (Nome, Nascimento, Telefone, CEP).');
      return;
    }

    const prontuario = {
      motivoAtendimento: motivoAtendimento || 'Deseja passar por acolhimento fraterno e obter passes.',
      primeiraVisita,
      dataAbertura: editingVisitante ? editingVisitante.prontuarioInicial.dataAbertura : new Date().toISOString().substring(0, 10),
      observacoesGerais: observacoesGerais || 'Nenhuma observação complementar inserida na ficha.'
    };

    if (editingVisitante) {
      onUpdateVisitante({
        id: editingVisitante.id,
        nomeCompleto,
        dataNascimento,
        email: email || 'visita.anonima@exemplo.com',
        telefone,
        cep,
        endereco: endereco || 'Não especificado',
        numero: numero || 'S/N',
        complemento,
        bairro: bairro || 'Não especificado',
        cidade: cidade || 'Não especificado',
        estado: estado || 'SP',
        prontuarioInicial: prontuario
      });
    } else {
      onAddVisitante({
        nomeCompleto,
        dataNascimento,
        email: email || 'visita.anonima@exemplo.com',
        telefone,
        cep,
        endereco: endereco || 'Não especificado',
        numero: numero || 'S/N',
        complemento,
        bairro: bairro || 'Não especificado',
        cidade: cidade || 'Não especificado',
        estado: estado || 'SP',
        prontuarioInicial: prontuario
      });
    }

    resetForm();
  };

  const handleEditClick = (v: Visitante) => {
    setEditingVisitante(v);
    setNomeCompleto(v.nomeCompleto);
    setDataNascimento(v.dataNascimento);
    setEmail(v.email);
    setTelefone(v.telefone);
    setCep(v.cep);
    setEndereco(v.endereco);
    setNumero(v.numero);
    setComplemento(v.complemento || '');
    setBairro(v.bairro);
    setCidade(v.cidade);
    setEstado(v.estado);
    setMotivoAtendimento(v.prontuarioInicial.motivoAtendimento);
    setPrimeiraVisita(v.prontuarioInicial.primeiraVisita);
    setObservacoesGerais(v.prontuarioInicial.observacoesGerais);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddObservation = (v: Visitante) => {
    const note = newObservations[v.id]?.trim();
    if (!note) return;
    
    const today = new Date().toLocaleDateString('pt-BR');
    const oldNotes = v.prontuarioInicial.observacoesGerais || '';
    const newNotes = oldNotes 
      ? `${oldNotes}\n[${today}]: ${note}`
      : `[${today}]: ${note}`;

    onUpdateVisitante({
      ...v,
      prontuarioInicial: {
        ...v.prontuarioInicial,
        observacoesGerais: newNotes
      }
    });

    // Clear draft field
    setNewObservations(prev => ({ ...prev, [v.id]: '' }));
  };

  const handleExportPDF = (v: Visitante) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const formattedObs = (v.prontuarioInicial.observacoesGerais || 'Nenhuma observação complementar inserida.')
      .split('\n')
      .map(line => `<p style="margin: 6px 0; line-height: 1.5; font-size: 13px; color: #1e293b; font-family: sans-serif; border-bottom: 1px dashed #f1f5f9; padding-bottom: 4px;">${line}</p>`)
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Prontuario_${v.nomeCompleto.replace(/\\s+/g, '_')}</title>
          <style>
            @media print {
              body { margin: 1.2cm; }
              .no-print { display: none !important; }
            }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #1e293b;
              background: #fff;
              padding: 24px;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 16px;
              margin-bottom: 24px;
            }
            .header h1 {
              font-size: 24px;
              margin: 0;
              color: #1e1b4b;
              text-transform: uppercase;
              font-weight: 800;
              letter-spacing: 0.5px;
            }
            .header p {
              margin: 4px 0 0 0;
              font-size: 11px;
              text-transform: uppercase;
              color: #4f46e5;
              font-weight: 700;
              letter-spacing: 1.5px;
            }
            .section-title {
              font-size: 11px;
              background-color: #f8fafc;
              padding: 6px 12px;
              text-transform: uppercase;
              font-weight: 800;
              border-left: 4px solid #4f46e5;
              margin-top: 24px;
              margin-bottom: 12px;
              letter-spacing: 0.8px;
              color: #334155;
            }
            .grid-container {
              display: grid;
              grid-template-columns: repeat(12, 1fr);
              gap: 12px;
              margin-bottom: 16px;
            }
            .grid-col-12 { grid-column: span 12; }
            .grid-col-8 { grid-column: span 8; }
            .grid-col-6 { grid-column: span 6; }
            .grid-col-4 { grid-column: span 4; }
            .grid-col-3 { grid-column: span 3; }
            .grid-col-5 { grid-column: span 5; }
            
            .data-field {
              border-bottom: 1px solid #f1f5f9;
              padding: 6px 0;
            }
            .data-label {
              font-size: 9px;
              text-transform: uppercase;
              color: #64748b;
              font-weight: 700;
              margin-bottom: 2px;
              letter-spacing: 0.3px;
            }
            .data-value {
              font-size: 13px;
              font-weight: 600;
              color: #0f172a;
            }
            .notes-box {
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 16px;
              min-height: 120px;
              margin-top: 10px;
            }
            .badge {
              display: inline-block;
              background: #e0f2fe;
              color: #0369a1;
              font-size: 10px;
              font-weight: bold;
              padding: 4px 10px;
              border-radius: 9999px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .footer-signatures {
              margin-top: 80px;
              display: flex;
              justify-content: space-between;
              gap: 40px;
            }
            .sig-block {
              flex: 1;
              text-align: center;
              border-top: 1px solid #cbd5e1;
              padding-top: 8px;
              font-size: 11px;
              color: #64748b;
            }
            .print-btn {
              background-color: #4f46e5;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 10px;
              font-size: 14px;
              font-weight: bold;
              cursor: pointer;
              margin-bottom: 20px;
              box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
              transition: all 0.15s ease;
            }
            .print-btn:hover {
              background-color: #4338ca;
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: right; margin-bottom: 12px;">
            <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Salvar como PDF</button>
          </div>
          
          <div class="header">
            <h1>SGFCe</h1>
            <p>Sociedade de Caridade e Consolo Espiritual • Gestão Unificada de Casas Espíritas</p>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h2 style="font-size: 18px; margin: 0; color: #1e1b4b; font-weight: 700;">Prontuário de Atendimento & Ficha do Assistido</h2>
            <div class="badge">Prontuário: ${v.id.toUpperCase()}</div>
          </div>

          <div class="section-title">1. Dados Cadastrais de Identificação do Assistido</div>
          <div class="grid-container">
            <div class="grid-col-8 data-field">
              <div class="data-label">Nome Completo</div>
              <div class="data-value">${v.nomeCompleto}</div>
            </div>
            <div class="grid-col-4 data-field">
              <div class="data-label">Data de Nascimento</div>
              <div class="data-value">${v.dataNascimento}</div>
            </div>
            <div class="grid-col-6 data-field">
              <div class="data-label">Celular / WhatsApp o Telefone</div>
              <div class="data-value">${v.telefone}</div>
            </div>
            <div class="grid-col-6 data-field">
              <div class="data-label">E-mail Cadastrado</div>
              <div class="data-value">${v.email}</div>
            </div>
          </div>

          <div class="section-title">2. Endereço e Localização</div>
          <div class="grid-container">
            <div class="grid-col-8 data-field">
              <div class="data-label">Logradouro / Endereço</div>
              <div class="data-value">${v.endereco}, Nº ${v.numero} ${v.complemento ? ' - ' + v.complemento : ''}</div>
            </div>
            <div class="grid-col-4 data-field">
              <div class="data-label">Bairro</div>
              <div class="data-value">${v.bairro}</div>
            </div>
            <div class="grid-col-5 data-field">
              <div class="data-label">Cidade</div>
              <div class="data-value">${v.cidade}</div>
            </div>
            <div class="grid-col-3 data-field">
              <div class="data-label">Estado</div>
              <div class="data-value">${v.estado}</div>
            </div>
            <div class="grid-col-4 data-field">
              <div class="data-label">CEP</div>
              <div class="data-value">${v.cep}</div>
            </div>
          </div>

          <div class="section-title">3. Triagem e Acolhimento Fraterno Inicial</div>
          <div class="grid-container">
            <div class="grid-col-12 data-field" style="border: none;">
              <div class="data-label" style="margin-bottom: 4px;">Motivo Principal da Busca / Queixa Principal</div>
              <p style="margin: 0; font-size: 13px; color: #1e293b; line-height: 1.6; font-style: italic;">
                "${v.prontuarioInicial.motivoAtendimento}"
              </p>
            </div>
            <div class="grid-col-6 data-field">
              <div class="data-label">Primeira Visita do Assistido?</div>
              <div class="data-value">${v.prontuarioInicial.primeiraVisita ? 'Sim, novo na casa espírita' : 'Não, já frequenta ou cadastrado'}</div>
            </div>
            <div class="grid-col-6 data-field">
              <div class="data-label">Data de Admissão no Sistema</div>
              <div class="data-value">${v.prontuarioInicial.dataAbertura}</div>
            </div>
          </div>

          <div class="section-title">4. Notas de Evolução e Observações Extra-Prontuário</div>
          <div class="notes-box">
            ${formattedObs}
          </div>

          <div class="footer-signatures">
            <div class="sig-block" style="margin-top: 30px;">
              Assinatura do Tarefeiro / Acolhedor Responsável
            </div>
            <div class="sig-block" style="margin-top: 30px;">
              Assinatura do Assistido / Familiares
            </div>
          </div>

          <div class="no-print" style="margin-top: 60px; text-align: center; font-size: 10px; color: #94a3b8; font-family: monospace; border-top: 1px dashed #cbd5e1; padding-top: 10px;">
            SGFCe v1.2.0 • Chave Criptográfica Auxiliar • Documento emitido digitalmente em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredVisitantes = visitantes.filter(v => 
    v.nomeCompleto.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.telefone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header action Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-white tracking-tight">Fichas de Visitantes Assistidos</h2>
          <p className="text-xs text-slate-400 font-display">Cadastro de necessitados, anotação de evolução e geração de Fichas em PDF.</p>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
          className="bg-gradient-to-r from-[var(--color-chakra-6)] to-[var(--color-chakra-5)] text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
        >
          {showForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          <span>{showForm ? 'Fechar Ficha' : 'Admitir Novo Visitante'}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleFormSubmit} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 relative space-y-6">
          {/* Section 1: Personal info */}
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-850 flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-chakra-5)] font-display">Passo 1: Ficha Cadastral de Identificação</h3>
              <span className="text-[10px] text-slate-400">Obrigatório *</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Nome Completo do Assistido *</label>
                <input
                  id="vis-name-input"
                  type="text"
                  required
                  placeholder="Nome sem abreviações"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-chakra-6)]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Data de Nascimento *</label>
                <input
                  id="vis-birth-input"
                  type="date"
                  required
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-chakra-6)]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Telefone / WhatsApp *</label>
                <input
                  id="vis-phone-input"
                  type="text"
                  required
                  placeholder="(00) 90000-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-chakra-6)]"
                />
              </div>

              <div className="md:col-span-12">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">E-mail de Contato</label>
                <input
                  id="vis-email-input"
                  type="email"
                  placeholder="exemplo@servidor.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-chakra-6)]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address with automatic ZIP look up */}
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-850">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-chakra-4)] font-display flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[var(--color-chakra-4)]" />
                <span>Passo 2: Endereço & Busca por CEP</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Insira o CEP de 8 dígitos para preenchimento dinâmico de endereços brasileiros.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">CEP *</label>
                <div className="relative">
                  <input
                    id="vis-cep-input"
                    type="text"
                    required
                    placeholder="00000-000"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    onBlur={handleCepBlur}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-chakra-6)]"
                  />
                  {loadingCep && (
                    <span className="absolute right-3.5 top-3 text-[10px] text-slate-400">Buscando...</span>
                  )}
                </div>
                {cepError && <span className="text-[10px] text-[var(--color-chakra-3)] block mt-1">{cepError}</span>}
                <div className="text-[9px] text-slate-400 mt-1">Dica: Digite <code className="text-[var(--color-chakra-3)] bg-slate-950 px-1 py-0.2 rounded">01310-100</code> p/ testar busca.</div>
              </div>

              <div className="md:col-span-6">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Logradouro / Endereço</label>
                <input
                  id="vis-address-input"
                  type="text"
                  placeholder="Ex: Avenida Paulista"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-chakra-6)]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Número</label>
                <input
                  id="vis-num-input"
                  type="text"
                  placeholder="Ex: 100"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-chakra-6)]"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Complemento</label>
                <input
                  id="vis-comp-input"
                  type="text"
                  placeholder="Apto, Casa, Bloco"
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-chakra-6)]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Bairro</label>
                <input
                  id="vis-bairro-input"
                  type="text"
                  placeholder="Bela Vista"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-chakra-6)]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Cidade</label>
                <input
                  id="vis-city-input"
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-chakra-6)]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">UF / Estado</label>
                <input
                  id="vis-state-input"
                  type="text"
                  maxLength={2}
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-chakra-6)]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Initial clinical file prontuário inicial */}
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-850 flex justify-between items-center text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-chakra-2)] font-display flex items-center gap-1.5">
                <Clipboard className="w-3.5 h-3.5 text-[var(--color-chakra-2)]" />
                <span>Passo 3: Ficha Inicial do Prontuário de Atendimento</span>
              </h3>
              
              <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={primeiraVisita}
                  onChange={(e) => setPrimeiraVisita(e.target.checked)}
                  className="rounded border-slate-850 bg-slate-950 text-[var(--color-chakra-6)]"
                />
                <span>É a primeira visita da pessoa?</span>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">Motivo que trouxe o assistido ao centro espírita *</label>
                <textarea
                  id="vis-reason-input"
                  required
                  rows={2}
                  placeholder="Ex: Busca amparo mental por depressão moderada, luto dolorido, insônia recorrente ou desequilíbrio emocional"
                  value={motivoAtendimento}
                  onChange={(e) => setMotivoAtendimento(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-chakra-6)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">Anotações da Recepção e Direcionamento Inicial</label>
                <textarea
                  id="vis-notes-input"
                  rows={2}
                  placeholder="Insira detalhes adicionais anotados pelo tarefeiro da recepção na admissão..."
                  value={observacoesGerais}
                  onChange={(e) => setObservacoesGerais(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-chakra-6)]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-850">
            <button
              type="button"
              onClick={resetForm}
              className="bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 px-4 py-2 rounded-xl text-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="vis-submit-btn"
              type="submit"
              className="bg-gradient-to-r from-[var(--color-chakra-6)] to-[var(--color-chakra-5)] text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:opacity-95 shadow flex items-center gap-1.5 cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>{editingVisitante ? 'Salvar Alterações' : 'Gerar Prontuário Inicial'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Visitors list search and list */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
        {/* Search header box */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-white font-display">Registros de Assistidos</h3>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Buscar por nome, email ou fone"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-300 focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
          </div>
        </div>

        {/* Visitor Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVisitantes.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-slate-500 text-xs">
              Nenhum assistido localizado com o critério de busca.
            </div>
          ) : (
            filteredVisitantes.map((v) => (
              <div key={v.id} className="p-5 rounded-3xl bg-slate-950 border border-slate-850 hover:border-slate-800 transition-all space-y-4 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />

                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="text-sky-400 text-xs font-mono uppercase tracking-wider font-bold mb-1">FICHA # {v.id.toUpperCase()}</h4>
                      <h3 className="text-base font-bold font-display text-white">{v.nomeCompleto}</h3>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Nascido em {v.dataNascimento}</p>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800 shrink-0">
                      <button
                        onClick={() => handleExportPDF(v)}
                        title="Exportar Ficha em PDF"
                        className="text-slate-400 hover:text-indigo-400 p-1.5 rounded-lg hover:bg-slate-950 transition-all cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEditClick(v)}
                        title="Editar Cadastro"
                        className="text-slate-400 hover:text-amber-400 p-1.5 rounded-lg hover:bg-slate-950 transition-all cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Tem certeza de que deseja remover permanentemente o registro de ${v.nomeCompleto}?`)) {
                            onDeleteVisitante(v.id);
                          }
                        }}
                        title="Excluir Registro"
                        className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-950 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-850/60 font-sans">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-550 flex-shrink-0" />
                      <span className="truncate">{v.telefone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-550 flex-shrink-0" />
                      <span className="truncate">{v.cidade} - {v.estado}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-1 truncate pt-0.5 border-t border-slate-900">
                      <Mail className="w-3.5 h-3.5 text-slate-550 flex-shrink-0" />
                      <span className="truncate">{v.email}</span>
                    </div>
                  </div>

                  {/* Initial assistance diagnostics */}
                  <div className="p-3 bg-slate-900/40 border border-slate-850 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center text-[9.5px]">
                      <span className="font-bold text-slate-450 uppercase tracking-wider">Ficha de Prontuário Inicial</span>
                      <span className="text-slate-500 font-mono">Admissão: {v.prontuarioInicial.dataAbertura}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed italic" title={v.prontuarioInicial.motivoAtendimento}>
                      "{v.prontuarioInicial.motivoAtendimento}"
                    </p>
                  </div>

                  {/* Evolution notes log */}
                  <div className="p-3 bg-slate-900/25 border border-slate-850/60 rounded-xl space-y-2">
                    <span className="text-[9.5px] font-bold text-emerald-450 uppercase tracking-wider block">Notas de Evolução & Observações</span>
                    
                    {v.prontuarioInicial.observacoesGerais ? (
                      <div className="max-h-24 overflow-y-auto pr-1 text-[11px] text-slate-350 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
                        {v.prontuarioInicial.observacoesGerais.split('\n').map((line, idx) => (
                          <p key={idx} className="leading-normal pb-1 border-b border-slate-900/40 last:border-b-0 text-slate-400">
                            {line}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500 italic">Sem observações complementares registradas.</p>
                    )}

                    {/* Quick Observation Append */}
                    <div className="pt-1.5 border-t border-slate-900/60">
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Adicionar nota de evolução rápida..."
                          value={newObservations[v.id] || ''}
                          onChange={(e) => setNewObservations(prev => ({ ...prev, [v.id]: e.target.value }))}
                          className="flex-1 bg-slate-950 border border-slate-850 rounded-lg px-2 py-1.5 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                        />
                        <button
                          onClick={() => handleAddObservation(v)}
                          disabled={!(newObservations[v.id]?.trim())}
                          className="bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-700 text-white px-2 py-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer font-semibold"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Select button for direct spiritual treatment session record */}
                <div className="flex justify-end pt-3 mt-1 border-t border-slate-900">
                  <button
                    onClick={() => onSelectVisitanteForAtendimento(v.id, v.nomeCompleto)}
                    className="bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-850 border border-slate-800 text-[11px] px-3 py-2 rounded-xl flex items-center gap-1 transition-all cursor-pointer w-full justify-center sm:w-auto"
                  >
                    <Zap className="w-3.5 h-3.5 text-[var(--color-chakra-3)] animate-pulse" />
                    <span>Iniciar Sessão Atendimento Fraterno</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
