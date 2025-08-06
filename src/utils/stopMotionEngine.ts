/**
 * 🎬 Stop Motion Animation Engine
 * Sistema para criar animações com estética artesanal de stop motion
 * Características: quadros discretos, movimentos "engasgados", 6-12 FPS
 */

export interface StopMotionFrame {
  landmarks: Array<{x: number, y: number}>;
  timestamp: number;
  frameNumber: number;
}

export interface StopMotionSequence {
  frames: StopMotionFrame[];
  duration: number;
  fps: number;
  emotion?: string;
}

export class StopMotionEngine {
  private currentSequence: StopMotionSequence | null = null;
  private isPlaying: boolean = false;
  private frameIndex: number = 0;
  private animationId: number | null = null;
  private lastFrameTime: number = 0;
  private onFrameUpdate?: (frame: StopMotionFrame) => void;
  
  // Configurações de Stop Motion
  private readonly TARGET_FPS = 8; // 8 FPS para efeito stop motion
  private readonly FRAME_DURATION = 1000 / this.TARGET_FPS; // ~125ms por frame
  
  /**
   * 🎭 Gera uma sequência de frames para uma expressão facial
   */
  generateFacialSequence(
    originalLandmarks: Array<{x: number, y: number}>,
    emotion: string,
    intensity: number,
    durationMs: number = 2000
  ): StopMotionSequence {
    const totalFrames = Math.floor((durationMs / 1000) * this.TARGET_FPS);
    const frames: StopMotionFrame[] = [];
    
    console.log(`🎬 Gerando sequência Stop Motion: ${totalFrames} frames para "${emotion}"`);
    
    for (let i = 0; i < totalFrames; i++) {
      const progress = i / (totalFrames - 1);
      const frameTime = i * this.FRAME_DURATION;
      
      // Aplicar deformação discreta baseada na emoção
      const deformedLandmarks = this.applyEmotionDeformation(
        originalLandmarks,
        emotion,
        intensity,
        progress
      );
      
      // Adicionar "jitter" característico do stop motion
      const jitteredLandmarks = this.addStopMotionJitter(deformedLandmarks, i);
      
      frames.push({
        landmarks: jitteredLandmarks,
        timestamp: frameTime,
        frameNumber: i
      });
    }
    
    return {
      frames,
      duration: durationMs,
      fps: this.TARGET_FPS,
      emotion
    };
  }
  
  /**
   * 🤖 Gera sequência para movimentação corporal
   */
  generateBodySequence(
    bodyPoints: Array<{x: number, y: number}>,
    movement: string,
    intensity: number,
    durationMs: number = 3000
  ): StopMotionSequence {
    const totalFrames = Math.floor((durationMs / 1000) * this.TARGET_FPS);
    const frames: StopMotionFrame[] = [];
    
    console.log(`🕺 Gerando sequência corporal: ${totalFrames} frames para "${movement}"`);
    
    for (let i = 0; i < totalFrames; i++) {
      const progress = i / (totalFrames - 1);
      const frameTime = i * this.FRAME_DURATION;
      
      // Aplicar movimentação corporal discreta
      const movedPoints = this.applyBodyMovement(
        bodyPoints,
        movement,
        intensity,
        progress
      );
      
      // Adicionar tremor artesanal
      const jitteredPoints = this.addStopMotionJitter(movedPoints, i);
      
      frames.push({
        landmarks: jitteredPoints,
        timestamp: frameTime,
        frameNumber: i
      });
    }
    
    return {
      frames,
      duration: durationMs,
      fps: this.TARGET_FPS,
      emotion: movement
    };
  }
  
