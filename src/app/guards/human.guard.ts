import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const humanGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.usuarioAtual()?.tipo === 'human'
    ? true
    : router.createUrlTree([auth.estaLogado() ? '/' : '/login']);
};
