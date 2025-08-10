# Web Voice Navigator (WVN)

Um sistema de navegação por voz utilizando a api "Web Speech API" permitindo que usuários interajam com elementos da página através de comandos de voz em português brasileiro.

## 🖥️ Demo

[https://web-voice-navigator.pages.dev](https://web-voice-navigator.pages.dev)

## 🚀 Instalação

### Via NPM/Yarn

```bash
npm install web-voice-navigator
# ou
yarn add web-voice-navigator
```

## 🎯 Comandos Disponíveis

### Navegação

- **"Clicar em [elemento]"** - Clica em botões, links ou elementos clicáveis
- **"Focar em [campo]"** - Foca em campos de entrada
- **"Rolar para baixo"** - Rola a página para baixo
- **"Rolar para cima"** - Rola a página para cima

### Preenchimento

- **"Preencher [campo] com [texto]"** - Preenche campos de texto

### Exemplos Práticos

```
"Clicar em enviar"
"Focar no campo email"
"Preencher nome com João Silva"
"Rolar para baixo"
```

## 📖 Uso

### Inclusão Direta

```html
<script src="dist/index.js"></script>
```

### Uso Programático

```typescript
import { WebVoiceNavigator } from 'web-voice-navigator';

const navigator = new WebVoiceNavigator();
navigator.init();
```

## 🔧 Scripts Disponíveis

```bash
yarn build
yarn dev
yarn test
```

## 🌐 Compatibilidade

- **Navegadores**: Chrome 25+, Firefox 44+, Edge 79+, Safari 14.1+
- **APIs**: Web Speech API (SpeechRecognition)
