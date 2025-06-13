
export interface PWAInstallState {
  canInstall: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isChrome: boolean;
  deferredPrompt: any;
}

class PWAInstallService {
  private deferredPrompt: any = null;
  private listeners: ((state: PWAInstallState) => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    // Listen for PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.notifyListeners();
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.notifyListeners();
    });
  }

  public getInstallState(): PWAInstallState {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isChrome = /Chrome|Chromium|Edge/.test(navigator.userAgent) && !isIOS;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const iosStandalone = (window.navigator as any).standalone;
    const isInstalled = isStandalone || iosStandalone;

    return {
      canInstall: !isInstalled && (!!this.deferredPrompt || isIOS || isChrome),
      isInstalled,
      isIOS,
      isChrome,
      deferredPrompt: this.deferredPrompt
    };
  }

  public async install(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      this.deferredPrompt = null;
      this.notifyListeners();
      return true;
    }
    
    return false;
  }

  public subscribe(callback: (state: PWAInstallState) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners() {
    const state = this.getInstallState();
    this.listeners.forEach(listener => listener(state));
  }
}

export const pwaInstallService = new PWAInstallService();
