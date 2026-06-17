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
  RelatorioSalvo
} from '../types';

const INITIAL_MENSAGENS: MensagemDireta[] = [
  {
    id: 'msg-1',
    senderId: 'maria.helena@fraternidade.org',
    senderName: 'Maria Helena Souza',
    receiverId: 'antonio.bezerra@fraternidade.org',
    receiverName: 'Antônio Bezerra Silva',
    content: 'Olá Antônio, tudo bem? Você conseguiria coordenar a distribuição da sopa neste sábado, dia 13?',
    timestamp: '2026-06-10T14:30:00Z'
  },
  {
    id: 'msg-2',
    senderId: 'antonio.bezerra@fraternidade.org',
    senderName: 'Antônio Bezerra Silva',
    receiverId: 'maria.helena@fraternidade.org',
    receiverName: 'Maria Helena Souza',
    content: 'Claro, irmã Maria Helena! Já deixei os ingredientes limpos e organizados com o Carlos de Lucca. Estarei lá às 15h.',
    timestamp: '2026-06-10T15:15:00Z'
  }
];

const INITIAL_TOPICOS: ForumTopic[] = [
  {
    id: 'topico-1',
    title: 'Estudos Doutrinários Avançados - Novas Apostilas',
    description: 'Sugestões e debate sobre a nova apostila de estudos do Livro dos Médiuns para o segundo semestre de 2026.',
    category: 'Doutrina',
    authorName: 'Francisco Cândido Luz',
    authorEmail: 'chico.luz@fraternidade.org',
    createdAt: '2026-06-08T18:00:00Z'
  },
  {
    id: 'topico-2',
    title: 'Logística da Sopa Fraterna de Inverno',
    description: 'Discussão sobre rotas de entrega e cuidados sanitários no período de frio intenso. Precisamos de cobertores para somar às marmitas.',
    category: 'Sopa Fraterna',
    authorName: 'Antônio Bezerra Silva',
    authorEmail: 'antonio.bezerra@fraternidade.org',
    createdAt: '2026-06-09T09:30:00Z'
  }
];

const INITIAL_RESPOSTAS: ForumReply[] = [
  {
    id: 'rep-1',
    topicId: 'topico-1',
    authorName: 'Regina Vasconcellos',
    authorEmail: 'regina@fraternidade.org',
    content: 'Achei excelente a introdução aos capítulos XIV e XV. Facilita muito a compreensão prática por parte dos alunos novatos!',
    createdAt: '2026-06-08T20:15:00Z'
  },
  {
    id: 'rep-2',
    topicId: 'topico-2',
    authorName: 'Carlos de Lucca',
    authorEmail: 'carlos.lucca@fraternidade.org',
    content: 'Vou disponibilizar 15 cobertores do estoque do Bazar Beneficente para as primeiras sacolas de apoio. Contem comigo!',
    createdAt: '2026-06-09T11:00:00Z'
  }
];

const INITIAL_COMUNICADOS: ComunicadoGeral[] = [
  {
    id: 'com-1',
    title: 'Mutirão de Limpeza e Harmonização da Sede',
    content: 'Caros tarefeiros, no próximo domingo (14/06) às 08h faremos nosso mutirão geral de limpeza física e harmonização espiritual com preces. Tragam panos adicionais se possível. O lanche será comunitário.',
    authorName: 'Maria Helena Souza',
    createdAt: '2026-06-10T10:00:00Z',
    important: true
  },
  {
    id: 'com-2',
    title: 'Doutrinária Especial com Palestrante Convidado',
    content: 'Teremos a visita do palestrante de Uberaba na próxima quarta-feira, às 20h. Tema: "A prece como magnetismo divino". Divulguem aos seus visitantes assistidos.',
    authorName: 'Francisco Cândido Luz',
    createdAt: '2026-06-08T14:00:00Z',
    important: false
  }
];

const INITIAL_EVENTOS: EventoAgenda[] = [
  {
    id: 'ev-1',
    title: 'Sopa Fraterna - Preparo e Distribuição',
    date: '2026-06-13',
    time: '15:00',
    location: 'Cozinha Industrial da Sede',
    description: 'Atividade de picar legumes, cozinhar e montar os marmitex. Distribuição nas imediações às 19h.',
    category: 'Sopa Fraterna',
    createdByName: 'Antônio Bezerra Silva',
    createdByEmail: 'antonio.bezerra@fraternidade.org'
  },
  {
    id: 'ev-2',
    title: 'Palestra Pública: O Evangelho Segundo o Espiritismo',
    date: '2026-06-17',
    time: '20:00',
    location: 'Salão de Conferências Principal',
    description: 'Tema Livre: O Bem Aventurados os Brandos e Pacíficos. Atendimento fraterno prévio a partir das 19h.',
    category: 'Palestra',
    createdByName: 'Francisco Cândido Luz',
    createdByEmail: 'chico.luz@fraternidade.org'
  },
  {
    id: 'ev-3',
    title: 'Mutirão de Harmonização da Casa',
    date: '2026-06-14',
    time: '08:00',
    location: 'Todas as salas da Sede',
    description: 'Organização geral das prateleiras, limpeza sutil das salas de passes e plantio de plantas ornamentais.',
    category: 'Bazar/Ação Social',
    createdByName: 'Maria Helena Souza',
    createdByEmail: 'maria.helena@fraternidade.org'
  }
];

