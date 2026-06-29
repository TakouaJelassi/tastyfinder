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
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/invalid-credential': 'Email or password is incorrect.',
      'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
    };
    return map[code] ?? 'Something went wrong. Please try again.';
  }
}