  /**
   * ▶️ Reproduz uma sequência de stop motion
   */
  playSequence(
    sequence: StopMotionSequence,
    onFrameUpdate: (frame: StopMotionFrame) => void,
    onComplete?: () => void
  ): void {
    this.currentSequence = sequence;
    this.onFrameUpdate = onFrameUpdate;
    this.isPlaying = true;
    this.frameIndex = 0;
    this.lastFrameTime = performance.now();
    
    console.log(`▶️ Iniciando reprodução Stop Motion: ${sequence.frames.length} frames`);
    
    const animate = (currentTime: number) => {
      if (!this.isPlaying || !this.currentSequence) {
        if (onComplete) onComplete();
        return;
      }
      
      const elapsed = currentTime - this.lastFrameTime;
      
      // Controle rigoroso de FPS - só avança frame quando necessário
      if (elapsed >= this.FRAME_DURATION) {
        const currentFrame = this.currentSequence.frames[this.frameIndex];
        
        if (currentFrame && this.onFrameUpdate) {
          this.onFrameUpdate(currentFrame);
          console.log(`🎭 Frame ${this.frameIndex + 1}/${this.currentSequence.frames.length}`);
        }
        
        this.frameIndex++;
        this.lastFrameTime = currentTime;
        
        // Verifica se terminou a sequência
        if (this.frameIndex >= this.currentSequence.frames.length) {
          this.stop();
          if (onComplete) onComplete();
          return;
        }
      }
      
      this.animationId = requestAnimationFrame(animate);
    };
    
    this.animationId = requestAnimationFrame(animate);
  }
  
  /**
   * ⏹️ Para a reprodução
   */
  stop(): void {
    this.isPlaying = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    console.log('⏹️ Animação Stop Motion parada');
  }
  
  /**
   * ⏸️ Pausa/Resume
   */
  togglePause(): boolean {
    this.isPlaying = !this.isPlaying;
    
    if (this.isPlaying && this.currentSequence) {
      // Resume
      this.lastFrameTime = performance.now();
      const animate = (currentTime: number) => {
        if (!this.isPlaying || !this.currentSequence) return;
        
        const elapsed = currentTime - this.lastFrameTime;
        
        if (elapsed >= this.FRAME_DURATION) {
          const currentFrame = this.currentSequence.frames[this.frameIndex];
          
          if (currentFrame && this.onFrameUpdate) {
            this.onFrameUpdate(currentFrame);
          }
          
          this.frameIndex++;
          this.lastFrameTime = currentTime;
          
          if (this.frameIndex >= this.currentSequence.frames.length) {
            this.stop();
            return;
          }
        }
        
        this.animationId = requestAnimationFrame(animate);
      };
      
      this.animationId = requestAnimationFrame(animate);
    }
    
    return this.isPlaying;
  }
  
  /**
   * 🎨 Aplica deformações de emoção de forma discreta
   */
  private applyEmotionDeformation(
    landmarks: Array<{x: number, y: number}>,
    emotion: string,
    intensity: number,
    progress: number
  ): Array<{x: number, y: number}> {
    // Curva de animação stop motion - movimento em degraus
    const stepProgress = Math.floor(progress * 6) / 6; // 6 steps discretos
    const amplitude = intensity * 0.03;
    
    return landmarks.map((point, index) => {
      let deltaX = 0;
      let deltaY = 0;
      
      switch (emotion) {
        case 'happy':
          if (index >= 48 && index <= 54) { // Boca superior
            deltaY = -amplitude * Math.sin(stepProgress * Math.PI) * 0.8;
          }
          if (index >= 55 && index <= 59) { // Boca inferior
            deltaY = amplitude * Math.sin(stepProgress * Math.PI) * 0.5;
          }
          // Rugas dos olhos (sorriso)
          if (index >= 36 && index <= 41) {
            deltaX = amplitude * Math.sin(stepProgress * Math.PI) * 0.3;
          }
          break;
          
        case 'sad':
          if (index >= 48 && index <= 67) { // Boca para baixo
            deltaY = amplitude * Math.sin(stepProgress * Math.PI) * 0.7;
          }
          if (index >= 17 && index <= 26) { // Sobrancelhas inclinadas
            const side = index < 22 ? 1 : -1;
            deltaY = -amplitude * Math.sin(stepProgress * Math.PI) * 0.4;
            deltaX = amplitude * Math.sin(stepProgress * Math.PI) * 0.2 * side;
          }
          break;
          
        case 'angry':
          if (index >= 17 && index <= 26) { // Sobrancelhas franzidas
            const side = index < 22 ? -1 : 1;
            deltaY = amplitude * Math.sin(stepProgress * Math.PI) * 0.5;
            deltaX = amplitude * Math.sin(stepProgress * Math.PI) * 0.3 * side;
          }
          break;
          
        case 'surprised':
          if (index >= 36 && index <= 47) { // Olhos arregalados
            const isUpper = (index <= 41) || (index >= 43 && index <= 47);
            deltaY = isUpper 
              ? -amplitude * Math.sin(stepProgress * Math.PI) 
              : amplitude * Math.sin(stepProgress * Math.PI);
          }
          if (index >= 60 && index <= 67) { // Boca aberta
            deltaY = amplitude * Math.sin(stepProgress * Math.PI) * 1.2;
          }
          break;
      }
      
      return {
        x: point.x + deltaX,
        y: point.y + deltaY
      };
    });
  }
  