const INITIAL_RELATORIOS: RelatorioSalvo[] = [
  {
    id: 'rep-salvo-1',
    title: 'Equilíbrio Financeiro Mensal',
    description: 'Relatório consolidando todas as despesas e receitas gerais de junho/2026 com filtro por categorias.',
    type: 'financeiro',
    filters: {
      startDate: '2026-06-01',
      endDate: '2026-06-30'
    },
    createdAt: '2026-06-10T11:30:00Z',
    createdByName: 'Maria Helena Souza'
  }
];

const INITIAL_COLABORADORES: Colaborador[] = [
  {
    id: 'colab-1',
    name: 'Maria Helena Souza',
    email: 'maria.helena@fraternidade.org',
    cargo: 'Presidente',
    permissions: { admin: true, atendimento: true, financeiro: true, cadastro: true },
    active: true
  },
  {
    id: 'colab-2',
    name: 'Francisco Cândido Luz',
    email: 'chico.luz@fraternidade.org',
    cargo: 'Vice-Presidente',
    permissions: { admin: true, atendimento: true, financeiro: true, cadastro: true },
    active: true
  },
  {
    id: 'colab-3',
    name: 'Antônio Bezerra Silva',
    email: 'antonio.bezerra@fraternidade.org',
    cargo: 'Voluntário',
    permissions: { admin: false, atendimento: true, financeiro: false, cadastro: true },
    active: true
  },
  {
    id: 'colab-4',
    name: 'Carlos de Lucca',
    email: 'carlos.lucca@fraternidade.org',
    cargo: 'Tarefeiro',
    permissions: { admin: false, atendimento: false, financeiro: false, cadastro: true },
    active: true
  },
  {
    id: 'colab-5',
    name: 'Regina Vasconcellos',
    email: 'regina@fraternidade.org',
    cargo: 'Conselheiro',
    permissions: { admin: false, atendimento: true, financeiro: true, cadastro: false },
    active: true
  }
];

const INITIAL_VISITANTES: Visitante[] = [
  {
    id: 'visit-1',
    nomeCompleto: 'Pedro de Alcântara Oliveira',
    dataNascimento: '1984-06-15',
    email: 'pedro.oliveira@gamil.com',
    telefone: '(11) 98765-4321',
    cep: '01310-100',
    endereco: 'Avenida Paulista',
    numero: '1000',
    complemento: 'Apto 42',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    estado: 'SP',
    prontuarioInicial: {
      motivoAtendimento: 'Insônia constante, ansiedade profissional severa e crises de pânico. Deseja obter passes de harmonização.',
      primeiraVisita: true,
      dataAbertura: '2026-06-01',
      observacoesGerais: 'Apresenta boa receptividade. Explicado o funcionamento do tratamento espiritual e passe.'
    }
  },
  {
    id: 'visit-2',
    nomeCompleto: 'Joana dArc Silva',
    dataNascimento: '1992-09-22',
    email: 'joana.arc@outlook.com',
    telefone: '(21) 98111-2222',
    cep: '20040-002',
    endereco: 'Avenida Rio Branco',
    numero: '156',
    bairro: 'Centro',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    prontuarioInicial: {
      motivoAtendimento: 'Sentimento de luto por perda de ente querido, tristeza profunda e falta de propósito de vida.',
      primeiraVisita: true,
      dataAbertura: '2026-06-05',
      observacoesGerais: 'Demonstra timidez e choro fácil. Necessita de acolhimento amoroso e agendamento de Atendimento Fraterno Individual.'
    }
  }
];

