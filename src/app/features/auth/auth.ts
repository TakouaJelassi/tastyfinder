import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-auth',
  imports: [FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class AuthPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  mode = signal<'login' | 'register'>('login');
  name = signal('');
  email = signal('');
  password = signal('');
  error = signal('');
  loading = signal(false);

  toggleMode(): void {
    this.mode.update((m) => (m === 'login' ? 'register' : 'login'));
    this.error.set('');
  }

  async submit(): Promise<void> {
    this.error.set('');
    this.loading.set(true);
    try {
      if (this.mode() === 'register') {
        await this.authService.register(this.email(), this.password(), this.name());
      } else {
        await this.authService.login(this.email(), this.password());
      }
      this.router.navigate(['/home']);
    } catch (e: unknown) {
      this.error.set(this.translateError(e));
    } finally {
      this.loading.set(false);
    }
  }

  async loginWithGoogle(): Promise<void> {
    this.error.set('');
    this.loading.set(true);
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/home']);
    } catch (e: unknown) {
      this.error.set(this.translateError(e));
    } finally {
      this.loading.set(false);
    }
  }

  startDemo(): void {
    this.authService.startDemoSession();
    this.router.navigate(['/library']);
  }

  private translateError(e: unknown): string {
    const code = (e as { code?: string })?.code ?? '';
    const map: Record<string, string> = {
      'auth/email-already-in-use': 'Diese E-Mail ist bereits registriert.',
      'auth/invalid-email': 'Ungültige E-Mail-Adresse.',
      'auth/weak-password': 'Passwort muss mindestens 6 Zeichen haben.',
      'auth/user-not-found': 'Kein Konto mit dieser E-Mail gefunden.',
      'auth/wrong-password': 'Falsches Passwort.',
      'auth/invalid-credential': 'E-Mail oder Passwort falsch.',
      'auth/popup-closed-by-user': 'Google Login abgebrochen.',
      'auth/too-many-requests': 'Zu viele Versuche. Bitte später erneut versuchen.',
    };
    return map[code] ?? 'Ein Fehler ist aufgetreten. Bitte erneut versuchen.';
  }
}
