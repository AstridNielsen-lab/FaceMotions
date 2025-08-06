import React from 'react';
import { Heart, Smile, Frown, Sunrise as Surprise, Angry, Copyleft as Sleepy, Link as Wink, Laugh } from 'lucide-react';

interface FacialAnimationGalleryProps {
  onSelectFacialAnimation: (emotionType: string) => void;
  isAnimating: boolean;
}

export default function FacialAnimationGallery({ onSelectFacialAnimation, isAnimating }: FacialAnimationGalleryProps) {
  const emotions = [
    {
      id: 'happy',
      name: 'Feliz',
      emoji: '😊',
      color: 'bg-yellow-400',
      description: 'Sorriso radiante e olhos brilhantes',
      icon: Smile
    },
    {
      id: 'sad',
      name: 'Triste',
      emoji: '😢',
      color: 'bg-blue-400',
      description: 'Expressão melancólica',
      icon: Frown
    },
    {
      id: 'surprised',
      name: 'Surpreso',
      emoji: '😲',
      color: 'bg-orange-400',
      description: 'Olhos arregalados de surpresa',
      icon: Surprise
    },
    {
      id: 'angry',
      name: 'Bravo',
      emoji: '😠',
      color: 'bg-red-400',
      description: 'Sobrancelhas franzidas',
      icon: Angry
    },
    {
      id: 'sleepy',
      name: 'Sonolento',
      emoji: '😴',
      color: 'bg-purple-400',
      description: 'Olhos pesados de sono',
      icon: Sleepy
    },
    {
      id: 'wink',
      name: 'Piscadinha',
      emoji: '😉',
      color: 'bg-pink-400',
      description: 'Piscada marota',
      icon: Wink
    },
    {
      id: 'laughing',
      name: 'Gargalhada',
      emoji: '😂',
      color: 'bg-green-400',
      description: 'Rindo muito alto',
      icon: Laugh
    },
    {
      id: 'love',
      name: 'Apaixonado',
      emoji: '😍',
      color: 'bg-rose-400',
      description: 'Olhos de coração',
      icon: Heart
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-pink-600 mb-3">
          😊 Galeria de Emoções Faciais
        </h2>
        <p className="text-gray-600 text-xl">
          Dê vida ao rosto do seu personagem com expressões incríveis!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {emotions.map((emotion) => {
          const IconComponent = emotion.icon;
          return (
            <div
              key={emotion.id}
              className={`${emotion.color} rounded-3xl p-6 text-white cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl transform ${
                isAnimating ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-2'
              }`}
              onClick={() => !isAnimating && onSelectFacialAnimation(emotion.id)}
            >
              <div className="text-center">
                <div className="text-6xl mb-4 animate-bounce">{emotion.emoji}</div>
                <h3 className="text-xl font-bold mb-2">{emotion.name}</h3>
                <p className="text-sm opacity-90 mb-4 leading-relaxed">{emotion.description}</p>
                
                <div className="flex justify-center">
                  <button
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 text-sm"
                    disabled={isAnimating}
                  >
                    <IconComponent className="w-4 h-4" />
                    {isAnimating ? 'Animando...' : 'Aplicar'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-3xl p-6 text-center">
        <h3 className="text-2xl font-bold text-purple-700 mb-3">
          🎭 Como Funciona?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-purple-600">
          <div className="bg-white bg-opacity-50 rounded-2xl p-4">
            <div className="text-2xl mb-2">👀</div>
            <p><strong>Olhos:</strong> Piscam, arregalam e expressam emoções</p>
          </div>
          <div className="bg-white bg-opacity-50 rounded-2xl p-4">
            <div className="text-2xl mb-2">😊</div>
            <p><strong>Boca:</strong> Sorri, franze e faz caretas</p>
          </div>
          <div className="bg-white bg-opacity-50 rounded-2xl p-4">
            <div className="text-2xl mb-2">🤔</div>
            <p><strong>Cabeça:</strong> Balança e inclina com a emoção</p>
          </div>
        </div>
      </div>
    </div>
  );
}