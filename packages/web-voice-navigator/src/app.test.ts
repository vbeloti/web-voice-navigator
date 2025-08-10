import { WebVoiceNavigator } from './app';
import { VoiceManager } from './voice';
import { CommandParser } from './command-parser';
import { ElementFinder } from './element-finder';
import { ActionExecutor } from './action-executor';
import { UIManager } from './ui';
import type { VoiceCallbacks } from './voice';

jest.mock('./voice');
jest.mock('./command-parser');
jest.mock('./element-finder');
jest.mock('./action-executor');
jest.mock('./ui');

describe('WebVoiceNavigator', () => {
  let app: WebVoiceNavigator;
  let mockVoiceManager: jest.Mocked<VoiceManager>;
  let mockCommandParser: jest.Mocked<CommandParser>;
  let mockElementFinder: jest.Mocked<ElementFinder>;
  let mockActionExecutor: jest.Mocked<ActionExecutor>;
  let mockUIManager: jest.Mocked<UIManager>;

  beforeEach(() => {
    mockVoiceManager = {
      init: jest.fn().mockReturnValue(true),
      toggle: jest.fn(),
    } as any;

    mockCommandParser = {
      parse: jest.fn(),
    } as any;

    mockElementFinder = {
      find: jest.fn(),
    } as any;

    mockActionExecutor = {
      execute: jest.fn(),
    } as any;

    mockUIManager = {
      init: jest.fn(),
      getMicButton: jest.fn().mockReturnValue(document.createElement('button')),
      updateStatus: jest.fn(),
      setMicState: jest.fn(),
      clearHighlights: jest.fn(),
      highlight: jest.fn(),
    } as any;

    (VoiceManager as jest.MockedClass<typeof VoiceManager>).mockImplementation(() => mockVoiceManager);
    (CommandParser as jest.MockedClass<typeof CommandParser>).mockImplementation(() => mockCommandParser);
    (ElementFinder as jest.MockedClass<typeof ElementFinder>).mockImplementation(() => mockElementFinder);
    (ActionExecutor as jest.MockedClass<typeof ActionExecutor>).mockImplementation(() => mockActionExecutor);
    (UIManager as jest.MockedClass<typeof UIManager>).mockImplementation(() => mockUIManager);

    app = new WebVoiceNavigator();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('init', () => {
    it('should be able to initialize all components', () => {
      app.init();

      expect(mockUIManager.init).toHaveBeenCalled();
      expect(mockVoiceManager.init).toHaveBeenCalled();
    });

    it('should be able to set up mic button click handler', () => {
      const mockButton = document.createElement('button');
      mockUIManager.getMicButton.mockReturnValue(mockButton);

      app.init();

      expect(mockUIManager.getMicButton).toHaveBeenCalled();
    });

    it('should be able to handle voice API not available', () => {
      mockVoiceManager.init.mockReturnValue(false);

      app.init();

      expect(mockUIManager.updateStatus).toHaveBeenCalledWith('API de Voz não suportada.', 5000);
    });
  });

  describe('voice callbacks', () => {
    let callbacks: VoiceCallbacks;

    beforeEach(() => {
      app.init();
      const initCall = mockVoiceManager.init.mock.calls[0];
      callbacks = initCall[0];
    });

    it('should be able to handle onStateChange callback when listening starts', () => {
      callbacks.onStateChange(true);

      expect(mockUIManager.setMicState).toHaveBeenCalledWith(true);
      expect(mockUIManager.clearHighlights).toHaveBeenCalled();
      expect(mockUIManager.updateStatus).toHaveBeenCalledWith('Ouvindo...');
    });

    it('should be able to handle onStateChange callback when listening stops', () => {
      callbacks.onStateChange(false);

      expect(mockUIManager.setMicState).toHaveBeenCalledWith(false);
      expect(mockUIManager.updateStatus).toHaveBeenCalledWith('');
    });

    it('should be able to handle onResult callback with valid command', () => {
      const mockCommand = { action: 'clicar', target: 'botão' };
      const mockElement = document.createElement('button');
      const mockScoredElements = [{ el: mockElement, score: 1.0 }];

      const mockEvent = {
        results: [[{ transcript: 'clicar botão' }]],
      };

      mockCommandParser.parse.mockReturnValue(mockCommand);
      mockElementFinder.find.mockReturnValue(mockScoredElements);

      callbacks.onResult(mockEvent as unknown as Event);

      expect(mockUIManager.updateStatus).toHaveBeenCalledWith('Você disse: "clicar botão"');
      expect(mockCommandParser.parse).toHaveBeenCalledWith('clicar botão');
      expect(mockElementFinder.find).toHaveBeenCalledWith('botão');
      expect(mockActionExecutor.execute).toHaveBeenCalledWith({
        ...mockCommand,
        element: mockElement,
      });
    });

    it('should be able to handle onResult callback with no elements found', () => {
      const mockCommand = { action: 'clicar', target: 'botão' };
      const mockEvent = {
        results: [[{ transcript: 'clicar botão' }]],
      };

      mockCommandParser.parse.mockReturnValue(mockCommand);
      mockElementFinder.find.mockReturnValue([]);

      callbacks.onResult(mockEvent as unknown as Event);

      expect(mockUIManager.updateStatus).toHaveBeenCalledWith('Não encontrei: "botão"', 3000);
    });

    it('should be able to handle onResult callback with invalid command', () => {
      const mockEvent = {
        results: [[{ transcript: 'comando inválido' }]],
      };

      mockCommandParser.parse.mockReturnValue(null);

      callbacks.onResult(mockEvent as unknown as Event);

      expect(mockUIManager.updateStatus).toHaveBeenCalledWith('Comando não reconhecido.', 3000);
    });

    it('should be able to handle onError callback with no-speech error', () => {
      const mockEvent = { error: 'no-speech' };

      callbacks.onError(mockEvent as unknown as Event);

      expect(mockUIManager.updateStatus).toHaveBeenCalledWith('Não ouvi nada.', 3000);
    });

    it('should be able to handle onError callback with other errors', () => {
      const mockEvent = { error: 'network' };

      callbacks.onError(mockEvent as unknown as Event);

      expect(mockUIManager.updateStatus).toHaveBeenCalledWith('Erro: network', 3000);
    });
  });

  describe('ambiguity handling', () => {
    let callbacks: VoiceCallbacks;

    beforeEach(() => {
      app.init();
      const initCall = mockVoiceManager.init.mock.calls[0];
      callbacks = initCall[0];
    });

    it('should be able to handle multiple elements with same score', () => {
      const mockCommand = { action: 'clicar', target: 'botão' };
      const mockElement1 = document.createElement('button');
      const mockElement2 = document.createElement('button');
      const mockScoredElements = [
        { el: mockElement1, score: 1.0 },
        { el: mockElement2, score: 1.0 },
      ];

      const mockEvent = {
        results: [[{ transcript: 'clicar botão' }]],
      };

      mockCommandParser.parse.mockReturnValue(mockCommand);
      mockElementFinder.find.mockReturnValue(mockScoredElements);

      callbacks.onResult(mockEvent as unknown as Event);

      expect(mockUIManager.updateStatus).toHaveBeenCalledWith('Encontrei 2 resultados. Diga o número.');
      expect(mockUIManager.highlight).toHaveBeenCalledWith(mockElement1, 1);
      expect(mockUIManager.highlight).toHaveBeenCalledWith(mockElement2, 2);
    });

    it('should be able to handle scroll command without target', () => {
      const mockCommand = { action: 'scroll', value: 'down' };
      const mockEvent = {
        results: [[{ transcript: 'scroll down' }]],
      };

      mockCommandParser.parse.mockReturnValue(mockCommand);

      callbacks.onResult(mockEvent as unknown as Event);

      expect(mockActionExecutor.execute).toHaveBeenCalledWith(mockCommand);
    });
  });
});
