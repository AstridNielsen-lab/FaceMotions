import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Play, Pause, Volume2, VolumeX, Download, RotateCcw, Sparkles, Film } from 'lucide-react';
import * as faceapi from 'face-api.js';
import { gsap } from 'gsap';
import { stopMotionEngine, StopMotionFrame } from '../utils/stopMotionEngine';

interface FaceLandmark {
  x: number;
  y: number;
}

interface FaceData {
  landmarks: FaceLandmark[];
  expressions: { [key: string]: number };
}

interface PhraseExpression {
  phrase: string;
  emotion: string;
  intensity: number;
  duration: number;
}

const PHRASE_EMOTION_MAP: PhraseExpression[] = [
  { phrase: "Estou bravo com você!", emotion: "angry", intensity: 0.8, duration: 3000 },
  { phrase: "Que alegria te ver!", emotion: "happy", intensity: 0.9, duration: 2500 },
  { phrase: "Isso é muito triste...", emotion: "sad", intensity: 0.7, duration: 3500 },
  { phrase: "Que nojo!", emotion: "disgusted", intensity: 0.8, duration: 2000 },
  { phrase: "Estou assustado!", emotion: "fearful", intensity: 0.8, duration: 2500 },
  { phrase: "Surpresa!", emotion: "surprised", intensity: 0.9, duration: 2000 },
  { phrase: "Que amor lindo!", emotion: "happy", intensity: 1.0, duration: 3000 },
  { phrase: "Estou com sono...", emotion: "neutral", intensity: 0.5, duration: 4000 },
  { phrase: "Haha, que engraçado!", emotion: "happy", intensity: 0.9, duration: 2500 },
  { phrase: "Não acredito nisso!", emotion: "surprised", intensity: 0.8, duration: 3000 },
  { phrase: "Que maravilha!", emotion: "happy", intensity: 0.9, duration: 2500 },
  { phrase: "Isso me deixa nervoso", emotion: "angry", intensity: 0.6, duration: 3000 }
];