const INITIAL_ATENDIMENTOS: AtendimentoFraterno[] = [
  {
    id: 'atend-1',
    visitanteId: 'visit-1',
    visitanteNome: 'Pedro de Alcântara Oliveira',
    dataAtendimento: '2026-06-08',
    atendedorNome: 'Chico Cândido Luz',
    queixasFraternas: 'Paciente relata dores difusas de cabeça e sensação de angústia antes de dormir. Atribui a pressões mentais intensas e pouca prece.',
    diagnosticoChakras: {
      coronario: 7,
      frontal: 4, // Bloqueado por excesso de pensamentos
      laringeo: 6,
      cardiaco: 5, // Instável por medo
      umbilical: 3, // Desalinhado por desequilíbrio emocional/pânico
      esplenico: 6,
      basico: 5
    },
    recomendacoes: {
      passe: true,
      aguaFluidificada: true,
      evangelhoLar: true,
      palestrasPublicas: true,
      desobsessao: false
    },
    observacoesFinais: 'Foi recomendado realizar o tratamento de passe por 4 semanas seguidas. Tomar água fluidificada ao acordar e deitar e ler o Evangelho Segundo o Espiritismo semanalmente.',
    status: 'Concluído'
  },
  {
    id: 'atend-2',
    visitanteId: 'visit-2',
    visitanteNome: 'Joana dArc Silva',
    dataAtendimento: '2026-06-11',
    atendedorNome: 'Maria Helena Souza',
    queixasFraternas: 'Sentindo presença espiritual pesada, pesadelos e apatia corporal severa.',
    diagnosticoChakras: {
      coronario: 5,
      frontal: 6,
      laringeo: 5,
      cardiaco: 3, // Baixa vibração por luto e dor
      umbilical: 5,
      esplenico: 4,
      basico: 4
    },
    recomendacoes: {
      passe: true,
      aguaFluidificada: true,
      evangelhoLar: true,
      palestrasPublicas: true,
      desobsessao: true // Recomendou desobsessão para auxílio do espírito desencarnado e do encarnado
    },
    observacoesFinais: 'Encaminhada ao serviço complementar de reuniões de desobsessão (estudo e vibrações). Atitude confiante em sua melhora.',
    status: 'Em Atendimento'
  }
];

const INITIAL_FINANCEIRO: TransacaoFinanceira[] = [
  {
    id: 'fin-1',
    tipo: 'Receita',
    categoria: 'Doações Recebidas',
    valor: 1850.00,
    descricao: 'Doação espontânea em Dinheiro / Pix - Culto na Sede',
    data: '2026-06-02'
  },
  {
    id: 'fin-2',
    tipo: 'Receita',
    categoria: 'Contribuições de Associados',
    valor: 2400.00,
    descricao: 'Contribuição mensal sócios e fundadores caridosos',
    data: '2026-06-05'
  },
  {
    id: 'fin-3',
    tipo: 'Receita',
    categoria: 'Bazar Beneficente',
    valor: 1420.50,
    descricao: 'Venda de roupas usadas arrecadadas no bazar mensal',
    data: '2026-06-07'
  },
  {
    id: 'fin-4',
    tipo: 'Despesa',
    categoria: 'Manutenção da Sede',
    valor: 450.00,
    descricao: 'Substituição da bomba d\'água da cozinha e bebedouro de passes',
    data: '2026-06-03'
  },
  {
    id: 'fin-5',
    tipo: 'Despesa',
    categoria: 'Energia & Água',
    valor: 341.20,
    descricao: 'Fatura de água (SABESP) e luz (ENEL)',
    data: '2026-06-04'
  },
  {
    id: 'fin-6',
    tipo: 'Despesa',
    categoria: 'Compra de Insumos Beneficentes',
    valor: 1200.00,
    descricao: 'Compra de gás e embalagens para a distribuição de sopa fraterna',
    data: '2026-06-06'
  },
  {
    id: 'fin-7',
    tipo: 'Receita',
    categoria: 'Venda de Livros',
    valor: 780.00,
    descricao: 'Livraria Espírita interna - O Livro dos Espíritos e outros',
    data: '2026-06-10'
  }
];

const INITIAL_COMPRAS: CompraItem[] = [
  {
    id: 'compra-1',
    item: '20 fardos de arroz para Sopa Beneficente',
    quantidade: 20,
    solicitante: 'Antônio Bezerra',
    status: 'Aprovado',
    valorEstimado: 600.00,
    dataSolicitacao: '2026-06-04',
    categoria: 'Sopa Fraterna'
  },
  {
    id: 'compra-2',
    item: 'Copos descartáveis de água 200ml (10 caixas)',
    quantidade: 10,
    solicitante: 'Carlos de Lucca',
    status: 'Comprado',
    valorEstimado: 120.00,
    dataSolicitacao: '2026-06-05',
    categoria: 'Material Administrativo'
  },
  {
    id: 'compra-3',
    item: 'Novas poltronas confortáveis para Sala de Atendimento',
    quantidade: 2,
    solicitante: 'Regina Vasconcellos',
    status: 'Pendente',
    valorEstimado: 900.00,
    dataSolicitacao: '2026-06-09',
    categoria: 'Manutenção'
  }
];

