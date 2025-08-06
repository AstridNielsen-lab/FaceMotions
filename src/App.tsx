import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import SkeletonEditor from './components/SkeletonEditor';
import AnimationGallery from './components/AnimationGallery';
import AnimationCanvas from './components/AnimationCanvas';
import FacialAnimationGallery from './components/FacialAnimationGallery';
import FacialAnimationCanvas from './components/FacialAnimationCanvas';
import FaceMotions from './components/FaceMotions';
import PhotoChat from './components/PhotoChat';
import { Sparkles } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface SkeletonPoints {
  head: Point;
  leftEye: Point;
  rightEye: Point;
  leftShoulder: Point;
  rightShoulder: Point;
  leftElbow: Point;
  rightElbow: Point;
  leftWrist: Point;
  rightWrist: Point;
  hip: Point;
  leftKnee: Point;
  rightKnee: Point;
  leftAnkle: Point;
  rightAnkle: Point;
}

type AppStep = 'home' | 'upload' | 'skeleton' | 'animate' | 'preview' | 'facial' | 'facialPreview' | 'facemotions' | 'photochat';

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('home');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [skeleton, setSkeleton] = useState<SkeletonPoints | null>(null);
  const [selectedAnimation, setSelectedAnimation] = useState<string | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setCurrentStep('skeleton');
  };

  const handleSkeletonSaved = (skeletonData: SkeletonPoints) => {
    setSkeleton(skeletonData);
    console.log('Esqueleto salvo:', JSON.stringify(skeletonData, null, 2));
    setCurrentStep('animate');
  };

  const handleSelectAnimation = (animationType: string) => {
    setSelectedAnimation(animationType);
    setIsAnimating(true);
    setCurrentStep('preview');
  };

  const handleSelectFacialAnimation = (emotionType: string) => {
    setSelectedEmotion(emotionType);
    setIsAnimating(true);
    setCurrentStep('facialPreview');
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };

  const goBack = () => {
    switch (currentStep) {
      case 'upload':
        setCurrentStep('home');
        setUploadedImage(null);
        break;
      case 'facemotions':
        setCurrentStep('home');
        break;
      case 'photochat':
        setCurrentStep('home');
        break;
      case 'skeleton':
        setCurrentStep('upload');
        setUploadedImage(null);
        break;
      case 'animate':
        setCurrentStep('skeleton');
        setSkeleton(null);
        break;
      case 'preview':
        setCurrentStep('animate');
        setSelectedAnimation(null);
        setIsAnimating(false);
        break;
      case 'facial':
        setCurrentStep('animate');
        break;
      case 'facialPreview':
        setCurrentStep('facial');
        setSelectedEmotion(null);
        setIsAnimating(false);
        break;
    }
  };

  const goToFacialAnimations = () => {
    setCurrentStep('facial');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
      {/* Header */}
      <header className="bg-white bg-opacity-80 backdrop-blur-sm shadow-lg border-b-4 border-purple-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-2xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AnimaKids
                </h1>
                <p className="text-gray-600 text-sm">Dê vida aos seus desenhos!</p>
              </div>
            </div>
            
            {/* Indicador de progresso */}
            <div className="hidden md:flex items-center gap-2">
              {['Upload', 'Esqueleto', 'Corpo', 'Prévia', 'Rosto', 'Emoção'].map((step, index) => (
                <React.Fragment key={step}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    index <= ['upload', 'skeleton', 'animate', 'preview', 'facial', 'facialPreview'].indexOf(currentStep)
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  {index < 5 && (
                    <div className={`w-8 h-1 rounded transition-all duration-300 ${
                      index < ['upload', 'skeleton', 'animate', 'preview', 'facial', 'facialPreview'].indexOf(currentStep)
                        ? 'bg-purple-500'
                        : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {currentStep !== 'home' && (
              <button
                onClick={goBack}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105"
              >
                Voltar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto py-8">
        {currentStep === 'home' && (
          <div className="w-full max-w-4xl mx-auto p-6">
            <div className="text-center mb-12">
              <div className="text-6xl mb-6">🎨✨</div>
              <h2 className="text-4xl font-bold text-purple-700 mb-4">
                Escolha seu Modo de Animação!
              </h2>
              <p className="text-xl text-gray-600">
                Que tipo de magia você quer criar hoje?
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Animação Corporal */}
              <div 
                onClick={() => setCurrentStep('upload')}
                className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl p-6 text-white cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl transform hover:-translate-y-2"
              >
                <div className="text-center">
                  <div className="text-5xl mb-4">🕺</div>
                  <h3 className="text-xl font-bold mb-3">Animação Corporal</h3>
                  <p className="text-blue-100 mb-4 leading-relaxed text-sm">
                    Faça seus personagens dançarem, corrererem, pularem e se moverem de forma incrível!
                  </p>
                  <div className="grid grid-cols-2 gap-1 text-xs mb-4">
                    <div className="bg-white bg-opacity-20 rounded-lg p-1">🏃 Corrida</div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-1">💃 Dança</div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-1">🦘 Pulos</div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-1">👋 Acenar</div>
                  </div>
                  <button className="bg-white text-purple-600 px-4 py-2 rounded-xl font-bold hover:bg-opacity-90 transition-all text-sm">
                    🚀 Começar Agora
                  </button>
                </div>
              </div>
              
              {/* FaceMotions */}
              <div 
                onClick={() => setCurrentStep('facemotions')}
                className="bg-gradient-to-br from-pink-400 to-red-500 rounded-3xl p-6 text-white cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl transform hover:-translate-y-2"
              >
                <div className="text-center">
                  <div className="text-5xl mb-4">🎭</div>
                  <h3 className="text-xl font-bold mb-3">FaceMotions</h3>
                  <p className="text-pink-100 mb-4 leading-relaxed text-sm">
                    Animação facial inteligente com IA! Frases que se transformam em expressões realistas.
                  </p>
                  <div className="grid grid-cols-2 gap-1 text-xs mb-4">
                    <div className="bg-white bg-opacity-20 rounded-lg p-1">😊 Felicidade</div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-1">😢 Tristeza</div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-1">😠 Raiva</div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-1">🔊 TTS</div>
                  </div>
                  <button className="bg-white text-pink-600 px-4 py-2 rounded-xl font-bold hover:bg-opacity-90 transition-all text-sm">
                    ✨ Experimentar
                  </button>
                </div>
              </div>
              
              {/* PhotoChat */}
              <div 
                onClick={() => setCurrentStep('photochat')}
                className="bg-gradient-to-br from-green-400 to-teal-500 rounded-3xl p-6 text-white cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl transform hover:-translate-y-2"
              >
                <div className="text-center">
                  <div className="text-5xl mb-4">💬</div>
                  <h3 className="text-xl font-bold mb-3">PhotoChat</h3>
                  <p className="text-green-100 mb-4 leading-relaxed text-sm">
                    Converse com suas fotos! IA Gemini analisa a imagem e responde como se fosse a pessoa da foto.
                  </p>
                  <div className="grid grid-cols-2 gap-1 text-xs mb-4">
                    <div className="bg-white bg-opacity-20 rounded-lg p-1">🤖 Gemini AI</div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-1">💭 Conversa</div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-1">📸 Análise</div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-1">🎯 Interativo</div>
                  </div>
                  <button className="bg-white text-green-600 px-4 py-2 rounded-xl font-bold hover:bg-opacity-90 transition-all text-sm">
                    🗨️ Conversar
                  </button>
                </div>
              </div>
            </div>
            
            {/* Informações adicionais */}
            <div className="mt-12 bg-white rounded-3xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-center mb-6 text-gray-700">
                🌟 Recursos Incríveis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl mb-3">🤖</div>
                  <h4 className="font-bold text-gray-700 mb-2">IA Avançada</h4>
                  <p className="text-sm text-gray-600">Detecção facial automática e animações realistas</p>
                </div>
                <div>
                  <div className="text-3xl mb-3">🎨</div>
                  <h4 className="font-bold text-gray-700 mb-2">Fácil de Usar</h4>
                  <p className="text-sm text-gray-600">Interface intuitiva para todas as idades</p>
                </div>
                <div>
                  <div className="text-3xl mb-3">📱</div>
                  <h4 className="font-bold text-gray-700 mb-2">Exportação</h4>
                  <p className="text-sm text-gray-600">Salve e compartilhe suas criações</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {currentStep === 'facemotions' && (
          <FaceMotions />
        )}
        
        {currentStep === 'photochat' && (
          <PhotoChat />
        )}
        
        {currentStep === 'upload' && (
          <ImageUploader
            onImageUpload={handleImageUpload}
            uploadedImage={uploadedImage}
          />
        )}

        {currentStep === 'skeleton' && uploadedImage && (
          <SkeletonEditor
            imageUrl={uploadedImage}
            onSkeletonSaved={handleSkeletonSaved}
          />
        )}

        {currentStep === 'animate' && (
          <div className="space-y-8">
            <AnimationGallery
              onSelectAnimation={handleSelectAnimation}
              isAnimating={isAnimating}
            />
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-purple-700 mb-4">
                  🎭 Quer animar o rosto também?
                </h3>
                <p className="text-purple-600 mb-6">
                  Dê vida às expressões faciais do seu personagem com emoções incríveis!
                </p>
                <button
                  onClick={goToFacialAnimations}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105"
                >
                  🎨 Animar Expressões Faciais
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'facial' && (
          <FacialAnimationGallery
            onSelectFacialAnimation={handleSelectFacialAnimation}
            isAnimating={isAnimating}
          />
        )}

        {currentStep === 'preview' && uploadedImage && skeleton && selectedAnimation && (
          <AnimationCanvas
            imageUrl={uploadedImage}
            skeleton={skeleton}
            animationType={selectedAnimation}
            onAnimationComplete={handleAnimationComplete}
          />
        )}

        {currentStep === 'facialPreview' && uploadedImage && skeleton && selectedEmotion && (
          <FacialAnimationCanvas
            imageUrl={uploadedImage}
            skeleton={skeleton}
            emotionType={selectedEmotion}
            onAnimationComplete={handleAnimationComplete}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white bg-opacity-60 backdrop-blur-sm border-t border-gray-200 mt-16">
        <div className="container mx-auto px-6 py-8 text-center">
          <p className="text-gray-600 mb-2">
            Feito com 💜 para crianças criativas
          </p>
          <p className="text-gray-500 text-sm">
            Transforme seus desenhos em animações incríveis!
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;