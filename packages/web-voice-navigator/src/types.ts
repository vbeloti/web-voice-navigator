export interface Command {
  action: string;
  target?: string;
  value?: string;
  element?: HTMLElement;
}

export interface ScoredElement {
  el: HTMLElement;
  score: number;
}

export interface AmbiguityContext {
  isActive: boolean;
  elements: HTMLElement[];
  command?: Command;
}
