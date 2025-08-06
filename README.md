# 🎬 FaceMotions - AnimaKids

**Sistema de animação facial com estética Stop Motion para educação infantil**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)

## 🌟 Visão Geral

O **FaceMotions** é uma plataforma interativa desenvolvida especialmente para crianças, que combina reconhecimento facial, inteligência artificial e animações artesanais no estilo **Stop Motion**. O projeto oferece duas funcionalidades principais:

### 🎭 **FaceMotions**
Sistema de expressões faciais animadas baseadas em frases faladas, com detecção de 68 pontos faciais e síntese de voz.

### 🤖 **PhotoChat** 
Conversa inteligente com fotos usando a API Gemini do Google, permitindo que crianças conversem com suas próprias imagens.

## ✨ Funcionalidades Principais

### 🎬 **Sistema Stop Motion Artesanal**
- **8 FPS** para estética nostálgica e artesanal
- **Quadros discretos** que simulam animação manual
- **Tremor natural (jitter)** para máximo realismo
- **Alternância** entre Stop Motion e animação fluida

### 🎭 **FaceMotions Features**
- 👤 **Reconhecimento facial** com 68 pontos de referência
- 🗣️ **12 frases pré-definidas** com emoções mapeadas
- 🎨 **Efeitos visuais** dinâmicos (sparkles, lágrimas, etc.)
- 🔊 **Text-to-Speech** sincronizado com expressões
- 🎤 **Speech-to-Text** para interação por voz
- 📱 **Interface responsiva** e amigável para crianças

### 🤖 **PhotoChat Features**
- 📸 **Upload de fotos** com análise facial automática
- 🧠 **IA Gemini** para personalidade baseada na foto
- 💬 **Chat conversacional** natural e educativo
- 💾 **LocalStorage** para persistência de dados
- 🔊 **TTS integrado** para acessibilidade
- 🎤 **Reconhecimento de voz** para facilitar interação

## 🚀 Tecnologias Utilizadas

### **Frontend**
- **React 18** com Hooks modernos
- **TypeScript** para type safety
- **Tailwind CSS** para estilização responsiva
- **Vite** para build otimizado

### **IA e Reconhecimento**
- **face-api.js** para detecção facial
- **Google Gemini API** para IA conversacional
- **Web Speech API** (TTS + STT)

### **Gráficos e Animação**
- **Canvas API** para renderização
- **Stop Motion Engine** personalizado
- **GSAP** para animações fluidas (modo legado)

## 🛠️ Instalação e Uso

### **Pré-requisitos**
```bash
Node.js 18+
npm ou yarn
```

### **Instalação**
```bash
# Clone o repositório
git clone https://github.com/AstridNielsen-lab/FaceMotions.git

# Entre no diretório
cd FaceMotions

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

### **Build para Produção**
```bash
npm run build
npm run preview
```

## 📋 Estrutura do Projeto

```
FaceMotions/
├── src/
│   ├── components/
│   │   ├── FaceMotions.tsx      # Sistema de expressões faciais
│   │   ├── PhotoChat.tsx        # Chat com IA Gemini
│   │   └── ...                  # Outros componentes
│   ├── utils/
│   │   └── stopMotionEngine.ts  # Motor de animação Stop Motion
│   ├── App.tsx                  # App principal com navegação
│   └── main.tsx                 # Entry point
├── public/                      # Assets estáticos
├── package.json                 # Dependências
└── README.md                    # Este arquivo
```

## 🎯 Como Usar

### **FaceMotions**
1. 📸 Carregue uma foto com rosto visível
2. ⚙️ Escolha entre Stop Motion (8 FPS) ou Fluida (60 FPS)
3. 🗣️ Selecione uma frase da galeria
4. 🎭 Veja a expressão facial animada com TTS

### **PhotoChat**
1. 📱 Faça upload de uma foto pessoal
2. 🔍 Aguarde a análise facial (idade, gênero, emoção)
3. 💬 Converse com sua foto usando texto ou voz
4. 🤖 A IA assume a personalidade da pessoa na foto

## 🎨 Sistema Stop Motion

### **Características Técnicas**
- **FPS Fixo**: 8 quadros por segundo
- **Quadros Discretos**: Sem interpolação suave
- **Jitter Artesanal**: Tremor consistente e natural
- **Steps Controlados**: 6 steps para face, 8 para corpo
- **Timing Preciso**: Controle rigoroso de frame timing

### **Benefícios Educacionais**
- **Estética Nostálgica**: Lembra animações clássicas
- **Movimento Artesanal**: Simula trabalho manual
- **Engagement Infantil**: Mais atrativo para crianças
- **Diferencial Visual**: Único no mercado educacional

## 🎪 Funcionalidades por Componente

### **StopMotionEngine**
```typescript
// Gerar sequência facial
const sequence = stopMotionEngine.generateFacialSequence(
  landmarks, emotion, intensity, duration
);

