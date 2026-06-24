import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { AuthService } from '../services/auth';
import { DemoDataStore } from './demo-data.store';

const DEMO_KEY = 'tf_demo_profile';

export interface UserProfile {
  displayName?: string;
  avatarBase64?: string;
}

const DEMO_DEFAULT: UserProfile = { displayName: 'Demo Workspace' };

/** Profildaten (Anzeigename + Avatar) pro Nutzer. */
@Injectable({ providedIn: 'root' })
export class ProfileStore {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);
  private demo = inject(DemoDataStore);

  async save(data: UserProfile): Promise<void> {
    const uid = this.auth.uid;
    if (!uid) return;
    if (this.demo.isDemo) {
      const profile = this.demo.read(DEMO_KEY, DEMO_DEFAULT);
      this.demo.write(DEMO_KEY, { ...profile, ...data });
      return;
    }
    await setDoc(doc(this.firestore, `users/${uid}/profile/data`), data, { merge: true });
  }

  get(): Observable<UserProfile | undefined> {
    const uid = this.auth.uid;
    if (!uid) return of(undefined);
    if (this.demo.isDemo) return of(this.demo.read(DEMO_KEY, DEMO_DEFAULT));
    const ref = doc(this.firestore, `users/${uid}/profile/data`);
    return from(
      getDoc(ref).then((snap) => (snap.exists() ? (snap.data() as UserProfile) : undefined)),
    );
  }
}
