export type CargoColaborador = 'Tarefeiro' | 'Voluntário' | 'Presidente' | 'Vice-Presidente' | 'Conselheiro';

export interface PermissoesAcesso {
  admin: boolean;
  atendimento: boolean;
  financeiro: boolean;
  cadastro: boolean;
}

export interface Colaborador {
  id: string;
  name: string;
  email: string;
  cargo: CargoColaborador;
  permissions: PermissoesAcesso;
  active: boolean;
  password?: string;
}

export interface ProntuarioInicial {
  motivoAtendimento: string;
  primeiraVisita: boolean;
  dataAbertura: string;
  observacoesGerais: string;
}

export interface Visitante {
  id: string;
  nomeCompleto: string;
  dataNascimento: string;
  email: string;
  telefone: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  prontuarioInicial: ProntuarioInicial;
}

export interface DiagnosticoChakras {
  coronario: number; // Magenta (Sahasrara) - 0 to 10
  frontal: number;   // Violeta (Ajna) - 0 to 10
  laringeo: number;  // Azul (Vishuddha) - 0 to 10
  cardiaco: number;  // Verde (Anahata) - 0 to 10
  umbilical: number; // Amarelo (Manipura) - 0 to 10
  esplenico: number; // Laranja (Svadhisthana) - 0 to 10
  basico: number;    // Vermelho (Muladhara) - 0 to 10
}

export interface RecomendacoesAtendimento {
  passe: boolean;
  aguaFluidificada: boolean;
  evangelhoLar: boolean;
  palestrasPublicas: boolean;
  desobsessao: boolean;
}

export interface AtendimentoFraterno {
  id: string;
  visitanteId: string;
  visitanteNome: string;
  dataAtendimento: string;
  atendedorNome: string;
  queixasFraternas: string;
  diagnosticoChakras: DiagnosticoChakras;
  recomendacoes: RecomendacoesAtendimento;
  observacoesFinais: string;
  status: 'Agendado' | 'Em Atendimento' | 'Concluído';
}

export interface TransacaoFinanceira {
  id: string;
  tipo: 'Receita' | 'Despesa';
  categoria: string;
  valor: number;
  descricao: string;
  data: string;
}

export interface CompraItem {
  id: string;
  item: string;
  quantidade: number;
  solicitante: string;
  status: 'Pendente' | 'Aprovado' | 'Comprado' | 'Cancelado';
  valorEstimado: number;
  dataSolicitacao: string;
  categoria: string;
}

export interface DoacaoRegistro {
  id: string;
  doador: string;
  tipo: string;
  quantidade: number;
  unidade: string;
  data: string;
  destino: string;
}

export interface CampanhaArrecadacao {
  id: string;
  titulo: string;
  descricao: string;
  meta: number;
  arrecadado: number;
  dataInicio: string;
  dataFim: string;
  status: 'Ativa' | 'Encerrada';
}

// === NEW MODULES ===

// 1. Internal Communication
export interface MensagemDireta {
  id: string;
  senderId: string; // email of user
  senderName: string;
  receiverId: string; // email of target
  receiverName: string;
  content: string;
  timestamp: string;
}

export type ForumCategory = 'Doutrina' | 'Assistência Social' | 'Sopa Fraterna' | 'Mediunidade' | 'Administração' | 'Geral';

export interface ForumTopic {
  id: string;
  title: string;
  description: string;
  category: ForumCategory;
  authorName: string;
  authorEmail: string;
  createdAt: string;
}

export interface ForumReply {
  id: string;
  topicId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: string;
}

export interface ComunicadoGeral {
  id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  important: boolean;
}

// 2. Agenda & Events
export interface EventoAgenda {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: 'Palestra' | 'Tratamento/Passe' | 'Bazar/Ação Social' | 'Reunião de Estudos' | 'Sopa Fraterna' | 'Outros';
  createdByName: string;
  createdByEmail: string;
}

// 3. Saved Report Filters and Config
export interface RelatorioSalvo {
  id: string;
  title: string;
  description: string;
  type: 'financeiro' | 'atendimentos' | 'doacoes' | 'colaboradores';
  filters: {
    startDate?: string;
    endDate?: string;
    category?: string;
    status?: string;
    searchTerm?: string;
  };
  createdAt: string;
  createdByName: string;
}

export interface SenhaAtendimento {
  id: string;
  numero: string; // e.g. "AM-001", "AZ-002"
  tipo: 'Amarela' | 'Azul';
  visitanteId?: string;
  visitanteNome: string;
  status: 'Aguardando' | 'Chamando' | 'Em Atendimento' | 'Concluido' | 'Cancelado';
  consultorio: string; // e.g. "Acolhimento Fraterno", "Sala de Passes 1"
  data: string; // YYYY-MM-DD
  horaGerada: string; // HH:MM
  timestampGerada: number;
  timestampChamada?: number;
  timestampFinalizada?: number;
  tempoAtendimentoSegundos?: number;
}

