import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';

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

interface AnimationCanvasProps {
  imageUrl: string;
  skeleton: SkeletonPoints;
  animationType: string | null;
  onAnimationComplete: () => void;
}

export default function AnimationCanvas({ 
  imageUrl, 
  skeleton, 
  animationType, 
  onAnimationComplete 
}: AnimationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [currentSkeleton, setCurrentSkeleton] = useState<SkeletonPoints>(skeleton);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationTime, setAnimationTime] = useState(0);

  const connections = [
    ['head', 'leftShoulder'], ['head', 'rightShoulder'],
    ['leftShoulder', 'rightShoulder'], ['leftShoulder', 'hip'], ['rightShoulder', 'hip'],
    ['leftShoulder', 'leftElbow'], ['leftElbow', 'leftWrist'],
    ['rightShoulder', 'rightElbow'], ['rightElbow', 'rightWrist'],
    ['hip', 'leftKnee'], ['leftKnee', 'leftAnkle'],
    ['hip', 'rightKnee'], ['rightKnee', 'rightAnkle']
  ];

  const getAnimationFrame = useCallback((time: number, type: string): SkeletonPoints => {
    const baseSkeleton = { ...skeleton };
    
    switch (type) {
      case 'jump': {
        const jumpHeight = Math.sin(time * 4) * 0.1;
        const armSwing = Math.sin(time * 4) * 0.05;
        
        return {
          ...baseSkeleton,
          head: { x: baseSkeleton.head.x, y: baseSkeleton.head.y - jumpHeight },
          leftShoulder: { x: baseSkeleton.leftShoulder.x, y: baseSkeleton.leftShoulder.y - jumpHeight },
          rightShoulder: { x: baseSkeleton.rightShoulder.x, y: baseSkeleton.rightShoulder.y - jumpHeight },
          leftWrist: { x: baseSkeleton.leftWrist.x - armSwing, y: baseSkeleton.leftWrist.y - jumpHeight },
          rightWrist: { x: baseSkeleton.rightWrist.x + armSwing, y: baseSkeleton.rightWrist.y - jumpHeight },
          hip: { x: baseSkeleton.hip.x, y: baseSkeleton.hip.y - jumpHeight },
          leftKnee: { x: baseSkeleton.leftKnee.x, y: baseSkeleton.leftKnee.y - jumpHeight * 0.5 },
          rightKnee: { x: baseSkeleton.rightKnee.x, y: baseSkeleton.rightKnee.y - jumpHeight * 0.5 },
          leftAnkle: { x: baseSkeleton.leftAnkle.x, y: baseSkeleton.leftAnkle.y - jumpHeight * 0.3 },
          rightAnkle: { x: baseSkeleton.rightAnkle.x, y: baseSkeleton.rightAnkle.y - jumpHeight * 0.3 }
        };
      }
      
      case 'wave': {
        const waveMotion = Math.sin(time * 3) * 0.1;
        const armLift = Math.sin(time * 3) * 0.15;
        
        return {
          ...baseSkeleton,
          rightElbow: { x: baseSkeleton.rightElbow.x + waveMotion, y: baseSkeleton.rightElbow.y - armLift },
          rightWrist: { x: baseSkeleton.rightWrist.x + waveMotion * 1.5, y: baseSkeleton.rightWrist.y - armLift * 1.5 }
        };
      }
      
      case 'dance': {
        const sway = Math.sin(time * 2) * 0.03;
        const armDance = Math.sin(time * 2.5) * 0.08;
        
        return {
          ...baseSkeleton,
          leftWrist: { x: baseSkeleton.leftWrist.x - armDance, y: baseSkeleton.leftWrist.y - Math.abs(armDance) },
          rightWrist: { x: baseSkeleton.rightWrist.x + armDance, y: baseSkeleton.rightWrist.y - Math.abs(armDance) },
          hip: { x: baseSkeleton.hip.x + sway, y: baseSkeleton.hip.y },
          leftKnee: { x: baseSkeleton.leftKnee.x + sway, y: baseSkeleton.leftKnee.y },
          rightKnee: { x: baseSkeleton.rightKnee.x + sway, y: baseSkeleton.rightKnee.y }
        };
      }
      
      case 'march': {
        const legLift = Math.sin(time * 3) * 0.1;
        const armSwing = Math.sin(time * 3) * 0.05;
        
        return {
          ...baseSkeleton,
          leftKnee: { x: baseSkeleton.leftKnee.x, y: baseSkeleton.leftKnee.y - Math.max(0, legLift) },
          rightKnee: { x: baseSkeleton.rightKnee.x, y: baseSkeleton.rightKnee.y - Math.max(0, -legLift) },
          leftWrist: { x: baseSkeleton.leftWrist.x + armSwing, y: baseSkeleton.leftWrist.y },
          rightWrist: { x: baseSkeleton.rightWrist.x - armSwing, y: baseSkeleton.rightWrist.y }
        };
      }
      
      case 'spin': {
        const spinAngle = time * 2;
        const radius = 0.1;
        
        return {
          ...baseSkeleton,
          leftWrist: {
            x: baseSkeleton.leftShoulder.x + Math.cos(spinAngle) * radius,
            y: baseSkeleton.leftShoulder.y + Math.sin(spinAngle) * radius
          },
          rightWrist: {
            x: baseSkeleton.rightShoulder.x + Math.cos(spinAngle + Math.PI) * radius,
            y: baseSkeleton.rightShoulder.y + Math.sin(spinAngle + Math.PI) * radius
          }
        };
      }
      
      default:
        return baseSkeleton;
    }
  }, [skeleton]);

  const drawAnimation = useCallback(() => {
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
      
      // Desenhar pontos
      Object.entries(currentSkeleton).forEach(([key, point]) => {
        ctx.fillStyle = key.includes('eye') ? '#F59E0B' : '#EF4444';
        ctx.beginPath();
        ctx.arc(point.x * canvas.width, point.y * canvas.height, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Borda branca
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    };
    img.src = imageUrl;
  }, [currentSkeleton, imageUrl, connections]);

  useEffect(() => {
    drawAnimation();
  }, [drawAnimation]);

  const animate = useCallback(() => {
    if (!isPlaying || !animationType) return;
    
    const newTime = animationTime + 0.016; // ~60fps
    setAnimationTime(newTime);
    
    const newSkeleton = getAnimationFrame(newTime, animationType);
    setCurrentSkeleton(newSkeleton);
    
    animationRef.current = requestAnimationFrame(animate);
  }, [isPlaying, animationType, animationTime, getAnimationFrame]);

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
    if (animationType) {
      setIsPlaying(true);
    }
  }, [animationType]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const resetAnimation = () => {
    setIsPlaying(false);
    setAnimationTime(0);
    setCurrentSkeleton(skeleton);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-green-600 mb-2">
          🎬 Prévia da Animação
        </h2>
        <p className="text-gray-600 text-lg">
          {animationType ? `Animação: ${animationType}` : 'Selecione uma animação'}
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
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
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
    </div>
  );
}