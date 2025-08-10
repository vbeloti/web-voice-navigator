interface SimpleSpeechRecognition {
  lang: string;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  onresult: ((event: Event) => void) | null;
  start(): void;
  stop(): void;
}

export interface VoiceCallbacks {
  onStateChange: (isListening: boolean) => void;
  onError: (event: Event) => void;
  onResult: (event: Event) => void;
}

export class VoiceManager {
  private recognition?: SimpleSpeechRecognition;

  public init(callbacks: VoiceCallbacks): boolean {
    const windowWithSpeech = window as any;
    const SpeechAPI = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechAPI) {
      return false;
    }

    const recognition = new SpeechAPI() as SimpleSpeechRecognition;
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;

    recognition.onstart = () => callbacks.onStateChange(true);
    recognition.onend = () => callbacks.onStateChange(false);
    recognition.onerror = callbacks.onError;
    recognition.onresult = callbacks.onResult;

    this.recognition = recognition;
    return true;
  }

  public toggle(shouldStart: boolean): void {
    if (!this.recognition) {
      console.error('Recognition not initialized');
      return;
    }

    try {
      if (shouldStart) {
        this.recognition.start();
      } else {
        this.recognition.stop();
      }
    } catch (error) {
      console.error('Error toggling voice recognition:', error);
    }
  }
}
