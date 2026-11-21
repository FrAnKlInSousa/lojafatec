import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { RecuperarSenha } from './pages/recuperar-senha/recuperar-senha';
import { Cadastro } from './pages/cadastro/cadastro';
import { Home } from './pages/home/home';
import { Produto } from './pages/produto/produto';
import { Carrinho } from './pages/carrinho/carrinho';
import { naoAutenticadoGuard } from './guards/nao-autenticado.guard';
import { godGuard } from './guards/god.guard';
import { CadastroLivro } from './pages/cadastro-livro/cadastro-livro';
import { Perfil } from './pages/perfil/perfil';
import { Pedidos } from './pages/pedidos/pedidos';
import { humanGuard } from './guards/human.guard';

export const routes: Routes = [
  {path: '', component: Home},
  {path: 'login', component: Login, canActivate: [naoAutenticadoGuard]},
  {path: 'recuperar-senha', component: RecuperarSenha},
  {path: 'cadastro', component: Cadastro},
  {path: 'home', component: Home},
  {path: 'produto/:id', component: Produto},
  {path: 'carrinho', component: Carrinho, canActivate: [humanGuard]},
  {path: 'cadastro-livro', component: CadastroLivro, canActivate: [godGuard]},
  {path: 'perfil', component: Perfil, canActivate: [humanGuard]},
  {path: 'pedidos', component: Pedidos, canActivate: [humanGuard]},
];
