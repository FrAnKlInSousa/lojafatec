import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

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

  erro = signal('');
  entrando = signal(false);
  senhaAlterada = this.route.snapshot.queryParamMap.get('senhaAlterada') === '1';

  entrar(): void {
    this.erro.set('');
    this.entrando.set(true);
    this.authService.login(
      this.email,
      this.senha
    ).pipe(finalize(() => this.entrando.set(false))).subscribe({
      next: (sucesso) => {
        if (!sucesso) {
          this.erro.set('Email ou senha inválidos.');
          return;
        }

        const retorno = this.route.snapshot.queryParamMap.get('retorno');
        this.router.navigate([retorno || '/']);
      },
      error: () => {
        this.erro.set('Não foi possível conectar ao back-end. Tente novamente.');
      },
    });
  }
}
