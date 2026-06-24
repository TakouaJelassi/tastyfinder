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
import { FirestoreService } from '../../core/services/firestore';

@Component({
  selector: 'app-profile',
  imports: [FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private auth = inject(Auth);
  authService = inject(AuthService);
  private firestoreService = inject(FirestoreService);
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
    this.firestoreService
      .getUserProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((profile) => {
      if (profile?.displayName) this.name.set(profile.displayName);
      if (profile?.avatarBase64) {
        this.avatarBase64.set(profile.avatarBase64);
        this.authService.avatarBase64.set(profile.avatarBase64);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorMsg.set('Bitte eine Bilddatei auswählen.');
      return;
    }

    this.errorMsg.set('');
    this.resizeImage(file, 256)
      .then((dataUrl) => this.avatarBase64.set(dataUrl))
      .catch(() => this.errorMsg.set('Bild konnte nicht verarbeitet werden.'));
  }

  /** Verkleinert das Bild auf max. `size`px (quadratisch, zentriert) und gibt ein JPEG-DataURL zurück. */
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
    if (!user) return;
    this.saving.set(true);
    this.successMsg.set('');
    this.errorMsg.set('');

    try {
      await updateProfile(user, { displayName: this.name() });
      await this.firestoreService.saveUserProfile({
        displayName: this.name(),
        avatarBase64: this.avatarBase64(),
      });
      this.authService.currentUser.set({ ...user, displayName: this.name() } as typeof user);
      this.authService.avatarBase64.set(this.avatarBase64());
      this.successMsg.set('Profil erfolgreich gespeichert!');
    } catch {
      this.errorMsg.set('Fehler beim Speichern. Bitte erneut versuchen.');
    } finally {
      this.saving.set(false);
    }
  }

  async changePassword(): Promise<void> {
    this.passwordError.set('');
    this.passwordSuccess.set('');

    if (this.newPassword() !== this.confirmPassword()) {
      this.passwordError.set('Passwörter stimmen nicht überein.');
      return;
    }
    if (this.newPassword().length < 6) {
      this.passwordError.set('Passwort muss mindestens 6 Zeichen haben.');
      return;
    }

    const user = this.auth.currentUser;
    if (!user || !user.email) return;

    this.savingPassword.set(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, this.currentPassword());
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, this.newPassword());
      this.passwordSuccess.set('Passwort erfolgreich geändert!');
      this.currentPassword.set('');
      this.newPassword.set('');
      this.confirmPassword.set('');
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code ?? '';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        this.passwordError.set('Aktuelles Passwort ist falsch.');
      } else {
        this.passwordError.set('Fehler beim Ändern des Passworts.');
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
