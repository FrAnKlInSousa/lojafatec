import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const godGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.usuarioAtual()?.tipo === 'god') {
    return true;
  }

  return router.createUrlTree([auth.estaLogado() ? '/' : '/login']);
};
