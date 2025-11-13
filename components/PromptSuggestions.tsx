import React, { useState, useCallback } from 'react';
import { RefreshIcon } from './icons';

interface PromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
}

const ALL_PROMPTS = [
  "Um astronauta surfando em uma onda cósmica em estilo synthwave",
  "Uma biblioteca antiga e empoeirada dentro de uma árvore gigante e oca",
  "Um majestoso leão com uma juba com padrão de galáxia, sentado em um trono de cristal",
  "Uma aconchegante loja de ramen cyberpunk em uma noite chuvosa, luzes de neon refletindo no pavimento molhado",
  "Uma floresta encantada onde as árvores têm runas brilhantes e o rio flui com luz estelar líquida",
  "Um robô vitoriano servindo chá em um jardim exuberante e cheio de flores exóticas",
  "Uma cidade subaquática bioluminescente habitada por criaturas marinhas humanoides",
  "Um mercado flutuante em um planeta alienígena com duas luas no céu",
  "Um dragão feito inteiramente de flores e vinhas, dormindo em um campo ensolarado",
  "Retrato de um nobre gato renascentista com um rufo e um monóculo",
  "Uma paisagem desértica surreal com relógios derretendo, em homenagem a Salvador Dalí",
  "Uma ilha flutuante com uma cachoeira que cai nas nuvens abaixo",
  "Um cavaleiro fantasma com armadura brilhante cavalgando por uma floresta assombrada",
  "Um trem a vapor voando por um céu crepuscular cheio de zepelins",
  "Uma cena de rua detalhada no Japão feudal com samurais e gueixas",
  "Um farol de cristal em uma costa rochosa durante uma tempestade mágica",
  "Um polvo gigante usando um chapéu-coco e lendo um livro debaixo d'água",
  "Um close extremo de um floco de neve, revelando padrões geométricos intrincados",
  "Um carro esportivo elegante correndo por uma rodovia de arco-íris no espaço",
  "Um urso grizzly pescando salmão sob a aurora boreal",
];

const shuffleArray = (array: string[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onSelectPrompt }) => {
  const [suggestions, setSuggestions] = useState<string[]>(() => shuffleArray(ALL_PROMPTS).slice(0, 4));

  const handleShuffle = useCallback(() => {
    setSuggestions(shuffleArray(ALL_PROMPTS).slice(0, 4));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-300">Inspire-se</h2>
        <button
          onClick={handleShuffle}
          className="p-1.5 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500"
          aria-label="Novas sugestões"
        >
          <RefreshIcon />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(prompt)}
            className="px-3 py-1.5 text-sm bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 text-left"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PromptSuggestions;