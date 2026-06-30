import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from '@angular/fire/auth';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../core/services/auth';
import { ProfileStore } from '../../core/stores/profile.store';
import { Icon } from '../../shared/components/icon/icon';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, Icon],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private auth = inject(Auth);
  authService = inject(AuthService);
  private profileStore = inject(ProfileStore);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  name = signal(this.authService.currentUser()?.displayName ?? '');
  avatarBase64 = signal(this.authService.currentUser()?.photoURL ?? '');

  currentPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');

  saving = signal(false);
  savingPassword = signal(false);
  successMsg = signal('');
  errorMsg = signal('');
  passwordError = signal('');
  passwordSuccess = signal('');

  ngOnInit(): void {
    this.profileStore
      .get()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((profile) => {
        if (profile?.displayName) this.name.set(profile.displayName);
        if (profile?.avatarBase64) {
          this.avatarBase64.set(profile.avatarBase64);
          this.authService.avatarBase64.set(profile.avatarBase64);
        }
      });
  }

  get isDemo(): boolean {
    return this.authService.isDemo;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorMsg.set('Please select an image file.');
      return;
    }

    this.errorMsg.set('');
    this.resizeImage(file, 256)
      .then((dataUrl) => this.avatarBase64.set(dataUrl))
      .catch(() => this.errorMsg.set('Image could not be processed.'));
  }

  /** Scales the image down to `size`px (square, centered) and returns a JPEG data URL. */
  private resizeImage(file: File, size: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject();
          const minSide = Math.min(img.width, img.height);
          const sx = (img.width - minSide) / 2;
          const sy = (img.height - minSide) / 2;
          ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async saveProfile(): Promise<void> {
    const user = this.auth.currentUser;
    this.saving.set(true);
    this.successMsg.set('');
    this.errorMsg.set('');

    try {
      if (!this.isDemo && user) {
        await updateProfile(user, { displayName: this.name() });
        this.authService.currentUser.set({ ...user, displayName: this.name() } as typeof user);
      }
      await this.profileStore.save({
        displayName: this.name(),
        avatarBase64: this.avatarBase64(),
      });
      this.authService.avatarBase64.set(this.avatarBase64());
      this.successMsg.set('Profile saved!');
    } catch {
      this.errorMsg.set('Failed to save. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }

  async changePassword(): Promise<void> {
    this.passwordError.set('');
    this.passwordSuccess.set('');

    if (this.newPassword() !== this.confirmPassword()) {
      this.passwordError.set('Passwords do not match.');
      return;
    }
    if (this.newPassword().length < 6) {
      this.passwordError.set('Password must be at least 6 characters.');
      return;
    }

    const user = this.auth.currentUser;
    if (!user || !user.email) return;

    this.savingPassword.set(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, this.currentPassword());
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, this.newPassword());
      this.passwordSuccess.set('Password changed successfully!');
      this.currentPassword.set('');
      this.newPassword.set('');
      this.confirmPassword.set('');
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code ?? '';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        this.passwordError.set('Current password is incorrect.');
      } else {
        this.passwordError.set('Failed to change password.');
      }
    } finally {
      this.savingPassword.set(false);
    }
  }

  get userInitial(): string {
    const name =
      this.authService.currentUser()?.displayName ?? this.authService.currentUser()?.email ?? '?';
    return name.charAt(0).toUpperCase();
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
