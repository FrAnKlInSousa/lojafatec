import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { RecuperarSenha } from './pages/recuperar-senha/recuperar-senha';

export const routes: Routes = [
  {path: 'login', component: Login},
  {path: 'recuperar-senha', component: RecuperarSenha}
];
