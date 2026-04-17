import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithCredential, signInWithEmailAndPassword, User } from '@angular/fire/auth';
import { FirestoreService } from '../firestore/firestore';
import { GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';
import { environment } from 'src/environments/environment';
import { UserProfile } from '../../models/user.model';
import { Timestamp } from 'firebase/firestore';



@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(
    private auth: Auth,
    private firestoreService: FirestoreService,
  ) { }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  authState() {
    return new Promise<User | null>((resolve) => {
      onAuthStateChanged(this.auth, (user) => resolve(user))
    });
  }

  async registerWithEmailAndPassword(profile: Omit<UserProfile, 'uid' | 'biometricEnabled' | 'createdAt'>, password: string) {
    const credential = await createUserWithEmailAndPassword(this.auth, profile.email, password);
    const uid = credential.user.uid;

    const userPrpfile: UserProfile = {
      uid,
      ...profile,
      biometricEnabled: false,
      createdAt: Timestamp.now(),
      fcmToken: "",
    }

    await this.firestoreService.setDocument('users', uid, userPrpfile);
    return credential;
  }


  loginWithEmailAndPassword(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async loginWithGoogle() {
    await GoogleSignIn.initialize({
      clientId: environment.clientIdWeb,
    });

    const { idToken } = await GoogleSignIn.signIn();
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(this.auth, credential);

    const uid = result.user.uid

    const existUser = await this.firestoreService.getDocument('users', uid);

    if (!existUser) {
      const userProfile: UserProfile = {
        uid,
        first_name: result.user.displayName?.split(' ')[0] || '',
        last_name: result.user.displayName?.split(' ').slice(1).join(' ') || '',
        typeDocument: '',
        numberDocument: '',
        country: '',
        email: result.user.email || '',
        biometricEnabled: false,
        createdAt: Timestamp.now(),
      }
      await this.firestoreService.setDocument('users', uid, userProfile);
    }

    return result;
  }

  async verifyCurrentPassword(password: string): Promise<boolean> {
    const currentUser = this.getCurrentUser();
    if (!currentUser || !currentUser.email) return false;

    try {
      // inicio de sesion con email y contraseña para verificar la contraseña actual
      await signInWithEmailAndPassword(this.auth, currentUser.email, password);
      return true;
    } catch (error) {
      return false;
    }
  }


  async logout() {
    return await signOut(this.auth);
  }
}
