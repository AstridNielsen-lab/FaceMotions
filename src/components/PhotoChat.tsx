import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Send, Mic, MicOff, Volume2, VolumeX, User, Bot, Camera, Sparkles, RotateCcw, Download, Copy } from 'lucide-react';
import * as faceapi from 'face-api.js';

interface FaceLandmark {
  x: number;
  y: number;
}

interface FaceData {
  landmarks: FaceLandmark[];
  expressions: { [key: string]: number };
  age?: number;
  gender?: string;
  emotion?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Configuração da API Gemini
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
const API_KEY = "AIzaSyDiDnwoHz4k1BdKvnk5z-5XMKJRJxbYoE4";

export default function PhotoChat() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [faceData, setFaceData] = useState<FaceData | null>(null);
  const [currentLandmarks, setCurrentLandmarks] = useState<FaceLandmark[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [savedImageBase64, setSavedImageBase64] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Funções para LocalStorage
  const saveImageToLocalStorage = (imageBase64: string) => {
    try {
      localStorage.setItem('photochat_image', imageBase64);
      setSavedImageBase64(imageBase64);
      console.log('💾 Imagem salva no LocalStorage');
    } catch (error) {
      console.error('❌ Erro ao salvar imagem no LocalStorage:', error);
    }
  };

  const loadImageFromLocalStorage = (): string | null => {
    try {
      const savedImage = localStorage.getItem('photochat_image');
      if (savedImage) {
        setSavedImageBase64(savedImage);
        console.log('📂 Imagem carregada do LocalStorage');
        return savedImage;
      }
    } catch (error) {
      console.error('❌ Erro ao carregar imagem do LocalStorage:', error);
    }
    return null;
  };

  const clearImageFromLocalStorage = () => {
    try {
      localStorage.removeItem('photochat_image');
      setSavedImageBase64(null);
      console.log('🗑️ Imagem removida do LocalStorage');
    } catch (error) {
      console.error('❌ Erro ao remover imagem do LocalStorage:', error);
    }
  };

  // Carregar imagem salva do LocalStorage ao inicializar
  useEffect(() => {
    loadImageFromLocalStorage();
  }, []);

  // Carregar modelos do face-api.js
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
          faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar modelos:', error);
      }
    };
    
    loadModels();
  }, []);

  // Configurar reconhecimento de voz
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'pt-BR';
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
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
            .withFaceExpressions()
            .withAgeAndGender();

          if (detections) {
            const landmarks = detections.landmarks.positions.map(point => ({
              x: point.x / img.width,
              y: point.y / img.height
            }));
            
            // Encontrar emoção dominante
            const expressions = detections.expressions;
            const dominantEmotion = Object.keys(expressions).reduce((a, b) => 
              expressions[a] > expressions[b] ? a : b
            );
            
            const faceInfo = {
              landmarks,
              expressions,
              age: Math.round(detections.age),
              gender: detections.gender,
              emotion: dominantEmotion
            };
            
            setFaceData(faceInfo);
            setCurrentLandmarks(landmarks);
            drawFaceWithLandmarks(img, landmarks);
            
            // Mensagem de boas-vindas automática
            const welcomeMessage = await generateWelcomeMessage(faceInfo);
            addMessage('assistant', welcomeMessage);
            
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

  const drawFaceWithLandmarks = (img: HTMLImageElement, landmarks: FaceLandmark[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajustar tamanho do canvas
    const maxSize = 400;
    const scale = Math.min(maxSize / img.width, maxSize / img.height);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Desenhar imagem
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Desenhar landmarks
    ctx.fillStyle = '#00ff88';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    
    landmarks.forEach((point, index) => {
      const x = point.x * canvas.width;
      const y = point.y * canvas.height;
      
      // Pontos principais maiores
      if (isKeyLandmark(index)) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      } else {
        // Pontos menores
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };

  const isKeyLandmark = (index: number): boolean => {
    return (
      (index >= 36 && index <= 47) || // Olhos
      (index >= 27 && index <= 35) || // Nariz
      (index >= 48 && index <= 67)    // Boca
    );
  };

  const generateWelcomeMessage = async (faceInfo: FaceData): Promise<string> => {
    console.log('🔍 Iniciando geração de mensagem de boas-vindas...');
    
    const imageBase64 = await getImageAsBase64();
    console.log('📸 Base64 da imagem:', imageBase64 ? `Sucesso (${imageBase64.length} chars)` : 'Erro - vazio');
    
    const prompt = `Você é a pessoa desta foto. Analise a imagem e se apresente como se fosse você mesmo(a) na foto, mas de uma forma amigável para crianças. 

Informações detectadas:
- Idade estimada: ${faceInfo.age} anos
- Gênero: ${faceInfo.gender}
- Emoção dominante: ${faceInfo.emotion}

Fale como se você fosse a pessoa da foto, se apresentando de forma natural e carinhosa, adequada para crianças. Seja criativo(a) mas mantenha-se dentro dos limites adequados para o público infantil. Não mencione as informações técnicas, apenas seja você mesmo(a) baseado na foto.`;

    try {
      console.log('🚀 Chamando API Gemini...');
      const response = await callGeminiAPI(prompt, imageBase64);
      console.log('✅ Resposta da API:', response ? 'Sucesso' : 'Resposta vazia');
      return response || "Olá! Sou eu da foto! 😊 Que bom te conhecer! Como posso te ajudar hoje?";
    } catch (error) {
      console.error('❌ Erro ao gerar mensagem de boas-vindas:', error);
      return "Olá! Sou eu da foto! 😊 Que bom te conhecer! Como posso te ajudar hoje?";
    }
  };

  const getImageAsBase64 = async (): Promise<string> => {
    // Primeiro tenta usar imagem salva no LocalStorage
    if (savedImageBase64) {
      console.log('🔄 Usando imagem salva do LocalStorage');
      return savedImageBase64;
    }
    
    // Se não tiver imagem carregada, retorna vazio
    if (!uploadedImage) {
      console.log('⚠️ Nenhuma imagem disponível');
      return '';
    }
    
    console.log('🖼️ Convertendo imagem carregada para base64...');
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          console.log('❌ Erro ao obter contexto do canvas');
          resolve('');
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        
        // Salva a imagem no LocalStorage para uso futuro
        saveImageToLocalStorage(base64);
        console.log('✅ Imagem convertida e salva no LocalStorage');
        
        resolve(base64);
      };
      img.onerror = () => {
        console.log('❌ Erro ao carregar imagem para conversão');
        resolve('');
      };
      img.src = uploadedImage;
    });
  };

  const callGeminiAPI = async (prompt: string, imageBase64?: string): Promise<string> => {
    console.log('📋 Preparando requisição para Gemini...');
    console.log('🖼️ Imagem incluída:', imageBase64 ? 'Sim' : 'Não');
    
    const requestBody: any = {
      contents: [{
        parts: [
          { text: prompt }
        ]
      }]
    };

    if (imageBase64) {
      requestBody.contents[0].parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: imageBase64
        }
      });
      console.log('✅ Imagem adicionada ao payload');
    }

    console.log('🌐 Enviando requisição para:', API_URL);
    
    try {
      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 Status da resposta:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro da API:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📦 Dados recebidos:', data);
      
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Desculpe, não consegui entender.';
      console.log('✨ Texto extraído:', result.substring(0, 100) + '...');
      
      return result;
    } catch (error) {
      console.error('💥 Erro na chamada da API:', error);
      throw error;
    }
  };

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    
    // Auto-scroll para a última mensagem
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !faceData) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      const imageBase64 = await getImageAsBase64();
      
      const conversationContext = chatMessages.slice(-4).map(msg => 
        `${msg.role === 'user' ? 'Usuário' : 'Você'}: ${msg.content}`
      ).join('\n');

      const prompt = `Você é a pessoa desta foto conversando com uma criança. Continue sendo consistente com sua personalidade estabelecida.

Contexto da conversa anterior:
${conversationContext}

Nova pergunta/comentário da criança: "${userMessage}"

Responda como a pessoa da foto, mantendo o tom amigável e adequado para crianças. Seja natural, carinhoso(a) e responda de acordo com sua personalidade baseada na foto. Se a criança fizer perguntas sobre você, responda baseado no que você pode "ver" sobre si mesmo(a) na foto.`;

      const response = await callGeminiAPI(prompt, imageBase64);
      addMessage('assistant', response);
      
      // TTS opcional
      if (isSpeaking) {
        speakText(response);
      }
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      addMessage('assistant', 'Desculpe, tive um problema para responder. Pode tentar novamente?');
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  const resetAll = () => {
    setUploadedImage(null);
    setFaceData(null);
    setCurrentLandmarks([]);
    setChatMessages([]);
    setInputMessage('');
    clearImageFromLocalStorage(); // Limpa a imagem salva
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-gradient-to-r from-green-500 to-teal-500 p-3 rounded-2xl">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            💬 PhotoChat
          </h2>
        </div>
        <p className="text-gray-600 text-xl mb-2">
          Converse com suas fotos usando IA Gemini
        </p>
        <p className="text-sm text-gray-500">
          {!modelsLoaded && "Carregando modelos de IA..."}
          {modelsLoaded && !uploadedImage && "Faça upload de uma foto para começar a conversar"}
          {uploadedImage && !faceData && "Processando detecção facial..."}
          {faceData && "Sua foto está pronta para conversar!"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Painel da Foto */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-400 to-teal-500 p-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Camera className="w-6 h-6" />
              Sua Foto Inteligente
            </h3>
          </div>
          
          <div className="p-6">
            {!uploadedImage ? (
              <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-8 text-center border-2 border-dashed border-green-300">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={!modelsLoaded}
                />
                <div className="text-5xl mb-4">📷</div>
                <h3 className="text-xl font-bold text-green-700 mb-3">
                  Carregue uma Foto
                </h3>
                <p className="text-green-600 mb-6">
                  Escolha uma foto clara com rosto visível para começar a conversar!
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!modelsLoaded}
                  className={`${
                    modelsLoaded
                      ? 'bg-green-500 hover:bg-green-600 cursor-pointer hover:scale-105'
                      : 'bg-gray-400 cursor-not-allowed'
                  } text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 mx-auto`}
                >
                  <Upload className="w-5 h-5" />
                  {modelsLoaded ? 'Escolher Foto' : 'Carregando...'}
                </button>
              </div>
            ) : (
              <div>
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      className="max-w-full h-auto rounded-xl shadow-md border-2 border-green-200"
                    />
                    <img
                      ref={imageRef}
                      src={uploadedImage}
                      alt="Uploaded"
                      className="hidden"
                      crossOrigin="anonymous"
                    />
                    
                    {isProcessing && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="animate-spin text-2xl mb-2">🔄</div>
                          <p className="text-sm">Analisando rosto...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {faceData && (
                  <div className="bg-green-50 rounded-2xl p-4 mb-4">
                    <h4 className="font-bold text-green-700 mb-2">📊 Análise Facial:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-white rounded-lg p-2">
                        <span className="font-medium">Idade:</span> {faceData.age} anos
                      </div>
                      <div className="bg-white rounded-lg p-2">
                        <span className="font-medium">Gênero:</span> {faceData.gender}
                      </div>
                      <div className="bg-white rounded-lg p-2">
                        <span className="font-medium">Emoção:</span> {faceData.emotion}
                      </div>
                      <div className="bg-white rounded-lg p-2">
                        <span className="font-medium">Pontos:</span> {faceData.landmarks.length}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-center gap-3">
                  <button
                    onClick={resetAll}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Nova Foto
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Painel do Chat */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-teal-400 to-green-500 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Bot className="w-6 h-6" />
                Conversa
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsSpeaking(!isSpeaking)}
                  className={`p-2 rounded-lg transition-all ${
                    isSpeaking ? 'bg-white bg-opacity-20' : 'bg-white bg-opacity-10'
                  }`}
                >
                  {isSpeaking ? <Volume2 className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4 text-white" />}
                </button>
                <button
                  onClick={clearChat}
                  className="p-2 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-all"
                >
                  <RotateCcw className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col h-96">
            {/* Área de mensagens */}
            <div 
              ref={chatContainerRef}
              className="flex-1 p-4 overflow-y-auto space-y-4"
            >
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-sm">
                    {faceData ? 'A conversa começará assim que você enviar uma mensagem!' : 'Carregue uma foto primeiro para começar a conversar.'}
                  </p>
                </div>
              ) : (
                chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="text-sm">
                          {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            <button
                              onClick={() => copyMessage(message.content)}
                              className="opacity-50 hover:opacity-100 transition-opacity"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-gray-100">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Área de input */}
            {faceData && (
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  
                  {recognitionRef.current && (
                    <button
                      onClick={isListening ? stopListening : startListening}
                      className={`p-3 rounded-2xl transition-all duration-300 ${
                        isListening 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                  )}
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className={`p-3 rounded-2xl transition-all duration-300 ${
                      inputMessage.trim() && !isLoading
                        ? 'bg-green-500 text-white hover:bg-green-600 hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Informações sobre o sistema */}
      <div className="mt-8 bg-gradient-to-r from-green-100 to-teal-100 rounded-3xl p-6">
        <h3 className="text-2xl font-bold text-center mb-4 text-green-700">
          🤖 Como Funciona o PhotoChat?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-white bg-opacity-50 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-2">📸</div>
            <p><strong>Upload:</strong> Carregue uma foto com rosto visível</p>
          </div>
          <div className="bg-white bg-opacity-50 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-2">🔍</div>
            <p><strong>Análise:</strong> IA detecta características faciais</p>
          </div>
          <div className="bg-white bg-opacity-50 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-2">🧠</div>
            <p><strong>Gemini:</strong> IA assume personalidade da foto</p>
          </div>
          <div className="bg-white bg-opacity-50 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-2">💬</div>
            <p><strong>Conversa:</strong> Chat natural e inteligente</p>
          </div>
        </div>
      </div>
    </div>
  );
}
