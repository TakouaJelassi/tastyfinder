import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { NotificationService } from './notification';

describe('NotificationService', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('shows a success message', () => {
    const service = new NotificationService();
    service.success('saved');
    expect(service.message()).toEqual({ type: 'success', text: 'saved' });
  });

  it('shows error and info messages with the right type', () => {
    const service = new NotificationService();
    service.error('boom');
    expect(service.message()?.type).toBe('error');
    service.info('fyi');
    expect(service.message()?.type).toBe('info');
  });

  it('auto-clears the message after the timeout', () => {
    const service = new NotificationService();
    service.success('temp');
    expect(service.message()).not.toBeNull();
    vi.advanceTimersByTime(3500);
    expect(service.message()).toBeNull();
  });
});
