import { Injectable, signal } from '@angular/core';

export interface NotificationMessage {
  type: 'success' | 'error' | 'info';
  text: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  message = signal<NotificationMessage | null>(null);

  show(message: NotificationMessage): void {
    this.message.set(message);
    setTimeout(() => this.message.set(null), 3500);
  }

  success(text: string): void {
    this.show({ type: 'success', text });
  }

  error(text: string): void {
    this.show({ type: 'error', text });
  }
}
