export class UIManager {
  private micButton!: HTMLButtonElement;
  private statusBox!: HTMLDivElement;

  public init(): void {
    if (document.getElementById('wvn-container')) return;

    this.createStyles();
    this.createHTML();
    this.bindElements();
  }

  public updateStatus(message: string, duration = 0): void {
    if (!message) {
      this.statusBox.classList.remove('visible');
      return;
    }

    this.statusBox.innerText = message;
    this.statusBox.classList.add('visible');

    if (duration > 0) {
      setTimeout(() => {
        if (this.statusBox.innerText === message) {
          this.statusBox.classList.remove('visible');
        }
      }, duration);
    }
  }

  public setMicState(isListening: boolean): void {
    this.micButton.classList.toggle('listening', isListening);
  }

  public highlight(element: HTMLElement, number = 0): void {
    element.classList.add('wvn-highlight');

    if (number <= 0) return;

    const label = document.createElement('div');
    label.className = 'wvn-disambiguation-label';
    label.innerText = number.toString();

    if (getComputedStyle(element).position === 'static') {
      element.dataset.wvnOriginalPosition = 'static';
      element.style.position = 'relative';
    }
    element.appendChild(label);
  }

  public clearHighlights(): void {
    document.querySelectorAll('.wvn-highlight').forEach((el) => {
      el.classList.remove('wvn-highlight');
      if (el instanceof HTMLElement && el.dataset.wvnOriginalPosition === 'static') {
        el.style.position = '';
        delete el.dataset.wvnOriginalPosition;
      }
    });
    document.querySelectorAll('.wvn-disambiguation-label').forEach((label) => label.remove());
  }

  public getMicButton(): HTMLButtonElement {
    return this.micButton;
  }

  private createStyles(): void {
    const css = `
      #wvn-container{position:fixed;bottom:20px;right:20px;z-index:99999;display:flex;flex-direction:column;align-items:flex-end;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
      #wvn-status{background-color:rgba(0,0,0,0.8);color:white;padding:8px 15px;border-radius:15px;font-size:14px;margin-bottom:10px;opacity:0;transition:opacity .3s ease-in-out;text-align:right}
      #wvn-status.visible{opacity:1}
      #wvn-mic-button{background-color:#007bff;color:white;border:none;width:60px;height:60px;border-radius:50%;cursor:pointer;display:flex;justify-content:center;align-items:center;box-shadow:0 4px 15px rgba(0,0,0,0.2);transition:background-color .2s ease,transform .2s ease}
      #wvn-mic-button:hover{background-color:#0056b3}
      #wvn-mic-button.listening{background-color:#dc3545;transform:scale(1.1)}
      #wvn-mic-button svg{width:28px;height:28px}
      .wvn-highlight{outline:3px solid #ffc107 !important;box-shadow:0 0 15px #ffc107 !important;background-color:rgba(255,193,7,0.2) !important;transition:all .2s ease-in-out}
      .wvn-disambiguation-label{position:absolute;top:-10px;left:-10px;background-color:#dc3545;color:white;border-radius:50%;width:24px;height:24px;display:flex;justify-content:center;align-items:center;font-size:14px;font-weight:bold;z-index:100000}
    `;

    document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);
  }

  private createHTML(): void {
    const html = `
      <div id="wvn-container">
        <div id="wvn-status"></div>
        <button id="wvn-mic-button" title="Ativar Navegador por Voz">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="white">
            <path d="M192 0C139 0 96 43 96 96V256c0 53 43 96 96 96s96-43 96-96V96c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 89.1 66.2 162.7 152 174.4V464H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h144c13.3 0 24-10.7 24-24s-10.7-24-24-24H216V430.4c85.8-11.7 152-85.3 152-174.4V216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 70.7-57.3 128-128 128s-128-57.3-128-128V216z"/>
          </svg>
        </button>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
  }

  private bindElements(): void {
    this.micButton = document.getElementById('wvn-mic-button') as HTMLButtonElement;
    this.statusBox = document.getElementById('wvn-status') as HTMLDivElement;
  }
}
