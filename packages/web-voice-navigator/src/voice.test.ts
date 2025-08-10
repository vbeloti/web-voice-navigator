import { VoiceManager } from './voice';

interface MockSpeechRecognition {
  lang: string;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  onresult: ((event: Event) => void) | null;
  start: jest.Mock;
  stop: jest.Mock;
}

interface MockCallbacks {
  onStateChange: jest.Mock;
  onError: jest.Mock;
  onResult: jest.Mock;
}

describe('VoiceManager', () => {
  let voiceManager: VoiceManager;
  let mockSpeechRecognition: MockSpeechRecognition;
  let mockCallbacks: MockCallbacks;

  beforeEach(() => {
    voiceManager = new VoiceManager();

    mockSpeechRecognition = {
      lang: '',
      interimResults: false,
      onstart: null,
      onend: null,
      onerror: null,
      onresult: null,
      start: jest.fn(),
      stop: jest.fn(),
    };

    mockCallbacks = {
      onStateChange: jest.fn(),
      onError: jest.fn(),
      onResult: jest.fn(),
    };

    Object.defineProperty(window, 'webkitSpeechRecognition', {
      value: jest.fn(() => mockSpeechRecognition),
      configurable: true,
    });

    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('init', () => {
    it('should be able to initialize successfully when SpeechRecognition API is available', () => {
      const result = voiceManager.init(mockCallbacks);

      expect(result).toBe(true);
    });

    it('should be able to return false when SpeechRecognition API is not available', () => {
      delete (
        window as Window &
          typeof globalThis & {
            webkitSpeechRecognition?: unknown;
            SpeechRecognition?: unknown;
          }
      ).webkitSpeechRecognition;
      delete (
        window as Window &
          typeof globalThis & {
            webkitSpeechRecognition?: unknown;
            SpeechRecognition?: unknown;
          }
      ).SpeechRecognition;

      const result = voiceManager.init(mockCallbacks);

      expect(result).toBe(false);
    });

    it('should be able to configure recognition with Portuguese language', () => {
      voiceManager.init(mockCallbacks);

      expect(mockSpeechRecognition.lang).toBe('pt-BR');
    });

    it('should be able to set interimResults to false', () => {
      voiceManager.init(mockCallbacks);

      expect(mockSpeechRecognition.interimResults).toBe(false);
    });

    it('should be able to assign callback handlers correctly', () => {
      voiceManager.init(mockCallbacks);

      expect(typeof mockSpeechRecognition.onstart).toBe('function');
      expect(typeof mockSpeechRecognition.onend).toBe('function');
      expect(mockSpeechRecognition.onerror).toBe(mockCallbacks.onError);
      expect(mockSpeechRecognition.onresult).toBe(mockCallbacks.onResult);
    });

    it('should be able to call onStateChange with true when recognition starts', () => {
      voiceManager.init(mockCallbacks);

      if (mockSpeechRecognition.onstart) {
        mockSpeechRecognition.onstart();
      }

      expect(mockCallbacks.onStateChange).toHaveBeenCalledWith(true);
    });

    it('should be able to call onStateChange with false when recognition ends', () => {
      voiceManager.init(mockCallbacks);

      if (mockSpeechRecognition.onend) {
        mockSpeechRecognition.onend();
      }

      expect(mockCallbacks.onStateChange).toHaveBeenCalledWith(false);
    });
  });

  describe('toggle', () => {
    beforeEach(() => {
      voiceManager.init(mockCallbacks);
    });

    it('should be able to start recognition when shouldStart is true', () => {
      voiceManager.toggle(true);

      expect(mockSpeechRecognition.start).toHaveBeenCalled();
    });

    it('should be able to stop recognition when shouldStart is false', () => {
      voiceManager.toggle(false);

      expect(mockSpeechRecognition.stop).toHaveBeenCalled();
    });

    it('should be able to log error when recognition is not initialized', () => {
      const uninitializedManager = new VoiceManager();

      uninitializedManager.toggle(true);

      expect(console.error).toHaveBeenCalledWith('Recognition not initialized');
    });

    it('should be able to handle errors when starting recognition', () => {
      mockSpeechRecognition.start.mockImplementation(() => {
        throw new Error('Recognition error');
      });

      voiceManager.toggle(true);

      expect(console.error).toHaveBeenCalledWith('Error toggling voice recognition:', expect.any(Error));
    });

    it('should be able to handle errors when stopping recognition', () => {
      mockSpeechRecognition.stop.mockImplementation(() => {
        throw new Error('Recognition error');
      });

      voiceManager.toggle(false);

      expect(console.error).toHaveBeenCalledWith('Error toggling voice recognition:', expect.any(Error));
    });
  });
});
