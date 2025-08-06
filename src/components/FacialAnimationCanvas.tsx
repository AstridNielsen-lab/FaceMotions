import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Pause, Play, RotateCcw, Heart } from 'lucide-react';

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

interface FacialAnimationCanvasProps {
  imageUrl: string;
  skeleton: SkeletonPoints;
  emotionType: string | null;
  onAnimationComplete: () => void;
}

export default function FacialAnimationCanvas({ 
  imageUrl, 
  skeleton, 
  emotionType, 
  onAnimationComplete 
}: FacialAnimationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [currentSkeleton, setCurrentSkeleton] = useState<SkeletonPoints>(skeleton);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationTime, setAnimationTime] = useState(0);
  const [eyeState, setEyeState] = useState({ leftOpen: true, rightOpen: true });

  const connections = [
    ['head', 'leftShoulder'], ['head', 'rightShoulder'],
    ['leftShoulder', 'rightShoulder'], ['leftShoulder', 'hip'], ['rightShoulder', 'hip'],
    ['leftShoulder', 'leftElbow'], ['leftElbow', 'leftWrist'],
    ['rightShoulder', 'rightElbow'], ['rightElbow', 'rightWrist'],
    ['hip', 'leftKnee'], ['leftKnee', 'leftAnkle'],
    ['hip', 'rightKnee'], ['rightKnee', 'rightAnkle']
  ];

  const getEmotionFrame = useCallback((time: number, emotion: string): { skeleton: SkeletonPoints, eyeState: any } => {
    const baseSkeleton = { ...skeleton };
    let newEyeState = { leftOpen: true, rightOpen: true };
    
    switch (emotion) {
      case 'happy': {
        const bounce = Math.sin(time * 3) * 0.02;
        const eyeSquint = Math.sin(time * 2) * 0.01;
        
        return {
          skeleton: {
            ...baseSkeleton,
            head: { x: baseSkeleton.head.x, y: baseSkeleton.head.y + bounce },
            leftEye: { x: baseSkeleton.leftEye.x, y: baseSkeleton.leftEye.y + bounce + eyeSquint },
            rightEye: { x: baseSkeleton.rightEye.x, y: baseSkeleton.rightEye.y + bounce + eyeSquint }
          },
          eyeState: newEyeState
        };
      }
      
      case 'sad': {
        const droop = Math.sin(time * 1.5) * 0.01;
        const headTilt = Math.sin(time * 1) * 0.02;
        
        return {
          skeleton: {
            ...baseSkeleton,
            head: { x: baseSkeleton.head.x + headTilt, y: baseSkeleton.head.y + droop },
            leftEye: { x: baseSkeleton.leftEye.x + headTilt, y: baseSkeleton.leftEye.y + droop * 1.5 },
            rightEye: { x: baseSkeleton.rightEye.x + headTilt, y: baseSkeleton.rightEye.y + droop * 1.5 }
          },
          eyeState: newEyeState
        };
      }
      
      case 'surprised': {
        const shock = Math.sin(time * 8) * 0.005;
        const eyeWide = Math.sin(time * 4) * 0.02;
        
        return {
          skeleton: {
            ...baseSkeleton,
            head: { x: baseSkeleton.head.x + shock, y: baseSkeleton.head.y - Math.abs(eyeWide) },
            leftEye: { x: baseSkeleton.leftEye.x + shock, y: baseSkeleton.leftEye.y - Math.abs(eyeWide) * 1.5 },
            rightEye: { x: baseSkeleton.rightEye.x + shock, y: baseSkeleton.rightEye.y - Math.abs(eyeWide) * 1.5 }
          },
          eyeState: newEyeState
        };
      }
      
      case 'angry': {
        const shake = Math.sin(time * 10) * 0.01;
        const furrow = Math.sin(time * 2) * 0.015;
        
        return {
          skeleton: {
            ...baseSkeleton,
            head: { x: baseSkeleton.head.x + shake, y: baseSkeleton.head.y },
            leftEye: { x: baseSkeleton.leftEye.x + shake, y: baseSkeleton.leftEye.y - furrow },
            rightEye: { x: baseSkeleton.rightEye.x + shake, y: baseSkeleton.rightEye.y - furrow }
          },
          eyeState: newEyeState
        };
      }
      
      case 'sleepy': {
        const sway = Math.sin(time * 1) * 0.03;
        const blink = Math.sin(time * 2);
        newEyeState = { 
          leftOpen: blink > -0.3, 
          rightOpen: blink > -0.3 
        };
        
        return {
          skeleton: {
            ...baseSkeleton,
            head: { x: baseSkeleton.head.x + sway, y: baseSkeleton.head.y + Math.abs(sway) * 0.5 },
            leftEye: { x: baseSkeleton.leftEye.x + sway, y: baseSkeleton.leftEye.y + Math.abs(sway) * 0.5 },
            rightEye: { x: baseSkeleton.rightEye.x + sway, y: baseSkeleton.rightEye.y + Math.abs(sway) * 0.5 }
          },
          eyeState: newEyeState
        };
      }
      
      case 'wink': {
        const winkCycle = Math.sin(time * 2);
        newEyeState = { 
          leftOpen: true, 
          rightOpen: winkCycle > 0.5 
        };
        
        const tilt = Math.sin(time * 2) * 0.01;
        
        return {
          skeleton: {
            ...baseSkeleton,
            head: { x: baseSkeleton.head.x + tilt, y: baseSkeleton.head.y },
            leftEye: { x: baseSkeleton.leftEye.x + tilt, y: baseSkeleton.leftEye.y },
            rightEye: { x: baseSkeleton.rightEye.x + tilt, y: baseSkeleton.rightEye.y }
          },
          eyeState: newEyeState
        };
      }
      
      case 'laughing': {
        const laugh = Math.sin(time * 6) * 0.03;
        const eyeSquint = Math.sin(time * 6) * 0.02;
        
        return {
          skeleton: {
            ...baseSkeleton,
            head: { x: baseSkeleton.head.x, y: baseSkeleton.head.y + laugh },
            leftEye: { x: baseSkeleton.leftEye.x, y: baseSkeleton.leftEye.y + laugh + eyeSquint },
            rightEye: { x: baseSkeleton.rightEye.x, y: baseSkeleton.rightEye.y + laugh + eyeSquint },
            leftShoulder: { x: baseSkeleton.leftShoulder.x, y: baseSkeleton.leftShoulder.y + laugh * 0.5 },
            rightShoulder: { x: baseSkeleton.rightShoulder.x, y: baseSkeleton.rightShoulder.y + laugh * 0.5 }
          },
          eyeState: newEyeState
        };
      }
      
      case 'love': {
        const float = Math.sin(time * 2) * 0.02;
        const heartBeat = Math.sin(time * 4) * 0.01;
        
        return {
          skeleton: {
            ...baseSkeleton,
            head: { x: baseSkeleton.head.x, y: baseSkeleton.head.y + float },
            leftEye: { x: baseSkeleton.leftEye.x, y: baseSkeleton.leftEye.y + float + heartBeat },
            rightEye: { x: baseSkeleton.rightEye.x, y: baseSkeleton.rightEye.y + float + heartBeat }
          },
          eyeState: newEyeState
        };
      }
      
      default:
        return { skeleton: baseSkeleton, eyeState: newEyeState };
    }
  }, [skeleton]);

  const drawFacialAnimation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Desenhar a imagem
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;
      
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      
      // Desenhar conexões
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      connections.forEach(([start, end]) => {
        const startPoint = currentSkeleton[start as keyof SkeletonPoints];
        const endPoint = currentSkeleton[end as keyof SkeletonPoints];
        
        ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
        ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
      });
      
      ctx.stroke();
      
      // Desenhar pontos com estados especiais para olhos
      Object.entries(currentSkeleton).forEach(([key, point]) => {
        if (key === 'leftEye') {
          if (eyeState.leftOpen) {
            ctx.fillStyle = '#F59E0B';
            ctx.beginPath();
            ctx.arc(point.x * canvas.width, point.y * canvas.height, 8, 0, 2 * Math.PI);
            ctx.fill();
          } else {
            // Olho fechado - linha horizontal
            ctx.strokeStyle = '#F59E0B';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo((point.x * canvas.width) - 6, point.y * canvas.height);
            ctx.lineTo((point.x * canvas.width) + 6, point.y * canvas.height);
            ctx.stroke();
          }
        } else if (key === 'rightEye') {
          if (eyeState.rightOpen) {
            ctx.fillStyle = '#F59E0B';
            ctx.beginPath();
            ctx.arc(point.x * canvas.width, point.y * canvas.height, 8, 0, 2 * Math.PI);
            ctx.fill();
          } else {
            // Olho fechado - linha horizontal
            ctx.strokeStyle = '#F59E0B';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo((point.x * canvas.width) - 6, point.y * canvas.height);
            ctx.lineTo((point.x * canvas.width) + 6, point.y * canvas.height);
            ctx.stroke();
          }
        } else {
          ctx.fillStyle = '#EF4444';
          ctx.beginPath();
          ctx.arc(point.x * canvas.width, point.y * canvas.height, 8, 0, 2 * Math.PI);
          ctx.fill();
        }
        
        // Borda branca para todos os pontos visíveis
        if ((key === 'leftEye' && eyeState.leftOpen) || 
            (key === 'rightEye' && eyeState.rightOpen) || 
            (!key.includes('eye'))) {
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      // Efeitos especiais para certas emoções
      if (emotionType === 'love') {
        // Desenhar corações flutuantes
        const heartSize = 15 + Math.sin(animationTime * 4) * 3;
        ctx.fillStyle = '#FF69B4';
        ctx.font = `${heartSize}px Arial`;
        ctx.fillText('💖', currentSkeleton.head.x * canvas.width + 30, currentSkeleton.head.y * canvas.height - 20);
        ctx.fillText('💕', currentSkeleton.head.x * canvas.width - 40, currentSkeleton.head.y * canvas.height - 10);
      }
      
      if (emotionType === 'angry') {
        // Desenhar linhas de raiva
        ctx.strokeStyle = '#FF4444';
        ctx.lineWidth = 3;
        const anger = Math.sin(animationTime * 8) * 5;
        ctx.beginPath();
        ctx.moveTo(currentSkeleton.head.x * canvas.width - 20 + anger, currentSkeleton.head.y * canvas.height - 30);
        ctx.lineTo(currentSkeleton.head.x * canvas.width - 10 + anger, currentSkeleton.head.y * canvas.height - 40);
        ctx.moveTo(currentSkeleton.head.x * canvas.width + 20 - anger, currentSkeleton.head.y * canvas.height - 30);
        ctx.lineTo(currentSkeleton.head.x * canvas.width + 10 - anger, currentSkeleton.head.y * canvas.height - 40);
        ctx.stroke();
      }
    };
    img.src = imageUrl;
  }, [currentSkeleton, eyeState, imageUrl, connections, emotionType, animationTime]);

  useEffect(() => {
    drawFacialAnimation();
  }, [drawFacialAnimation]);

  const animate = useCallback(() => {
    if (!isPlaying || !emotionType) return;
    
    const newTime = animationTime + 0.016; // ~60fps
    setAnimationTime(newTime);
    
    const { skeleton: newSkeleton, eyeState: newEyeState } = getEmotionFrame(newTime, emotionType);
    setCurrentSkeleton(newSkeleton);
    setEyeState(newEyeState);
    
    animationRef.current = requestAnimationFrame(animate);
  }, [isPlaying, emotionType, animationTime, getEmotionFrame]);

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, isPlaying]);

  useEffect(() => {
    if (emotionType) {
      setIsPlaying(true);
    }
  }, [emotionType]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const resetAnimation = () => {
    setIsPlaying(false);
    setAnimationTime(0);
    setCurrentSkeleton(skeleton);
    setEyeState({ leftOpen: true, rightOpen: true });
  };

  const getEmotionName = (emotion: string) => {
    const emotions: { [key: string]: string } = {
      happy: 'Feliz',
      sad: 'Triste',
      surprised: 'Surpreso',
      angry: 'Bravo',
      sleepy: 'Sonolento',
      wink: 'Piscadinha',
      laughing: 'Gargalhada',
      love: 'Apaixonado'
    };
    return emotions[emotion] || emotion;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-pink-600 mb-2">
          🎭 Prévia da Emoção Facial
        </h2>
        <p className="text-gray-600 text-lg">
          {emotionType ? `Emoção: ${getEmotionName(emotionType)}` : 'Selecione uma emoção'}
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-auto"
        />
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={togglePlayPause}
          className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {isPlaying ? 'Pausar' : 'Reproduzir'}
        </button>
        <button
          onClick={resetAnimation}
          className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Resetar
        </button>
      </div>

      {emotionType === 'love' && (
        <div className="mt-6 text-center">
          <div className="bg-gradient-to-r from-pink-100 to-red-100 rounded-2xl p-4">
            <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
            <p className="text-pink-700 font-medium">
              Corações flutuantes aparecem quando seu personagem está apaixonado! 💕
            </p>
          </div>
        </div>
      )}
    </div>
  );
}