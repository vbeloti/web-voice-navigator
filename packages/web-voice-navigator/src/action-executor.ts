import type { Command } from './types';
import type { UIManager } from './ui';

export class ActionExecutor {
  constructor(private readonly ui: UIManager) {}

  public execute(command: Command): void {
    if (!command.element && command.action !== 'scroll') return;

    if (command.element) {
      this.ui.highlight(command.element);
    }

    this.ui.updateStatus(`Executando: ${command.action}`, 2000);

    switch (command.action) {
      case 'clicar':
        command.element?.click();
        break;
      case 'focar':
        command.element?.focus();
        break;
      case 'preencher':
        this.handleFillAction(command);
        break;
      case 'scroll':
        this.handleScrollAction(command);
        break;
    }

    if (command.action !== 'scroll') {
      setTimeout(() => this.ui.clearHighlights(), 1000);
    }
  }

  private handleFillAction(command: Command): void {
    if (!command.element || !command.value) return;

    command.element.focus();
    if (command.element instanceof HTMLInputElement || command.element instanceof HTMLTextAreaElement) {
      command.element.value = command.value;
      command.element.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  private handleScrollAction(command: Command): void {
    const scrollAmount = window.innerHeight * 0.7;
    const scrollValue = command.value === 'up' ? -scrollAmount : scrollAmount;
    window.scrollBy(0, scrollValue);
  }
}