const INITIAL_DOACOES: DoacaoRegistro[] = [
  {
    id: 'doar-1',
    doador: 'Armazém Progresso LTDA',
    tipo: 'Cesta Básica',
    quantidade: 12,
    unidade: 'fardos',
    data: '2026-06-03',
    destino: 'Sopa Beneficente e Famílias Cadastradas'
  },
  {
    id: 'doar-2',
    doador: 'Mariana Medeiros Alves',
    tipo: 'Roupas de Frio',
    quantidade: 45,
    unidade: 'peças',
    data: '2026-06-05',
    destino: 'Bazar Beneficente Permanente'
  },
  {
    id: 'doar-3',
    doador: 'Anônimo Amigo do Bem',
    tipo: 'Higiene Pessoal (Sabonetes / Cremes dentais)',
    quantidade: 100,
    unidade: 'unidades',
    data: '2026-06-09',
    destino: 'Kits p/ população de rua'
  }
];

const INITIAL_CAMPANHAS: CampanhaArrecadacao[] = [
  {
    id: 'camp-1',
    titulo: 'Campanha do Agasalho Espírita 2026',
    descricao: 'Arrecadação de cobertores e casacos novos ou usados em bom estado para doação no inverno.',
    meta: 3000.00,
    arrecadado: 2150.00,
    dataInicio: '2026-05-15',
    dataFim: '2026-06-25',
    status: 'Ativa'
  },
  {
    id: 'camp-2',
    titulo: 'Adequação da Sala de Tratamento Fluidoterápico',
    descricao: 'Reforma acústica e climatização para garantir paz e silêncio aos necessitados de passes individuais.',
    meta: 8000.00,
    arrecadado: 7420.00,
    dataInicio: '2026-05-01',
    dataFim: '2026-06-30',
    status: 'Ativa'
  }
];

// LocalStorage helpers with type safety and fallback to Initial mocks
export const getFromStore = <T>(key: string, fallback: T[]): T[] => {
  const data = localStorage.getItem(`sgfce_${key}`);
  if (!data) {
    localStorage.setItem(`sgfce_${key}`, JSON.stringify(fallback));
    return fallback;
  }
  try {
    return JSON.parse(data) as T[];
  } catch (e) {
    return fallback;
  }
};

export const saveToStore = <T>(key: string, data: T[]): void => {
  localStorage.setItem(`sgfce_${key}`, JSON.stringify(data));
};

export const loadAllData = () => {
  return {
    colaboradores: getFromStore<Colaborador>('colaboradores', INITIAL_COLABORADORES),
    visitantes: getFromStore<Visitante>('visitantes', INITIAL_VISITANTES),
    atendimentos: getFromStore<AtendimentoFraterno>('atendimentos', INITIAL_ATENDIMENTOS),
    financeiro: getFromStore<TransacaoFinanceira>('financeiro', INITIAL_FINANCEIRO),
    compras: getFromStore<CompraItem>('compras', INITIAL_COMPRAS),
    doacoes: getFromStore<DoacaoRegistro>('doacoes', INITIAL_DOACOES),
    campanhas: getFromStore<CampanhaArrecadacao>('campanhas', INITIAL_CAMPANHAS),
    mensagens: getFromStore<MensagemDireta>('mensagens', INITIAL_MENSAGENS),
    topicos: getFromStore<ForumTopic>('topicos', INITIAL_TOPICOS),
    respostas: getFromStore<ForumReply>('respostas', INITIAL_RESPOSTAS),
    comunicados: getFromStore<ComunicadoGeral>('comunicados', INITIAL_COMUNICADOS),
    eventos: getFromStore<EventoAgenda>('eventos', INITIAL_EVENTOS),
    relatorios: getFromStore<RelatorioSalvo>('relatorios', INITIAL_RELATORIOS),
  };
};

export const saveAllData = (data: {
  colaboradores: Colaborador[];
  visitantes: Visitante[];
  atendimentos: AtendimentoFraterno[];
  financeiro: TransacaoFinanceira[];
  compras: CompraItem[];
  doacoes: DoacaoRegistro[];
  campanhas: CampanhaArrecadacao[];
  mensagens: MensagemDireta[];
  topicos: ForumTopic[];
  respostas: ForumReply[];
  comunicados: ComunicadoGeral[];
  eventos: EventoAgenda[];
  relatorios: RelatorioSalvo[];
}) => {
  saveToStore('colaboradores', data.colaboradores);
  saveToStore('visitantes', data.visitantes);
  saveToStore('atendimentos', data.atendimentos);
  saveToStore('financeiro', data.financeiro);
  saveToStore('compras', data.compras);
  saveToStore('doacoes', data.doacoes);
  saveToStore('campanhas', data.campanhas);
  saveToStore('mensagens', data.mensagens);
  saveToStore('topicos', data.topicos);
  saveToStore('respostas', data.respostas);
  saveToStore('comunicados', data.comunicados);
  saveToStore('eventos', data.eventos);
  saveToStore('relatorios', data.relatorios);
};