export default function FaceMotions() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [faceData, setFaceData] = useState<FaceData | null>(null);
  const [selectedPhrase, setSelectedPhrase] = useState<PhraseExpression | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [currentLandmarks, setCurrentLandmarks] = useState<FaceLandmark[]>([]);
  const [useStopMotion, setUseStopMotion] = useState(true); // Por padrão usa Stop Motion
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationRef = useRef<number | null>(null);

  // Carregar modelos do face-api.js
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar modelos:', error);
      }
    };
    
    loadModels();
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !modelsLoaded) return;

    setIsProcessing(true);
    
    try {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
      
      // Detectar pontos faciais
      const img = new Image();
      img.onload = async () => {
        try {
          const detections = await faceapi
            .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();

          if (detections) {
            const landmarks = detections.landmarks.positions.map(point => ({
              x: point.x / img.width,
              y: point.y / img.height
            }));
            
            setFaceData({
              landmarks,
              expressions: detections.expressions
            });
            setCurrentLandmarks(landmarks);
            drawFaceWithLandmarks(img, landmarks);
          } else {
            alert('Nenhum rosto detectado na imagem. Tente com uma imagem mais clara.');
          }
        } catch (error) {
          console.error('Erro na detecção facial:', error);
          alert('Erro ao processar a imagem. Tente novamente.');
        }
        setIsProcessing(false);
      };
      
      img.src = imageUrl;
    } catch (error) {
      console.error('Erro ao carregar imagem:', error);
      setIsProcessing(false);
    }
  };

  const drawFaceWithLandmarks = (img: HTMLImageElement, landmarks: FaceLandmark[], emotion?: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajustar tamanho do canvas
    const maxSize = 600;
    const scale = Math.min(maxSize / img.width, maxSize / img.height);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Desenhar imagem
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Desenhar landmarks
    ctx.fillStyle = emotion ? getEmotionColor(emotion) : '#00ff00';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    landmarks.forEach((point, index) => {
      const x = point.x * canvas.width;
      const y = point.y * canvas.height;
      
      // Pontos principais (olhos, nariz, boca)
      if (isKeyLandmark(index)) {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      } else {
        // Pontos menores para contorno
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // Desenhar conexões especiais para emoção
    if (emotion) {
      drawEmotionEffects(ctx, landmarks, canvas.width, canvas.height, emotion);
    }
  };

  const isKeyLandmark = (index: number): boolean => {
    // Pontos dos olhos, nariz e boca são considerados pontos principais
    return (
      (index >= 36 && index <= 47) || // Olhos
      (index >= 27 && index <= 35) || // Nariz
      (index >= 48 && index <= 67)    // Boca
    );
  };

  const getEmotionColor = (emotion: string): string => {
    const colors: { [key: string]: string } = {
      happy: '#ffeb3b',
      sad: '#2196f3',
      angry: '#f44336',
      surprised: '#ff9800',
      fearful: '#9c27b0',
      disgusted: '#4caf50',
      neutral: '#9e9e9e'
    };
    return colors[emotion] || '#00ff00';
  };

  const drawEmotionEffects = (
    ctx: CanvasRenderingContext2D,
    landmarks: FaceLandmark[],
    width: number,
    height: number,
    emotion: string
  ) => {
    const time = Date.now() * 0.001;
    
    switch (emotion) {
      case 'happy':
        // Sparkles ao redor do rosto
        for (let i = 0; i < 5; i++) {
          const x = landmarks[30].x * width + Math.sin(time + i) * 50; // Ao redor do nariz
          const y = landmarks[30].y * height + Math.cos(time + i) * 50;
          ctx.fillStyle = '#ffeb3b';
          ctx.font = '20px Arial';
          ctx.fillText('✨', x, y);
        }
        break;
        
      case 'angry':
        // Linhas de raiva
        ctx.strokeStyle = '#f44336';
        ctx.lineWidth = 3;
        const eyebrowLeft = landmarks[21];
        const eyebrowRight = landmarks[22];
        
        for (let i = 0; i < 3; i++) {
          const offset = i * 5 + Math.sin(time * 10) * 2;
          ctx.beginPath();
          ctx.moveTo(eyebrowLeft.x * width - 20, eyebrowLeft.y * height - 15 - offset);
          ctx.lineTo(eyebrowLeft.x * width - 5, eyebrowLeft.y * height - 25 - offset);
          ctx.moveTo(eyebrowRight.x * width + 20, eyebrowRight.y * height - 15 - offset);
          ctx.lineTo(eyebrowRight.x * width + 5, eyebrowRight.y * height - 25 - offset);
          ctx.stroke();
        }
        break;
        
      case 'surprised':
        // Círculos de choque
        ctx.strokeStyle = '#ff9800';
        ctx.lineWidth = 2;
        for (let i = 1; i <= 3; i++) {
          ctx.globalAlpha = 1 - (i * 0.3);
          ctx.beginPath();
          ctx.arc(landmarks[30].x * width, landmarks[30].y * height, i * 20 + Math.sin(time * 5) * 5, 0, 2 * Math.PI);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        break;
        
      case 'sad':
        // Lágrimas
        ctx.fillStyle = '#2196f3';
        const leftEye = landmarks[39];
        const rightEye = landmarks[42];
        
        ctx.beginPath();
        ctx.arc(leftEye.x * width, leftEye.y * height + 20 + Math.sin(time * 2) * 3, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(rightEye.x * width, rightEye.y * height + 25 + Math.sin(time * 2.5) * 3, 3, 0, 2 * Math.PI);
        ctx.fill();
        break;
    }
  };

  // 🎬 Animação Stop Motion - Sistema completamente novo!
  const animateEmotionStopMotion = useCallback((emotion: string, intensity: number, duration: number) => {
    if (!faceData) return;
    
    console.log(`🎭 Iniciando animação Stop Motion para: ${emotion}`);
    
    // Gerar sequência de frames Stop Motion
    const sequence = stopMotionEngine.generateFacialSequence(
      faceData.landmarks,
      emotion,
      intensity,
      duration
    );
    
    // Reproduzir com callback para atualizar o canvas
    stopMotionEngine.playSequence(
      sequence,
      (frame: StopMotionFrame) => {
        // Atualizar landmarks com frame atual
        setCurrentLandmarks(frame.landmarks);
        
        // Redesenhar canvas com novo frame
        if (imageRef.current) {
          drawFaceWithLandmarks(imageRef.current, frame.landmarks, emotion);
        }
        
        console.log(`🎬 Renderizando frame ${frame.frameNumber + 1}/${sequence.frames.length}`);
      },
      () => {
        // Callback de conclusão
        console.log('🏁 Animação Stop Motion concluída!');
        setIsPlaying(false);
      }
    );
  }, [faceData]);

  // Manter animação fluida como opção (legado)
  const animateEmotion = useCallback((emotion: string, intensity: number, duration: number) => {
    if (!faceData) return;
    
    const startTime = Date.now();
    const originalLandmarks = [...faceData.landmarks];
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (progress >= 1) {
        setIsPlaying(false);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        return;
      }
      
      // Calcular deformações baseadas na emoção
      const deformedLandmarks = originalLandmarks.map((landmark, index) => {
        const deformation = getEmotionDeformation(emotion, intensity, index, progress);
        return {
          x: landmark.x + deformation.x,
          y: landmark.y + deformation.y
        };
      });
      
      setCurrentLandmarks(deformedLandmarks);
      
      if (imageRef.current) {
        drawFaceWithLandmarks(imageRef.current, deformedLandmarks, emotion);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
  }, [faceData]);

  const getEmotionDeformation = (emotion: string, intensity: number, index: number, progress: number) => {
    const time = progress * Math.PI * 2; // Ciclo completo
    const amplitude = intensity * 0.02; // Amplitude das deformações
    
    let deltaX = 0;
    let deltaY = 0;
    
    switch (emotion) {
      case 'happy':
        // Levanta as bochechas e curva a boca para cima
        if (index >= 48 && index <= 54) { // Boca superior
          deltaY = -amplitude * Math.sin(time) * 0.5;
        }
        if (index >= 55 && index <= 59) { // Boca inferior
          deltaY = amplitude * Math.sin(time) * 0.3;
        }
        break;
        
      case 'sad':
        // Abaixa a boca e inclina as sobrancelhas
        if (index >= 48 && index <= 67) { // Boca
          deltaY = amplitude * Math.sin(time) * 0.5;
        }
        if (index >= 17 && index <= 26) { // Sobrancelhas
          deltaY = -amplitude * Math.sin(time) * 0.3;
          deltaX = amplitude * Math.sin(time) * 0.1 * (index < 22 ? 1 : -1);
        }
        break;
        
      case 'surprised':
        // Abre os olhos e a boca
        if (index >= 36 && index <= 47) { // Olhos
          const isUpper = index <= 41 || (index >= 43 && index <= 47);
          deltaY = isUpper ? -amplitude * Math.sin(time) : amplitude * Math.sin(time);
        }
        if (index >= 60 && index <= 67) { // Boca (abertura)
          deltaY = amplitude * Math.sin(time) * 0.8;
        }
        break;
        
      case 'angry':
        // Franze as sobrancelhas e fecha ligeiramente os olhos
        if (index >= 17 && index <= 26) { // Sobrancelhas
          deltaY = amplitude * Math.sin(time) * 0.3;
          deltaX = amplitude * Math.sin(time) * 0.2 * (index < 22 ? -1 : 1);
        }
        if (index >= 36 && index <= 47) { // Olhos
          deltaY = amplitude * Math.sin(time) * 0.2;
        }
        break;
    }
    
    return { x: deltaX, y: deltaY };
  };

  const handlePhraseSelect = async (phraseData: PhraseExpression) => {
    if (isPlaying || !faceData) return;
    
    setSelectedPhrase(phraseData);
    setIsPlaying(true);
    
    // TTS - Síntese de voz
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(phraseData.phrase);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      speechSynthesis.speak(utterance);
    }
    
    // 🎬 Iniciar animação da expressão (Stop Motion por padrão)
    if (useStopMotion) {
      animateEmotionStopMotion(phraseData.emotion, phraseData.intensity, phraseData.duration);
    } else {
      animateEmotion(phraseData.emotion, phraseData.intensity, phraseData.duration);
    }
  };

  const stopAnimation = () => {
    // ⏹️ Parar animações fluidas tradicionais
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // 🎬 Parar animações Stop Motion
    stopMotionEngine.stop();
    
    // 🔇 Parar síntese de voz
    speechSynthesis.cancel();
    
    // ♾️ Resetar estados
    setIsPlaying(false);
    setIsSpeaking(false);
    
    // 🔄 Restaurar landmarks originais
    if (faceData) {
      setCurrentLandmarks(faceData.landmarks);
      if (imageRef.current) {
        drawFaceWithLandmarks(imageRef.current, faceData.landmarks);
      }
    }
  };

  const exportAnimation = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Criar link para download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facemotions-${selectedPhrase?.emotion || 'animation'}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  // Criar referência da imagem quando ela for carregada
  useEffect(() => {
    if (uploadedImage && imageRef.current) {
      const img = imageRef.current;
      img.onload = () => {
        if (currentLandmarks.length > 0) {
          drawFaceWithLandmarks(img, currentLandmarks, selectedPhrase?.emotion);
        }
      };
    }
  }, [uploadedImage, currentLandmarks, selectedPhrase]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-2xl">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🎭 FaceMotions
          </h2>
        </div>
        <p className="text-gray-600 text-xl mb-2">
          Expressões que falam - Animação Facial Baseada em Frases
        </p>
        <p className="text-sm text-gray-500">
          {!modelsLoaded && "Carregando modelos de IA..."}
          {modelsLoaded && !uploadedImage && "Faça upload de uma foto para começar"}
          {uploadedImage && !faceData && "Processando detecção facial..."}
          {faceData && "Selecione uma frase para animar a expressão!"}
        </p>
      </div>

      {/* Upload de imagem */}
      {!uploadedImage && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 text-center mb-8 border-2 border-dashed border-purple-300">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={!modelsLoaded}
          />
          <div className="text-6xl mb-4">📸</div>
          <h3 className="text-2xl font-bold text-purple-700 mb-3">
            Carregue uma Foto de Rosto
          </h3>
          <p className="text-purple-600 mb-6">
            Escolha uma imagem clara com um rosto visível para começar a magia!
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!modelsLoaded}
            className={`${
              modelsLoaded
                ? 'bg-purple-500 hover:bg-purple-600 cursor-pointer hover:scale-105'
                : 'bg-gray-400 cursor-not-allowed'
            } text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center gap-3 mx-auto`}
          >
            <Upload className="w-6 h-6" />
            {modelsLoaded ? 'Escolher Imagem' : 'Carregando...'}
          </button>
        </div>
      )}

      {/* Processamento */}
      {isProcessing && (
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center mb-8">
          <div className="animate-spin text-4xl mb-4">🔄</div>
          <p className="text-lg font-medium text-gray-600">
            Detectando pontos faciais... Isso pode levar alguns segundos.
          </p>
        </div>
      )}

      {/* Canvas de visualização */}
      {uploadedImage && (
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex justify-center mb-4">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto rounded-2xl shadow-md border-2 border-gray-200"
              />
              <img
                ref={imageRef}
                src={uploadedImage}
                alt="Uploaded"
                className="hidden"
                crossOrigin="anonymous"
              />
            </div>
            
            {/* Controle de Estilo de Animação */}
            <div className="flex justify-center mb-6">
              <div className="bg-gray-100 rounded-2xl p-2 flex">
                <button
                  onClick={() => setUseStopMotion(true)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                    useStopMotion
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Film className="w-4 h-4" />
                  Stop Motion (8 FPS)
                </button>
                <button
                  onClick={() => setUseStopMotion(false)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                    !useStopMotion
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Fluida (60 FPS)
                </button>
              </div>
            </div>

            {/* Controles */}
            <div className="flex justify-center gap-4 flex-wrap">
              {isPlaying && (
                <button
                  onClick={stopAnimation}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  <Pause className="w-5 h-5" />
                  Parar
                </button>
              )}
              
              {faceData && (
                <button
                  onClick={exportAnimation}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Exportar
                </button>
              )}
              
              <button
                onClick={() => {
                  setUploadedImage(null);
                  setFaceData(null);
                  setSelectedPhrase(null);
                  stopAnimation();
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Nova Imagem
              </button>
              
              {isSpeaking && (
                <div className="bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
                  <Volume2 className="w-5 h-5 animate-pulse" />
                  Falando...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Galeria de frases */}
      {faceData && (
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-center mb-6 text-purple-700">
            🗣️ Frases Mágicas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PHRASE_EMOTION_MAP.map((phraseData, index) => (
              <div
                key={index}
                className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 ${
                  isPlaying
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-lg transform hover:-translate-y-1'
                } ${
                  phraseData.emotion === 'happy' ? 'bg-yellow-100 border-yellow-300' :
                  phraseData.emotion === 'sad' ? 'bg-blue-100 border-blue-300' :
                  phraseData.emotion === 'angry' ? 'bg-red-100 border-red-300' :
                  phraseData.emotion === 'surprised' ? 'bg-orange-100 border-orange-300' :
                  phraseData.emotion === 'fearful' ? 'bg-purple-100 border-purple-300' :
                  phraseData.emotion === 'disgusted' ? 'bg-green-100 border-green-300' :
                  'bg-gray-100 border-gray-300'
                } border-2`}
                onClick={() => !isPlaying && handlePhraseSelect(phraseData)}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">
                    {phraseData.emotion === 'happy' ? '😊' :
                     phraseData.emotion === 'sad' ? '😢' :
                     phraseData.emotion === 'angry' ? '😠' :
                     phraseData.emotion === 'surprised' ? '😲' :
                     phraseData.emotion === 'fearful' ? '😨' :
                     phraseData.emotion === 'disgusted' ? '🤢' :
                     '😐'}
                  </div>
                  <p className="font-medium text-gray-800 mb-2">
                    "{phraseData.phrase}"
                  </p>
                  <div className="flex justify-center items-center gap-2">
                    <Play className="w-4 h-4" />
                    <span className="text-sm text-gray-600 capitalize">
                      {phraseData.emotion}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informações sobre o sistema */}
      <div className="mt-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl p-6">
        <h3 className="text-2xl font-bold text-center mb-4 text-purple-700">
          🎯 Como Funciona o FaceMotions com Stop Motion?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
          <div className="bg-white bg-opacity-50 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-2">🔍</div>
            <p><strong>Detecção:</strong> IA identifica 68 pontos faciais</p>
          </div>
          <div className="bg-white bg-opacity-50 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-2">🎭</div>
            <p><strong>Mapeamento:</strong> Frases são ligadas a emoções</p>
          </div>
          <div className="bg-white bg-opacity-50 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-2">🎬</div>
            <p><strong>Stop Motion:</strong> Animação em 8 FPS artesanal</p>
          </div>
          <div className="bg-white bg-opacity-50 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-2">📳</div>
            <p><strong>Jitter:</strong> Tremor natural para realismo</p>
          </div>
          <div className="bg-white bg-opacity-50 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-2">🔊</div>
            <p><strong>TTS:</strong> Voz sincronizada perfeitamente</p>
          </div>
        </div>
        <div className="mt-6 text-center">
          <div className="bg-orange-100 rounded-2xl p-4 inline-block">
            <p className="text-sm text-orange-700">
              <strong>🎨 Estética Stop Motion:</strong> Movimentos discretos em quadros, 
              simulando animação artesanal de bonecos com tremor característico para máximo realismo!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
