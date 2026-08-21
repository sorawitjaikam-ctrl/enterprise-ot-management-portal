import { vi } from 'vitest';

export interface MockServiceWorkerRegistration {
  scope: string;
  installing: { state: string; onstatechange: null | (() => void) } | null;
  waiting: { state: string } | null;
  active: { state: string } | null;
  onupdatefound: null | (() => void);
  unregister: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
}

export function createMockServiceWorkerRegistration(scope = '/'): MockServiceWorkerRegistration {
  return {
    scope,
    installing: {
      state: 'installed',
      onstatechange: null,
    },
    waiting: null,
    active: {
      state: 'activated',
    },
    onupdatefound: null,
    unregister: vi.fn().mockResolvedValue(true),
    update: vi.fn().mockResolvedValue(undefined),
  };
}

export function setupServiceWorkerMocks() {
  const mockRegistration = createMockServiceWorkerRegistration();

  const mockServiceWorkerContainer = {
    register: vi.fn().mockResolvedValue(mockRegistration),
    getRegistration: vi.fn().mockResolvedValue(mockRegistration),
    getRegistrations: vi.fn().mockResolvedValue([mockRegistration]),
    controller: {
      state: 'activated',
      postMessage: vi.fn(),
    },
    ready: Promise.resolve(mockRegistration),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };

  Object.defineProperty(navigator, 'serviceWorker', {
    writable: true,
    value: mockServiceWorkerContainer,
  });

  return { mockRegistration, mockServiceWorkerContainer };
}

export class MockBeforeInstallPromptEvent extends Event {
  readonly platforms: string[] = ['web', 'android', 'windows'];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  private _outcome: 'accepted' | 'dismissed' = 'accepted';

  constructor(type = 'beforeinstallprompt', eventInitDict?: EventInit) {
    super(type, { bubbles: true, cancelable: true, ...eventInitDict });
    this.userChoice = Promise.resolve({ outcome: this._outcome, platform: 'web' });
  }

  prompt = vi.fn().mockImplementation(async () => {
    return { outcome: this._outcome, platform: 'web' };
  });

  setUserChoice(outcome: 'accepted' | 'dismissed') {
    this._outcome = outcome;
  }
}
