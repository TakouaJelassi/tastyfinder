import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from '@angular/fire/auth';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-profile',
  imports: [FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private auth = inject(Auth);
  private storage = inject(Storage);
  authService = inject(AuthService);
  private router = inject(Router);

  name = signal(this.authService.currentUser()?.displayName ?? '');
  avatarPreview = signal(this.authService.currentUser()?.photoURL ?? '');
  selectedFile = signal<File | null>(null);

  currentPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');

  saving = signal(false);
  savingPassword = signal(false);
  successMsg = signal('');
  errorMsg = signal('');
  passwordError = signal('');
  passwordSuccess = signal('');

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.selectedFile.set(file);
    const reader = new FileReader();
    reader.onload = (e) => this.avatarPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async saveProfile(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) return;
    this.saving.set(true);
    this.successMsg.set('');
    this.errorMsg.set('');

    try {
      let photoURL = user.photoURL ?? '';

      if (this.selectedFile()) {
        const storageRef = ref(this.storage, `avatars/${user.uid}`);
        await uploadBytes(storageRef, this.selectedFile()!);
        photoURL = await getDownloadURL(storageRef);
      }

      await updateProfile(user, {
        displayName: this.name(),
        photoURL: photoURL || undefined,
      });

      this.authService.currentUser.set({ ...user, displayName: this.name(), photoURL } as typeof user);
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
    const name = this.authService.currentUser()?.displayName ?? this.authService.currentUser()?.email ?? '?';
    return name.charAt(0).toUpperCase();
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
