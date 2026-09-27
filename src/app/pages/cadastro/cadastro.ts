import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cadastro',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css',
})
export class Cadastro {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  nome = '';
  email = '';
  senha = '';

  erro = '';

  cadastrar(): void {
    const sucesso = this.authService.cadastrar(
      this.nome,
      this.email,
      this.senha
    );

    if (!sucesso){
      this.erro = 'Este email já está cadastrado!';
      return;
    }

    this.router.navigate(['/login']);
  }
}
