import { Injectable, inject, signal } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, user, User } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Observable } from 'rxjs';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  createdAt: Date;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  // user$: Observable<User | null> = user(this.auth);

  private firestore: Firestore = inject(Firestore);
  private router: Router = inject(Router);

  currentUser = signal<User | null>(null);
  userProfile = signal<UserProfile | null>(null);
  user$ = user(this.auth);

  constructor() {
    this.user$.subscribe(user => {
      this.currentUser.set(user);
      if (user) {
        this.loadUserProfile(user.uid);
      } else {
        this.userProfile.set(null);
      }
    });
  }


  async register(email: string, password: string, displayName: string): Promise<void> {
    try {
      const credential = await createUserWithEmailAndPassword(
        this.auth, 
        email, 
        password
      );

      const userProfile: UserProfile = {
        uid: credential.user.uid,
        email: email,
        displayName: displayName,
        role: 'user',
        createdAt: new Date()
      };

      await setDoc(doc(this.firestore, `users/${credential.user.uid}`), userProfile);
      
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }

  async loadUserProfile(uid: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, `users/${uid}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        this.userProfile.set(docSnap.data() as UserProfile);
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
    }
  }

  isAdmin(): boolean {
    return this.userProfile()?.role === 'admin';
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

}
