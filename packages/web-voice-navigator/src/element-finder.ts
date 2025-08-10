import type { ScoredElement } from './types';

export class ElementFinder {
  public find(description: string): ScoredElement[] {
    const normalizedDescription = description.toLowerCase().trim();
    if (!normalizedDescription) return [];

    const labelForMap = this.buildLabelForMap();
    const selectors = 'a, button, input, [role="button"], textarea, select';
    const allElements = Array.from(document.querySelectorAll(selectors));

    return allElements
      .map((el) => {
        const element = el as HTMLElement;
        if (!this.isVisible(element)) return { el: element, score: 0 };

        let score = 0;
        const texts = [
          { text: this.getAssociatedLabelText(element, labelForMap), weight: 10 },
          { text: element.getAttribute('aria-label'), weight: 9 },
          { text: this.getElementText(element), weight: 8 },
          { text: element.getAttribute('placeholder'), weight: 7 },
        ];

        for (const item of texts) {
          if (!item.text) continue;

          const lowerText = item.text.toLowerCase().trim().split(/\s+/).join(' ');
          if (lowerText === normalizedDescription) {
            score += item.weight;
          } else if (lowerText.includes(normalizedDescription)) {
            score += item.weight / 2;
          }
        }

        return { el: element, score };
      })
      .filter((e) => e.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  private buildLabelForMap(): Map<string, string> {
    const labelForMap = new Map<string, string>();
    document.querySelectorAll('label[for]').forEach((label) => {
      const htmlLabel = label as HTMLLabelElement;
      const forId = htmlLabel.htmlFor;
      if (forId) {
        labelForMap.set(forId, htmlLabel.textContent?.trim() || '');
      }
    });
    return labelForMap;
  }

  private getAssociatedLabelText(el: HTMLElement, labelForMap: Map<string, string>): string | null {
    if (el.id && labelForMap.has(el.id)) {
      return labelForMap.get(el.id) || null;
    }

    const parentLabel = el.closest('label');
    return parentLabel?.textContent?.trim() || null;
  }

  private isVisible(element: HTMLElement): boolean {
    return !!(element.offsetWidth && element.offsetHeight) || !!element.getClientRects().length;
  }

  private getElementText(element: HTMLElement): string {
    // In jsdom, innerText might return "undefined" as a string, so we need to fallback to textContent
    const innerText = element.innerText;
    if (innerText && innerText !== 'undefined') {
      return innerText;
    }
    return element.textContent || '';
  }
}
