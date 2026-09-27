import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { RecuperarSenha } from './pages/recuperar-senha/recuperar-senha';
import { Cadastro } from './pages/cadastro/cadastro';
import { Home } from './pages/home/home';
import { Produto } from './pages/produto/produto';
import { Carrinho } from './pages/carrinho/carrinho';

export const routes: Routes = [
  {path: 'login', component: Login},
  {path: 'recuperar-senha', component: RecuperarSenha},
  {path: 'cadastro', component: Cadastro},
  {path: 'home', component: Home},
  {path: 'produto/:id', component: Produto},
  {path: 'carrinho', component: Carrinho}
];
