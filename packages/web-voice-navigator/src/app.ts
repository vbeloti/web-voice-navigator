import type { AmbiguityContext, Command } from './types';
import { UIManager } from './ui';
import { VoiceManager } from './voice';
import { CommandParser } from './command-parser';
import { ElementFinder } from './element-finder';
import { ActionExecutor } from './action-executor';

export class WebVoiceNavigator {
  private isListening = false;
  private ambiguityContext: AmbiguityContext = { isActive: false, elements: [] };

  private readonly ui = new UIManager();
  private readonly voice = new VoiceManager();
  private readonly commandParser = new CommandParser();
  private readonly elementFinder = new ElementFinder();
  private readonly actionExecutor = new ActionExecutor(this.ui);

  public init(): void {
    console.log('WebVoiceNavigator initialized', this.isListening);

    this.ui.init();

    const voiceAvailable = this.voice.init({
      onStateChange: this.handleVoiceStateChange.bind(this),
      onError: this.handleVoiceError.bind(this),
      onResult: this.handleVoiceResult.bind(this),
    });

    if (!voiceAvailable) {
      this.ui.updateStatus('API de Voz não suportada.', 5000);
      return;
    }

    this.ui.getMicButton().addEventListener('click', () => {
      this.voice.toggle(!this.isListening);
    });
  }

  private handleVoiceStateChange(isListening: boolean): void {
    this.isListening = isListening;
    this.ui.setMicState(isListening);

    if (!isListening) {
      this.ui.updateStatus('');
      return;
    }

    this.ambiguityContext.isActive = false;
    this.ui.clearHighlights();
    this.ui.updateStatus('Ouvindo...');
  }

  private handleVoiceError(event: Event): void {
    const errorEvent = event as any;
    const message = errorEvent.error === 'no-speech' ? 'Não ouvi nada.' : `Erro: ${errorEvent.error}`;
    this.ui.updateStatus(message, 3000);
  }

  private handleVoiceResult(event: Event): void {
    const resultEvent = event as any;
    const commandText = resultEvent.results[0][0].transcript.toLowerCase().trim();
    this.ui.updateStatus(`Você disse: "${commandText}"`);
    this.processCommand(commandText);
  }

  private processCommand(commandText: string): void {
    this.ui.clearHighlights();

    if (this.ambiguityContext.isActive) {
      this.handleAmbiguityChoice(commandText);
      return;
    }

    const command = this.commandParser.parse(commandText);
    if (!command) {
      this.ui.updateStatus('Comando não reconhecido.', 3000);
      return;
    }

    if (command.action === 'scroll') {
      this.actionExecutor.execute(command);
      return;
    }

    if (!command.target) {
      this.ui.updateStatus('Comando inválido: target não especificado.', 3000);
      return;
    }

    const scoredElements = this.elementFinder.find(command.target);
    if (scoredElements.length === 0) {
      this.ui.updateStatus(`Não encontrei: "${command.target}"`, 3000);
      return;
    }

    const bestScore = scoredElements[0].score;
    const bestElements = scoredElements.filter((e) => e.score === bestScore).map((e) => e.el);

    if (bestElements.length > 1) {
      this.setupAmbiguity(bestElements, command);
      return;
    }

    this.actionExecutor.execute({ ...command, element: bestElements[0] });
  }

  private setupAmbiguity(elements: HTMLElement[], command: Command): void {
    this.ambiguityContext = { isActive: true, elements, command };
    this.ui.updateStatus(`Encontrei ${elements.length} resultados. Diga o número.`);
    elements.forEach((el, index) => this.ui.highlight(el, index + 1));
  }

  private handleAmbiguityChoice(choiceText: string): void {
    const numberMap: Record<string, number> = {
      um: 1,
      dois: 2,
      três: 3,
      quatro: 4,
      cinco: 5,
    };

    const choiceIndex = numberMap[choiceText] || parseInt(choiceText, 10);

    if (
      !choiceIndex ||
      choiceIndex <= 0 ||
      choiceIndex > this.ambiguityContext.elements.length ||
      !this.ambiguityContext.command
    ) {
      this.ui.updateStatus(`"${choiceText}"? Escolha inválida.`, 3000);
      this.ambiguityContext.isActive = false;
      return;
    }

    const chosenElement = this.ambiguityContext.elements[choiceIndex - 1];
    this.actionExecutor.execute({
      action: this.ambiguityContext.command.action,
      element: chosenElement,
      value: this.ambiguityContext.command.value,
    });

    this.ambiguityContext.isActive = false;
  }
}
