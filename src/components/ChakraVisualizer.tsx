import React, { useState } from 'react';
import { Heart, Shield, Eye, Flame, Award, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface ChakraDetail {
  id: number;
  name: string;
  sanskrit: string;
  color: string;
  icon: string;
  location: string;
  spiritualMeaning: string;
  advice: string;
}

const CHAKRAS: ChakraDetail[] = [
  {
    id: 7,
    name: 'Coronário',
    sanskrit: 'Sahasrara',
    color: 'var(--color-chakra-7)',
    icon: '✨',
    location: 'Topo da Cabeça (Cérebro)',
    spiritualMeaning: 'Conexão com a Espiritualidade Superior e Sabedoria Universal.',
    advice: 'Incentive momentos frequentes de prece sincera, meditação silenciosa e leitura de obras edificantes.'
  },
  {
    id: 6,
    name: 'Frontal',
    sanskrit: 'Ajna',
    color: 'var(--color-chakra-6)',
    icon: '👁️',
    location: 'Testa (Glândula Pineal)',
    spiritualMeaning: 'Intuição, discernimento, claridade de pensamento e percepções.',
    advice: 'Aconselhe cessar pensamentos obsessivos e praticar a sintonia com os benfeitores espirituais antes de dormir.'
  },
  {
    id: 5,
    name: 'Laríngeo',
    sanskrit: 'Vishuddha',
    color: 'var(--color-chakra-5)',
    icon: '🗣️',
    location: 'Garganta (Tireoide)',
    spiritualMeaning: 'Comunicação, expressão criativa e exteriorização de sentimentos.',
    advice: 'Recomende falar somente o bem, evitar fofocas e cultivar palavras de incentivo ao próximo.'
  },
  {
    id: 4,
    name: 'Cardíaco',
    sanskrit: 'Anahata',
    color: 'var(--color-chakra-4)',
    icon: '💚',
    location: 'Centro do Peito (Timo)',
    spiritualMeaning: 'Amor incondicional, fraternidade, autoperdão e caridade ativa.',
    advice: 'O passe magnético e o engajamento no voluntariado auxiliam no reequilíbrio deste chakra vital.'
  },
  {
    id: 3,
    name: 'Plexo Solar',
    sanskrit: 'Manipura',
    color: 'var(--color-chakra-3)',
    icon: '☀️',
    location: 'Estômago (Pâncreas)',
    spiritualMeaning: 'Poder pessoal, digestão das emoções, controle da ansiedade e raiva.',
    advice: 'Sugerir fluidoterapia (água fluida) diária e vigilância mental nas horas de irritação e ansiedade.'
  },
  {
    id: 2,
    name: 'Esplênico / Sacro',
    sanskrit: 'Svadhisthana',
    color: 'var(--color-chakra-2)',
    icon: '🌊',
    location: 'Baixo Ventre (Baço)',
    spiritualMeaning: 'Energia vital, saúde do sangue, magnetismo e sexualidade saudável.',
    advice: 'O repouso físico adequado, alimentação natural e passes dispersivos regeneram esse centro energético.'
  },
  {
    id: 1,
    name: 'Básico / Raiz',
    sanskrit: 'Muladhara',
    color: 'var(--color-chakra-1)',
    icon: '✊',
    location: 'Base da Coluna',
    spiritualMeaning: 'Segurança material, força de sobrevivência e conexão física com o plano terrestre.',
    advice: 'Trabalho manual honrado, caminhadas ao ar livre e cultivar a fé no amparo divino restabelecem a base.'
  }
];

export default function ChakraVisualizer() {
  const [selectedChakra, setSelectedChakra] = useState<ChakraDetail | null>(CHAKRAS[3]); // Cardíaco default

  return (
    <div className="bg-white border border-slate-205 rounded-3xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Interactive Chakra Line */}
        <div className="flex flex-col items-center justify-between bg-slate-50 p-4 rounded-2xl md:w-36 flex-shrink-0 border border-slate-200">
          <span className="text-[10px] uppercase font-display text-slate-500 tracking-wider text-center mb-2 font-bold">Os 7 Chakras</span>
          
          <div className="relative flex flex-col items-center justify-center gap-2.5 my-2">
            {/* Energy Line */}
            <div className="absolute top-4 bottom-4 w-1 rounded-full bg-slate-200" />
            <div className="absolute top-4 bottom-4 w-0.5 rounded-full chakra-gradient opacity-30" />

            {CHAKRAS.map((chakra) => {
              const isSelected = selectedChakra?.id === chakra.id;
              return (
                <button
                  key={chakra.id}
                  onClick={() => setSelectedChakra(chakra)}
                  className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-xs transition-colors shadow-sm focus:outline-none cursor-pointer group`}
                  style={{
                    backgroundColor: isSelected ? chakra.color : '#ffffff',
                    border: `2px solid ${chakra.color}`,
                    color: isSelected ? '#ffffff' : chakra.color,
                    boxShadow: isSelected ? `0 0 10px ${chakra.color}40` : 'none'
                  }}
                  title={`${chakra.name} (${chakra.sanskrit})`}
                >
                  <span className="font-bold">{chakra.id}</span>
                  {/* Hover tooltip */}
                  <span className="absolute left-12 scale-0 group-hover:scale-100 transition-all bg-slate-800 text-[10px] text-white px-2 py-1 rounded shadow-md whitespace-nowrap z-20 font-medium">
                    Chakra {chakra.name}
                  </span>
                </button>
              );
            })}
          </div>
          
          <span className="text-[10px] text-slate-450 mt-2 text-center font-bold">Clique p/ ver</span>
        </div>

        {/* Selected Chakra Info Card */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {selectedChakra && (
              <motion.div
                key={selectedChakra.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedChakra.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold font-display text-slate-850">{selectedChakra.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full text-indigo-700 bg-indigo-50 border border-indigo-200/50 font-mono font-bold">
                        {selectedChakra.sanskrit}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium font-display">Localização: {selectedChakra.location}</p>
                  </div>
                </div>

                <div className="h-0.5 w-full bg-slate-100" />

                <div className="space-y-3">
                  <div>
                    <h5 className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1">Significado Espiritual</h5>
                    <p className="text-slate-650 text-xs leading-relaxed font-sans">{selectedChakra.spiritualMeaning}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100">
                    <h5 className="text-[11px] uppercase tracking-wider text-indigo-700 font-bold flex items-center gap-1.5 mb-1 font-display">
                      <Heart className="w-3 h-3 text-[var(--color-chakra-4)]" />
                      <span>Recomendação de Autocuidado</span>
                    </h5>
                    <p className="text-slate-700 text-xs leading-relaxed italic">"{selectedChakra.advice}"</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-450 flex items-center gap-1.5 font-medium">
            <Shield className="w-3.5 h-3.5 text-blue-500" />
            <span>As orientações acima servem como sugestão de harmonização fluídica complementar.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