// Reproduzir com callback
stopMotionEngine.playSequence(sequence, onFrameUpdate, onComplete);
```

### **FaceMotions**
- ✅ 12 frases com emoções mapeadas
- ✅ Detecção de 68 pontos faciais  
- ✅ Efeitos visuais por emoção
- ✅ TTS sincronizado
- ✅ Controles de play/pause

### **PhotoChat**
- ✅ Análise facial automática
- ✅ IA conversacional contextual
- ✅ Persistência no LocalStorage
- ✅ Interface chat moderna
- ✅ Suporte a voz bidirecional

## 🎓 Público Alvo

### **Primário**
- **Crianças (6-12 anos)**: Educação lúdica e interativa
- **Professores**: Ferramenta pedagógica inovadora
- **Pais**: Entretenimento educativo em casa

### **Secundário**
- **Desenvolvedores**: Exemplo de IA + Stop Motion
- **Pesquisadores**: Estudo de interfaces infantis
- **Terapeutas**: Ferramentas de expressão emocional

## 🔧 API Configuration

### **Gemini API Setup**
```javascript
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
const API_KEY = "SUA_API_KEY_AQUI";
```

⚠️ **Importante**: Substitua `SUA_API_KEY_AQUI` pela sua chave real da API Gemini.

## 🚧 Roadmap

### **Próximas Features**
- [ ] 🎮 Modo multiplayer para duas crianças
- [ ] 📱 App mobile React Native  
- [ ] 🎨 Editor de personagens customizáveis
- [ ] 📊 Dashboard para professores
- [ ] 🌍 Suporte a múltiplos idiomas
- [ ] 🎪 Galeria de animações salvas

### **Melhorias Técnicas**
- [ ] ⚡ Otimização de performance
- [ ] 🔒 Autenticação de usuários
- [ ] ☁️ Sincronização em nuvem
- [ ] 📈 Analytics de uso
- [ ] 🧪 Testes automatizados

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. 🍴 Fork o projeto
2. 🌿 Crie uma branch (`git checkout -b feature/nova-feature`)
3. 📝 Commit suas mudanças (`git commit -am 'Add nova feature'`)
4. 📤 Push para a branch (`git push origin feature/nova-feature`)
5. 🔄 Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Desenvolvedores

- **AnimaKids Team** - *Desenvolvimento inicial* - [AstridNielsen-lab](https://github.com/AstridNielsen-lab)

## 🙏 Agradecimentos

- **face-api.js** pela biblioteca de reconhecimento facial
- **Google Gemini** pela API de IA conversacional  
- **React Team** pelo framework incrível
- **Tailwind CSS** pela estilização moderna
- **Vite** pela experiência de desenvolvimento

---

<div align="center">

**🎬 Feito com ❤️ para crianças por AnimaKids Team**

[🌟 Star este projeto](https://github.com/AstridNielsen-lab/FaceMotions) | [🐛 Reportar Bug](https://github.com/AstridNielsen-lab/FaceMotions/issues) | [💡 Sugerir Feature](https://github.com/AstridNielsen-lab/FaceMotions/issues)

</div>