  /**
   * 🕺 Aplica movimentações corporais discretas
   */
  private applyBodyMovement(
    bodyPoints: Array<{x: number, y: number}>,
    movement: string,
    intensity: number,
    progress: number
  ): Array<{x: number, y: number}> {
    // Animação em steps para efeito stop motion
    const stepProgress = Math.floor(progress * 8) / 8; // 8 steps para corpo
    const amplitude = intensity * 0.05;
    
    return bodyPoints.map((point, index) => {
      let deltaX = 0;
      let deltaY = 0;
      
      switch (movement) {
        case 'wave_hand':
          // Índices 9-10 são mão direita no MediaPipe
          if (index === 9 || index === 10) {
            deltaX = amplitude * Math.sin(stepProgress * Math.PI * 2) * 2;
            deltaY = -amplitude * Math.sin(stepProgress * Math.PI * 2) * 1.5;
          }
          break;
          
        case 'jump':
          // Todo o corpo sobe e desce
          deltaY = -amplitude * Math.sin(stepProgress * Math.PI) * 3;
          break;
          
        case 'dance':
          // Movimento alternado dos braços
          if (index === 9 || index === 10) { // Braço direito
            deltaX = amplitude * Math.sin(stepProgress * Math.PI * 2) * 1.5;
          }
          if (index === 7 || index === 8) { // Braço esquerdo
            deltaX = -amplitude * Math.sin(stepProgress * Math.PI * 2) * 1.5;
          }
          break;
      }
      
      return {
        x: point.x + deltaX,
        y: point.y + deltaY
      };
    });
  }
  
  /**
   * 📳 Adiciona tremor artesanal característico do stop motion
   */
  private addStopMotionJitter(
    points: Array<{x: number, y: number}>,
    frameIndex: number
  ): Array<{x: number, y: number}> {
    const jitterIntensity = 0.001; // Tremor muito sutil
    
    return points.map((point, index) => {
      // Usar frameIndex e index como seed para tremor consistente
      const seedX = Math.sin(frameIndex * 0.7 + index * 0.3) * jitterIntensity;
      const seedY = Math.cos(frameIndex * 0.5 + index * 0.4) * jitterIntensity;
      
      return {
        x: point.x + seedX,
        y: point.y + seedY
      };
    });
  }
  
  /**
   * 📊 Status da reprodução
   */
  getStatus() {
    return {
      isPlaying: this.isPlaying,
      currentFrame: this.frameIndex,
      totalFrames: this.currentSequence?.frames.length || 0,
      progress: this.currentSequence 
        ? this.frameIndex / this.currentSequence.frames.length 
        : 0
    };
  }
}

// Instância singleton para uso global
export const stopMotionEngine = new StopMotionEngine();
