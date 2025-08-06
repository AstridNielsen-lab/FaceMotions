import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Save, RotateCcw } from 'lucide-react';

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

interface SkeletonEditorProps {
  imageUrl: string;
  onSkeletonSaved: (skeleton: SkeletonPoints) => void;
}

export default function SkeletonEditor({ imageUrl, onSkeletonSaved }: SkeletonEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // Pontos iniciais do esqueleto (proporções relativas)
  const [skeleton, setSkeleton] = useState<SkeletonPoints>({
    head: { x: 0.5, y: 0.15 },
    leftEye: { x: 0.47, y: 0.13 },
    rightEye: { x: 0.53, y: 0.13 },
    leftShoulder: { x: 0.42, y: 0.28 },
    rightShoulder: { x: 0.58, y: 0.28 },
    leftElbow: { x: 0.35, y: 0.45 },
    rightElbow: { x: 0.65, y: 0.45 },
    leftWrist: { x: 0.32, y: 0.62 },
    rightWrist: { x: 0.68, y: 0.62 },
    hip: { x: 0.5, y: 0.55 },
    leftKnee: { x: 0.45, y: 0.75 },
    rightKnee: { x: 0.55, y: 0.75 },
    leftAnkle: { x: 0.43, y: 0.92 },
    rightAnkle: { x: 0.57, y: 0.92 }
  });

  const connections = [
    ['head', 'leftShoulder'], ['head', 'rightShoulder'],
    ['leftShoulder', 'rightShoulder'], ['leftShoulder', 'hip'], ['rightShoulder', 'hip'],
    ['leftShoulder', 'leftElbow'], ['leftElbow', 'leftWrist'],
    ['rightShoulder', 'rightElbow'], ['rightElbow', 'rightWrist'],
    ['hip', 'leftKnee'], ['leftKnee', 'leftAnkle'],
    ['hip', 'rightKnee'], ['rightKnee', 'rightAnkle']
  ];

  const drawSkeleton = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) return;
    
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
        const startPoint = skeleton[start as keyof SkeletonPoints];
        const endPoint = skeleton[end as keyof SkeletonPoints];
        
        ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
        ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
      });
      
      ctx.stroke();
      
      // Desenhar pontos
      Object.entries(skeleton).forEach(([key, point]) => {
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
  }, [skeleton, imageUrl, imageLoaded]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    drawSkeleton();
  }, [drawSkeleton]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvas.width;
    const y = (e.clientY - rect.top) / canvas.height;
    
    // Verificar qual ponto está sendo clicado
    const clickedPoint = Object.entries(skeleton).find(([, point]) => {
      const distance = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2);
      return distance < 0.03; // Tolerância de clique
    });
    
    if (clickedPoint) {
      setIsDragging(true);
      setDragIndex(clickedPoint[0]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragIndex) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / canvas.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / canvas.height));
    
    setSkeleton(prev => ({
      ...prev,
      [dragIndex]: { x, y }
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragIndex(null);
  };

  const resetSkeleton = () => {
    setSkeleton({
      head: { x: 0.5, y: 0.15 },
      leftEye: { x: 0.47, y: 0.13 },
      rightEye: { x: 0.53, y: 0.13 },
      leftShoulder: { x: 0.42, y: 0.28 },
      rightShoulder: { x: 0.58, y: 0.28 },
      leftElbow: { x: 0.35, y: 0.45 },
      rightElbow: { x: 0.65, y: 0.45 },
      leftWrist: { x: 0.32, y: 0.62 },
      rightWrist: { x: 0.68, y: 0.62 },
      hip: { x: 0.5, y: 0.55 },
      leftKnee: { x: 0.45, y: 0.75 },
      rightKnee: { x: 0.55, y: 0.75 },
      leftAnkle: { x: 0.43, y: 0.92 },
      rightAnkle: { x: 0.57, y: 0.92 }
    });
  };

  const saveSkeleton = () => {
    onSkeletonSaved(skeleton);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-blue-600 mb-2">
          🎯 Ajuste os Pontos do Esqueleto
        </h2>
        <p className="text-gray-600 text-lg">
          Arraste os pontos para as articulações do seu desenho
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="w-full h-auto cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={resetSkeleton}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Resetar
        </button>
        <button
          onClick={saveSkeleton}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          Salvar Esqueleto
        </button>
      </div>
    </div>
  );
}