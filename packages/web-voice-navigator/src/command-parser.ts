import type { Command } from './types';

export class CommandParser {
  public parse(command: string): Command | null {
    const cmd = command.toLowerCase().trim();

    const scrollRegex = /rolar? para (baixo|cima)/;
    const scrollMatch = scrollRegex.exec(cmd);
    if (scrollMatch) {
      return {
        action: 'scroll',
        value: scrollMatch[1] === 'cima' ? 'up' : 'down',
      };
    }

    if (cmd.startsWith('preencher')) {
      const [target, ...valueParts] = cmd.replace('preencher', '').trim().split(' com ');
      return {
        action: 'preencher',
        target: target.trim(),
        value: valueParts.join(' com ').trim(),
      };
    }

    const clickKeywords = ['clicar em', 'clicar no', 'clicar na'];
    for (const keyword of clickKeywords) {
      if (cmd.startsWith(keyword)) {
        return {
          action: 'clicar',
          target: cmd.replace(keyword, '').trim(),
        };
      }
    }

    const focusKeywords = ['focar em', 'focar no', 'focar na'];
    for (const keyword of focusKeywords) {
      if (cmd.startsWith(keyword)) {
        return {
          action: 'focar',
          target: cmd.replace(keyword, '').trim(),
        };
      }
    }

    return null;
  }
}
