import { ElementFinder } from './element-finder';

describe('ElementFinder', () => {
  let elementFinder: ElementFinder;
  beforeEach(() => {
    elementFinder = new ElementFinder();
    document.body.innerHTML = '';

    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get: function () {
        if (this.style.display === 'none') return 0;
        return parseInt(this.style.width) || 100;
      },
    });

    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get: function () {
        if (this.style.display === 'none') return 0;
        return parseInt(this.style.height) || 30;
      },
    });

    Object.defineProperty(HTMLElement.prototype, 'getClientRects', {
      configurable: true,
      value: function () {
        if (this.style.display === 'none') return [];
        return [{ width: 100, height: 30 }];
      },
    });

    (elementFinder as any).isVisible = jest.fn((element: HTMLElement) => {
      return element.style.display !== 'none';
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  describe('find', () => {
    beforeEach(() => {
      const button1 = document.createElement('button');
      button1.textContent = 'Submit';
      button1.style.display = 'block';
      button1.style.width = '100px';
      button1.style.height = '30px';
      document.body.appendChild(button1);

      const button2 = document.createElement('button');
      button2.textContent = 'Submit Form';
      button2.style.display = 'block';
      button2.style.width = '100px';
      button2.style.height = '30px';
      document.body.appendChild(button2);

      const input1 = document.createElement('input');
      input1.placeholder = 'Enter email';
      input1.style.display = 'block';
      input1.style.width = '100px';
      input1.style.height = '30px';
      document.body.appendChild(input1);

      const input2 = document.createElement('input');
      input2.setAttribute('aria-label', 'Password field');
      input2.style.display = 'block';
      input2.style.width = '100px';
      input2.style.height = '30px';
      document.body.appendChild(input2);

      const label = document.createElement('label');
      label.textContent = 'Username';
      label.htmlFor = 'username-input';
      document.body.appendChild(label);

      const input3 = document.createElement('input');
      input3.id = 'username-input';
      input3.style.display = 'block';
      input3.style.width = '100px';
      input3.style.height = '30px';
      document.body.appendChild(input3);

      const wrapperLabel = document.createElement('label');
      wrapperLabel.textContent = 'Phone Number';
      const input4 = document.createElement('input');
      input4.style.display = 'block';
      input4.style.width = '100px';
      input4.style.height = '30px';
      wrapperLabel.appendChild(input4);
      document.body.appendChild(wrapperLabel);

      const hiddenButton = document.createElement('button');
      hiddenButton.textContent = 'Hidden Submit';
      hiddenButton.style.display = 'none';
      document.body.appendChild(hiddenButton);
    });

    it('should be able to find elements by exact text match', () => {
      const results = elementFinder.find('submit');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].el.textContent?.toLowerCase()).toContain('submit');
      expect(results[0].score).toBeGreaterThan(0);
    });

    it('should be able to prioritize exact matches over partial matches', () => {
      const results = elementFinder.find('submit');

      expect(results).toHaveLength(2);
      expect(results[0].score).toBeGreaterThan(results[1].score);
      expect(results[0].el.textContent).toBe('Submit');
      expect(results[1].el.textContent).toBe('Submit Form');
    });

    it('should be able to find elements by placeholder text', () => {
      const results = elementFinder.find('enter email');

      expect(results.length).toBeGreaterThan(0);
      const foundElement = results.find((r) => (r.el as HTMLInputElement).placeholder === 'Enter email');
      expect(foundElement).toBeDefined();
      expect(foundElement!.score).toBeGreaterThan(0);
    });

    it('should be able to find elements by aria-label', () => {
      const results = elementFinder.find('password field');

      expect(results.length).toBeGreaterThan(0);
      const foundElement = results.find((r) => r.el.getAttribute('aria-label') === 'Password field');
      expect(foundElement).toBeDefined();
      expect(foundElement!.score).toBeGreaterThan(0);
    });

    it('should be able to find elements by associated label text', () => {
      const results = elementFinder.find('username');

      expect(results.length).toBeGreaterThan(0);
      const foundElement = results.find((r) => r.el.id === 'username-input');
      expect(foundElement).toBeDefined();
      expect(foundElement!.score).toBeGreaterThan(0);
    });

    it('should be able to find elements by parent label text', () => {
      const results = elementFinder.find('phone number');

      expect(results.length).toBeGreaterThan(0);
      const foundElement = results.find((r) => r.el.closest('label')?.textContent === 'Phone Number');
      expect(foundElement).toBeDefined();
      expect(foundElement!.score).toBeGreaterThan(0);
    });

    it('should be able to exclude hidden elements', () => {
      const results = elementFinder.find('hidden submit');

      expect(results).toHaveLength(0);
    });

    it('should be able to return empty array when no matches found', () => {
      const results = elementFinder.find('nonexistent element');

      expect(results).toHaveLength(0);
    });

    it('should be able to handle case insensitive searches', () => {
      const results = elementFinder.find('SUBMIT');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].el.textContent?.toLowerCase()).toContain('submit');
    });

    it('should be able to sort results by score in descending order', () => {
      const results = elementFinder.find('submit');

      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
      }
    });

    it('should be able to handle partial matches with lower scores', () => {
      const results = elementFinder.find('sub');

      expect(results.length).toBeGreaterThan(0);
      const exactMatch = results.find((r) => r.el.textContent?.toLowerCase() === 'sub');
      const partialMatch = results.find(
        (r) => r.el.textContent?.toLowerCase().includes('sub') && r.el.textContent?.toLowerCase() !== 'sub',
      );

      if (exactMatch && partialMatch) {
        expect(exactMatch.score).toBeGreaterThan(partialMatch.score);
      }
    });

    it('should be able to prioritize different text sources correctly', () => {
      document.body.innerHTML = '';

      const button1 = document.createElement('button');
      button1.setAttribute('aria-label', 'test button');
      button1.style.display = 'block';
      button1.style.width = '100px';
      button1.style.height = '30px';
      document.body.appendChild(button1);

      const button2 = document.createElement('button');
      button2.innerText = 'test button';
      button2.style.display = 'block';
      button2.style.width = '100px';
      button2.style.height = '30px';
      document.body.appendChild(button2);

      const input1 = document.createElement('input');
      input1.placeholder = 'test button';
      input1.style.display = 'block';
      input1.style.width = '100px';
      input1.style.height = '30px';
      document.body.appendChild(input1);

      const results = elementFinder.find('test button');

      expect(results.length).toBeGreaterThan(1);
      expect(results[0].el.getAttribute('aria-label')).toBe('test button');
      expect((results[results.length - 1].el as HTMLInputElement).placeholder).toBe('test button');
    });
  });

  describe('edge cases', () => {
    it('should be able to handle empty description', () => {
      const results = elementFinder.find('');

      expect(results).toHaveLength(0);
    });

    it('should be able to handle whitespace-only description', () => {
      const results = elementFinder.find('   ');

      expect(results).toHaveLength(0);
    });

    it('should be able to handle elements with no visible content', () => {
      document.body.innerHTML = '';

      const button = document.createElement('button');
      button.style.display = 'block';
      button.style.width = '100px';
      button.style.height = '30px';
      document.body.appendChild(button);

      const results = elementFinder.find('button');

      expect(results).toHaveLength(0);
    });

    it('should be able to handle elements with multiple spaces in text', () => {
      document.body.innerHTML = '';

      const button = document.createElement('button');
      button.textContent = '  multiple   spaces   text  ';
      button.style.display = 'block';
      button.style.width = '100px';
      button.style.height = '30px';
      document.body.appendChild(button);

      const results = elementFinder.find('multiple spaces text');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].score).toBeGreaterThan(0);
    });
  });
});
