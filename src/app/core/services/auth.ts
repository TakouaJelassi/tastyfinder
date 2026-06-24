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
  demoMode = signal(false);

  /** Wird aufgelöst, sobald Firebase den ersten Auth-Status geliefert hat. */
  readonly ready: Promise<void>;
  private resolveReady!: () => void;

  constructor() {
    this.ready = new Promise<void>((resolve) => (this.resolveReady = resolve));

    if (isPlatformBrowser(this.platformId)) {
      this.demoMode.set(localStorage.getItem('tf_demo_session') === 'active');

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
      const stored = snap.exists()
        ? (snap.data()['avatarBase64'] as string | undefined)
        : undefined;
      this.avatarBase64.set(stored || user.photoURL || '');
    } catch {
      this.avatarBase64.set(user.photoURL || '');
    }
  }

  get uid(): string | null {
    if (this.demoMode()) return 'demo';
    return this.currentUser()?.uid ?? null;
  }

  get isLoggedIn(): boolean {
    return this.demoMode() || !!this.currentUser();
  }

  get isDemo(): boolean {
    return this.demoMode();
  }

  get displayName(): string {
    return this.demoMode() ? 'Demo Workspace' : (this.currentUser()?.displayName ?? 'Benutzer');
  }

  get displayEmail(): string {
    return this.demoMode() ? 'demo@tastyfinder.app' : (this.currentUser()?.email ?? '');
  }

  startDemoSession(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('tf_demo_session', 'active');
    }
    this.demoMode.set(true);
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
    if (this.demoMode()) {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('tf_demo_session');
      }
      this.demoMode.set(false);
      return;
    }
    await signOut(this.auth);
  }
}
