import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile,
  User,
} from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private platformId = inject(PLATFORM_ID);

  currentUser = signal<User | null>(null);
  loading = signal(true);
  avatarBase64 = signal<string>('');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      onAuthStateChanged(this.auth, (user) => {
        this.currentUser.set(user);
        this.loading.set(false);
      });
    } else {
      this.loading.set(false);
    }
  }

  get uid(): string | null {
    return this.currentUser()?.uid ?? null;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  async register(email: string, password: string, name: string): Promise<void> {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    this.currentUser.set({ ...cred.user, displayName: name } as User);
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}
