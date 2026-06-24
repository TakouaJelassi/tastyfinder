import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth';

/**
 * Gemeinsame Grundlage für den Demo-Modus: liest/schreibt Demo-Daten im
 * localStorage des Browsers, damit Portfolio-Besucher die App ohne echtes
 * Konto ausprobieren können.
 */
@Injectable({ providedIn: 'root' })
export class DemoDataStore {
  private auth = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  get isDemo(): boolean {
    return this.auth.isDemo;
  }

  read<T>(key: string, fallback: T): T {
    if (!isPlatformBrowser(this.platformId)) return this.clone(fallback);
    const raw = localStorage.getItem(key);
    if (!raw) return this.clone(fallback);
    try {
      return JSON.parse(raw) as T;
    } catch {
      return this.clone(fallback);
    }
  }

  write<T>(key: string, value: T): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }
}
