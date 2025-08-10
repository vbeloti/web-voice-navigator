import { ActionExecutor } from './action-executor';
import { UIManager } from './ui';
import type { Command } from './types';

jest.mock('./ui');

describe('ActionExecutor', () => {
  let actionExecutor: ActionExecutor;
  let mockUIManager: jest.Mocked<UIManager>;
  let mockElement: HTMLElement;

  beforeEach(() => {
    mockUIManager = new UIManager() as jest.Mocked<UIManager>;
    mockUIManager.highlight = jest.fn();
    mockUIManager.updateStatus = jest.fn();
    mockUIManager.clearHighlights = jest.fn();

    actionExecutor = new ActionExecutor(mockUIManager);

    mockElement = document.createElement('button');
    document.body.appendChild(mockElement);

    Object.defineProperty(window, 'innerHeight', { value: 1000, writable: true });
    jest.spyOn(window, 'scrollBy').mockImplementation();

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  describe('execute', () => {
    describe('click action', () => {
      it('should be able to execute click action on element', () => {
        const command: Command = {
          action: 'clicar',
          element: mockElement,
        };

        jest.spyOn(mockElement, 'click');

        actionExecutor.execute(command);

        expect(mockUIManager.highlight).toHaveBeenCalledWith(mockElement);
        expect(mockUIManager.updateStatus).toHaveBeenCalledWith('Executando: clicar', 2000);
        expect(mockElement.click).toHaveBeenCalled();
      });

      it('should be able to clear highlights after click action', () => {
        const command: Command = {
          action: 'clicar',
          element: mockElement,
        };

        actionExecutor.execute(command);

        jest.advanceTimersByTime(1000);

        expect(mockUIManager.clearHighlights).toHaveBeenCalled();
      });
    });

    describe('focus action', () => {
      it('should be able to execute focus action on element', () => {
        const input = document.createElement('input');
        document.body.appendChild(input);

        const command: Command = {
          action: 'focar',
          element: input,
        };

        jest.spyOn(input, 'focus');

        actionExecutor.execute(command);

        expect(mockUIManager.highlight).toHaveBeenCalledWith(input);
        expect(mockUIManager.updateStatus).toHaveBeenCalledWith('Executando: focar', 2000);
        expect(input.focus).toHaveBeenCalled();
      });
    });

    describe('fill action', () => {
      it('should be able to execute fill action on input element', () => {
        const input = document.createElement('input');
        document.body.appendChild(input);

        const command: Command = {
          action: 'preencher',
          element: input,
          value: 'test@example.com',
        };

        jest.spyOn(input, 'focus');
        jest.spyOn(input, 'dispatchEvent');

        actionExecutor.execute(command);

        expect(mockUIManager.highlight).toHaveBeenCalledWith(input);
        expect(mockUIManager.updateStatus).toHaveBeenCalledWith('Executando: preencher', 2000);
        expect(input.focus).toHaveBeenCalled();
        expect(input.value).toBe('test@example.com');
        expect(input.dispatchEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'input',
            bubbles: true,
          }),
        );
      });

      it('should be able to execute fill action on textarea element', () => {
        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);

        const command: Command = {
          action: 'preencher',
          element: textarea,
          value: 'Long text content',
        };

        jest.spyOn(textarea, 'focus');
        jest.spyOn(textarea, 'dispatchEvent');

        actionExecutor.execute(command);

        expect(textarea.focus).toHaveBeenCalled();
        expect(textarea.value).toBe('Long text content');
        expect(textarea.dispatchEvent).toHaveBeenCalled();
      });

      it('should be able to handle fill action when no value is provided', () => {
        const input = document.createElement('input');
        const command: Command = {
          action: 'preencher',
          element: input,
        };

        jest.spyOn(input, 'focus');

        actionExecutor.execute(command);

        expect(input.focus).not.toHaveBeenCalled();
      });

      it('should be able to handle fill action on non-input element', () => {
        const div = document.createElement('div');
        const command: Command = {
          action: 'preencher',
          element: div,
          value: 'test',
        };

        jest.spyOn(div, 'focus');

        actionExecutor.execute(command);

        expect(div.focus).toHaveBeenCalled();
        expect((div as HTMLInputElement).value).toBeUndefined();
      });
    });

    describe('scroll action', () => {
      it('should be able to execute scroll down action', () => {
        const command: Command = {
          action: 'scroll',
          value: 'down',
        };

        actionExecutor.execute(command);

        expect(mockUIManager.updateStatus).toHaveBeenCalledWith('Executando: scroll', 2000);
        expect(window.scrollBy).toHaveBeenCalledWith(0, 700); // 1000 * 0.7
        expect(mockUIManager.highlight).not.toHaveBeenCalled();
      });

      it('should be able to execute scroll up action', () => {
        const command: Command = {
          action: 'scroll',
          value: 'up',
        };

        actionExecutor.execute(command);

        expect(window.scrollBy).toHaveBeenCalledWith(0, -700); // -1000 * 0.7
      });

      it('should be able to not clear highlights for scroll action', () => {
        const command: Command = {
          action: 'scroll',
          value: 'down',
        };

        actionExecutor.execute(command);

        jest.advanceTimersByTime(1000);

        expect(mockUIManager.clearHighlights).not.toHaveBeenCalled();
      });
    });

    describe('edge cases', () => {
      it('should be able to return early when no element and not scroll action', () => {
        const command: Command = {
          action: 'clicar',
        };

        actionExecutor.execute(command);

        expect(mockUIManager.highlight).not.toHaveBeenCalled();
        expect(mockUIManager.updateStatus).not.toHaveBeenCalled();
      });

      it('should be able to handle unknown action', () => {
        const command: Command = {
          action: 'unknown',
          element: mockElement,
        };

        actionExecutor.execute(command);

        expect(mockUIManager.highlight).toHaveBeenCalledWith(mockElement);
        expect(mockUIManager.updateStatus).toHaveBeenCalledWith('Executando: unknown', 2000);
      });

      it('should be able to handle null element for non-scroll actions', () => {
        const command: Command = {
          action: 'clicar',
          element: undefined,
        };

        actionExecutor.execute(command);

        expect(mockUIManager.highlight).not.toHaveBeenCalled();
        expect(mockUIManager.updateStatus).not.toHaveBeenCalled();
      });

      it('should be able to handle window innerHeight changes for scroll', () => {
        Object.defineProperty(window, 'innerHeight', { value: 800 });

        const command: Command = {
          action: 'scroll',
          value: 'down',
        };

        actionExecutor.execute(command);

        expect(window.scrollBy).toHaveBeenCalledWith(0, 560); // 800 * 0.7
      });
    });
  });
});
