import React from 'react';
import { Play, Download } from 'lucide-react';

interface AnimationGalleryProps {
  onSelectAnimation: (animationType: string) => void;
  isAnimating: boolean;
}

export default function AnimationGallery({ onSelectAnimation, isAnimating }: AnimationGalleryProps) {
  const animations = [
    {
      id: 'jump',
      name: 'Pular',
      emoji: '🦘',
      color: 'bg-yellow-400',
      description: 'Personagem pulando alegremente'
    },
    {
      id: 'wave',
      name: 'Acenar',
      emoji: '👋',
      color: 'bg-pink-400',
      description: 'Acenando com a mão direita'
    },
    {
      id: 'dance',
      name: 'Dançar',
      emoji: '💃',
      color: 'bg-purple-400',
      description: 'Movimento de dança divertido'
    },
    {
      id: 'march',
      name: 'Marchar',
      emoji: '🚶',
      color: 'bg-green-400',
      description: 'Marchando no lugar'
    },
    {
      id: 'spin',
      name: 'Girar Braços',
      emoji: '🌪️',
      color: 'bg-blue-400',
      description: 'Girando os braços em círculo'
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-indigo-600 mb-2">
          🎭 Galeria de Animações
        </h2>
        <p className="text-gray-600 text-lg">
          Escolha uma animação para seu personagem
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {animations.map((animation) => (
          <div
            key={animation.id}
            className={`${animation.color} rounded-3xl p-6 text-white cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              isAnimating ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => !isAnimating && onSelectAnimation(animation.id)}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">{animation.emoji}</div>
              <h3 className="text-2xl font-bold mb-2">{animation.name}</h3>
              <p className="text-sm opacity-90 mb-4">{animation.description}</p>
              
              <div className="flex justify-center gap-2">
                <button
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2"
                  disabled={isAnimating}
                >
                  <Play className="w-4 h-4" />
                  {isAnimating ? 'Animando...' : 'Reproduzir'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center gap-3 mx-auto">
          <Download className="w-6 h-6" />
          Exportar Animação
        </button>
        <p className="text-gray-500 mt-2 text-sm">
          Em breve: exportação para GIF e MP4
        </p>
      </div>
    </div>
  );
}