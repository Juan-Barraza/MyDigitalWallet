import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth';
import { FirestoreService } from '../firestore/firestore';
import { BehaviorSubject } from 'rxjs';
import { UserProfile } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class Userservice {
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);

  userProfile$ = this.userProfileSubject.asObservable();

  constructor(
    private fireStore: FirestoreService,
    private authService: AuthService
  ) { }


  async fetchUserProfile(): Promise<UserProfile | null> {
    const currentUser = this.authService.getCurrentUser();
    console.log('Current user:', currentUser);
    if (!currentUser) return null;


    const data = await this.fireStore.getDocument('users', currentUser.uid);
    if (data) {
      const userProfile: UserProfile = data as UserProfile;
      this.userProfileSubject.next(userProfile); // noficiacion a los suscriptores
      return userProfile;
    }

    return null;
  }

  async updateUserProfile(newData: Partial<UserProfile>): Promise<void> {
    const currentUser = this.userProfileSubject.value;
    if (!currentUser) {
      throw new Error('No user profile loaded');
    }

    await this.fireStore.updateDocument('users', currentUser.uid, newData);

    // update status local to ui cahange
    const updatedProfile = { ...currentUser, ...newData };
    this.userProfileSubject.next(updatedProfile); // notificar a los suscriptores
  }
}
