import { inject, Inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const naoAutenticadoGuard: CanActivateFn = () =>{
  const authService = inject(AuthService);
  const router = inject(Router);

  if(authService.estaLogado()){
    return router.createUrlTree(['/'])
  }

  return true;
};
