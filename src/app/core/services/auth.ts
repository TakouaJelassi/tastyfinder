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
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private platformId = inject(PLATFORM_ID);

  currentUser = signal<User | null>(null);
  loading = signal(true);
  avatarBase64 = signal<string>('');

  /** Wird aufgelöst, sobald Firebase den ersten Auth-Status geliefert hat. */
  readonly ready: Promise<void>;
  private resolveReady!: () => void;

  constructor() {
    this.ready = new Promise<void>((resolve) => (this.resolveReady = resolve));

    if (isPlatformBrowser(this.platformId)) {
      onAuthStateChanged(this.auth, (user) => {
        this.currentUser.set(user);
        this.loading.set(false);
        if (user) {
          this.loadAvatar(user);
        } else {
          this.avatarBase64.set('');
        }
        this.resolveReady();
      });
    } else {
      this.loading.set(false);
      this.resolveReady();
    }
  }

  /** Lädt das gespeicherte Profilbild aus Firestore, fällt sonst auf das Google-Bild zurück. */
  private async loadAvatar(user: User): Promise<void> {
    try {
      const ref = doc(this.firestore, `users/${user.uid}/profile/data`);
      const snap = await getDoc(ref);
      const stored = snap.exists() ? (snap.data()['avatarBase64'] as string | undefined) : undefined;
      this.avatarBase64.set(stored || user.photoURL || '');
    } catch {
      this.avatarBase64.set(user.photoURL || '');
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
