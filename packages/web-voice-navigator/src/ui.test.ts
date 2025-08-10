import { UIManager } from './ui';

describe('UIManager', () => {
  let uiManager: UIManager;

  beforeEach(() => {
    uiManager = new UIManager();
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  });

  describe('init', () => {
    it('should be able to create UI container when not exists', () => {
      uiManager.init();

      const container = document.getElementById('wvn-container');
      expect(container).toBeTruthy();
    });

    it('should be able to not recreate container if already exists', () => {
      const existingContainer = document.createElement('div');
      existingContainer.id = 'wvn-container';
      document.body.appendChild(existingContainer);

      uiManager.init();

      const containers = document.querySelectorAll('#wvn-container');
      expect(containers).toHaveLength(1);
    });

    it('should be able to create styles in head', () => {
      uiManager.init();

      const styles = document.head.querySelector('style');
      expect(styles).toBeTruthy();
      expect(styles!.textContent).toContain('#wvn-container');
    });

    it('should be able to create mic button element', () => {
      uiManager.init();

      const micButton = document.getElementById('wvn-mic-button');
      expect(micButton).toBeTruthy();
      expect(micButton!.tagName).toBe('BUTTON');
    });

    it('should be able to create status element', () => {
      uiManager.init();

      const statusBox = document.getElementById('wvn-status');
      expect(statusBox).toBeTruthy();
      expect(statusBox!.tagName).toBe('DIV');
    });

    it('should be able to return mic button from getMicButton', () => {
      uiManager.init();

      const micButton = uiManager.getMicButton();
      expect(micButton).toBeTruthy();
      expect(micButton.id).toBe('wvn-mic-button');
    });
  });

  describe('updateStatus', () => {
    beforeEach(() => {
      uiManager.init();
    });

    it('should be able to show status message', () => {
      uiManager.updateStatus('Test message');

      const statusBox = document.getElementById('wvn-status') as HTMLDivElement;
      expect(statusBox.innerText).toBe('Test message');
      expect(statusBox.classList.contains('visible')).toBe(true);
    });

    it('should be able to hide status when empty message', () => {
      const statusBox = document.getElementById('wvn-status') as HTMLDivElement;
      statusBox.classList.add('visible');

      uiManager.updateStatus('');

      expect(statusBox.classList.contains('visible')).toBe(false);
    });

    it('should be able to auto-hide status after duration', (done) => {
      const statusBox = document.getElementById('wvn-status') as HTMLDivElement;

      uiManager.updateStatus('Test message', 100);

      expect(statusBox.classList.contains('visible')).toBe(true);

      setTimeout(() => {
        expect(statusBox.classList.contains('visible')).toBe(false);
        done();
      }, 150);
    });

    it('should be able to not hide status if message changed during timeout', (done) => {
      const statusBox = document.getElementById('wvn-status') as HTMLDivElement;

      uiManager.updateStatus('Original message', 100);
      uiManager.updateStatus('New message');

      setTimeout(() => {
        expect(statusBox.classList.contains('visible')).toBe(true);
        expect(statusBox.innerText).toBe('New message');
        done();
      }, 150);
    });
  });

  describe('setMicState', () => {
    beforeEach(() => {
      uiManager.init();
    });

    it('should be able to add listening class when isListening is true', () => {
      const micButton = uiManager.getMicButton();

      uiManager.setMicState(true);

      expect(micButton.classList.contains('listening')).toBe(true);
    });

    it('should be able to remove listening class when isListening is false', () => {
      const micButton = uiManager.getMicButton();
      micButton.classList.add('listening');

      uiManager.setMicState(false);

      expect(micButton.classList.contains('listening')).toBe(false);
    });
  });

  describe('highlight', () => {
    let testElement: HTMLElement;

    beforeEach(() => {
      uiManager.init();
      testElement = document.createElement('div');
      testElement.textContent = 'Test Element';
      document.body.appendChild(testElement);
    });

    it('should be able to add highlight class to element', () => {
      uiManager.highlight(testElement);

      expect(testElement.classList.contains('wvn-highlight')).toBe(true);
    });

    it('should be able to not add number label when number is 0', () => {
      uiManager.highlight(testElement, 0);

      const label = testElement.querySelector('.wvn-disambiguation-label');
      expect(label).toBeNull();
    });

    it('should be able to add number label when number is provided', () => {
      uiManager.highlight(testElement, 5);

      const label = testElement.querySelector('.wvn-disambiguation-label') as HTMLElement;
      expect(label).toBeTruthy();
      expect(label.innerText).toBe('5');
    });

    it('should be able to set relative position for static elements with number', () => {
      testElement.style.position = 'static';

      uiManager.highlight(testElement, 1);

      expect(testElement.style.position).toBe('relative');
      expect(testElement.dataset.wvnOriginalPosition).toBe('static');
    });

    it('should be able to not change position for non-static elements', () => {
      testElement.style.position = 'absolute';

      uiManager.highlight(testElement, 1);

      expect(testElement.style.position).toBe('absolute');
      expect(testElement.dataset.wvnOriginalPosition).toBeUndefined();
    });
  });

  describe('clearHighlights', () => {
    let testElements: HTMLElement[];

    beforeEach(() => {
      uiManager.init();
      testElements = [];

      for (let i = 0; i < 3; i++) {
        const element = document.createElement('div');
        element.textContent = `Test Element ${i + 1}`;
        document.body.appendChild(element);
        testElements.push(element);
      }
    });

    it('should be able to remove highlight classes from all elements', () => {
      testElements.forEach((el) => uiManager.highlight(el));

      uiManager.clearHighlights();

      testElements.forEach((el) => {
        expect(el.classList.contains('wvn-highlight')).toBe(false);
      });
    });

    it('should be able to remove disambiguation labels', () => {
      testElements.forEach((el, index) => uiManager.highlight(el, index + 1));

      uiManager.clearHighlights();

      testElements.forEach((el) => {
        const label = el.querySelector('.wvn-disambiguation-label');
        expect(label).toBeNull();
      });
    });

    it('should be able to restore original position for static elements', () => {
      const element = testElements[0];
      element.style.position = 'static';
      uiManager.highlight(element, 1);

      expect(element.style.position).toBe('relative');

      uiManager.clearHighlights();

      expect(element.style.position).toBe('');
      expect(element.dataset.wvnOriginalPosition).toBeUndefined();
    });

    it('should be able to handle elements without original position data', () => {
      const element = testElements[0];
      element.classList.add('wvn-highlight');

      expect(() => uiManager.clearHighlights()).not.toThrow();
      expect(element.classList.contains('wvn-highlight')).toBe(false);
    });
  });

  describe('integration', () => {
    it('should be able to work with complete highlight/clear cycle', () => {
      uiManager.init();

      const element = document.createElement('button');
      element.textContent = 'Test Button';
      document.body.appendChild(element);

      uiManager.highlight(element, 3);
      expect(element.classList.contains('wvn-highlight')).toBe(true);
      expect(element.querySelector('.wvn-disambiguation-label')).toBeTruthy();

      uiManager.clearHighlights();
      expect(element.classList.contains('wvn-highlight')).toBe(false);
      expect(element.querySelector('.wvn-disambiguation-label')).toBeNull();
    });

    it('should be able to handle multiple init calls safely', () => {
      uiManager.init();
      uiManager.init();
      uiManager.init();

      const containers = document.querySelectorAll('#wvn-container');
      expect(containers).toHaveLength(1);
    });
  });
});
