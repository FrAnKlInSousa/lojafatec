import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  email = '';
  senha = '';

  erro = '';

  entrar(): void {
    const sucesso = this.authService.login(
      this.email,
      this.senha
    );

    if(!sucesso){
      this.erro = 'Email ou senha inválidos.';
      return;
    }

    const retorno = this.route.snapshot.queryParamMap.get('retorno');

    this.router.navigate([retorno || '/']);
  }
}
