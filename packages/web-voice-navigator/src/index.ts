import { WebVoiceNavigator } from './app';

(function initializeWVN() {
  if (document.getElementById('wvn-container')) {
    return;
  }

  const navigator = new WebVoiceNavigator();
  navigator.init();
})();

export type { Command, ScoredElement, AmbiguityContext } from './types';
export { WebVoiceNavigator } from './app';
export { UIManager } from './ui';
export { VoiceManager } from './voice';
export { CommandParser } from './command-parser';
export { ElementFinder } from './element-finder';
export { ActionExecutor } from './action-executor';
