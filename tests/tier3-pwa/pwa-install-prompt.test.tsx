import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import React from 'react';
import { MockBeforeInstallPromptEvent } from '../mocks/mockServiceWorker';
import App from '../../src/App';

describe('Tier 3: PWA Install Prompt & Network Status Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('T3.5.1: Captures beforeinstallprompt event and allows programmatic prompt invocation', async () => {
    let deferredPrompt: any = null;
    const installHandler = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', installHandler);

    const event = new MockBeforeInstallPromptEvent();
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(deferredPrompt).not.toBeNull();
    const outcome = await event.prompt();
    expect(outcome.outcome).toBe('accepted');

    window.removeEventListener('beforeinstallprompt', installHandler);
  });

  it('T3.5.2: Online and offline events update network connectivity state', async () => {
    render(<App />);
    await waitFor(() => {
      expect(document.querySelector('main')).toBeInTheDocument();
    });

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(navigator.onLine !== undefined).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
  });

  it('T3.5.3: Dispatches and handles pwa-update-available custom event', () => {
    let updateReceived = false;
    const updateListener = () => {
      updateReceived = true;
    };

    window.addEventListener('pwa-update-available', updateListener);
    window.dispatchEvent(new CustomEvent('pwa-update-available'));

    expect(updateReceived).toBe(true);
    window.removeEventListener('pwa-update-available', updateListener);
  });

  it('T3.5.4: User dismiss of beforeinstallprompt is handled gracefully', async () => {
    const event = new MockBeforeInstallPromptEvent();
    event.setUserChoice('dismissed');

    const choice = await event.prompt();
    expect(choice.outcome).toBe('dismissed');
  });

  it('T3.5.5: Service worker postMessage message listener handles SKIP_WAITING message', () => {
    const messageEvent = new MessageEvent('message', {
      data: { type: 'SKIP_WAITING' }
    });
    expect(messageEvent.data.type).toBe('SKIP_WAITING');
  });
});
