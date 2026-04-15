import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth';

export const publicGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  try {
    const user = await auth.authState(); ;
    if (user) {
      router.navigate(['/home'], { replaceUrl: true });
      return false;
    }
    return true;
  } catch {
    return true;
  }
};
