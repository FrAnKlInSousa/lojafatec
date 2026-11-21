import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Logradouro } from '../../models/logradouro';
import { cepValido, cpfValido, emailValido, mascararCep, mascararCpf, mascararTelefone, telefoneValido } from '../../utils/validacoes';

@Component({
  selector: 'app-cadastro',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css',
})
export class Cadastro {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);

  nome = '';
  email = '';
  senha = '';
  confirmarSenha = '';
  documento = '';
  telefone = '';
  logradouro: Logradouro = {
    rua: '', numero: '', complemento: '', cep: '', bairro: '', cidade: '', estado: '',
  };

  erro = '';
  cadastrando = false;

  readonly mascararCpf = mascararCpf;
  readonly mascararTelefone = mascararTelefone;
  readonly mascararCep = mascararCep;

  bloquearCaractereNaoNumerico(evento: KeyboardEvent): void {
    if (evento.ctrlKey || evento.metaKey || evento.altKey || evento.key.length !== 1) return;
    if (!/^\d$/.test(evento.key)) evento.preventDefault();
  }
  readonly cepValido = cepValido;
  get cadastroEmailValido(): boolean { return emailValido(this.email); }
  get cadastroCpfValido(): boolean { return cpfValido(this.documento); }
  get cadastroTelefoneValido(): boolean { return telefoneValido(this.telefone); }
  get senhaValida(): boolean { return this.senha.length >= 6; }
  get confirmacaoSenhaValida(): boolean { return this.confirmarSenha.length > 0 && this.confirmarSenha === this.senha; }

  get cadastroValido(): boolean {
    return this.nome.trim().length > 0 && emailValido(this.email) && this.senhaValida
      && this.confirmacaoSenhaValida
      && cpfValido(this.documento) && telefoneValido(this.telefone)
      && this.logradouro.rua.trim().length > 0 && this.logradouro.numero.trim().length > 0
      && cepValido(this.logradouro.cep) && this.logradouro.bairro.trim().length > 0
      && this.logradouro.cidade.trim().length > 0 && /^[A-Za-z]{2}$/.test(this.logradouro.estado.trim());
  }

  cadastrar(): void {
    this.erro = '';
    if (!this.cadastroValido) {
      this.erro = 'Confira os dados: informe um e-mail válido, CPF válido, telefone com DDD e endereço completo.';
      return;
    }
    this.cadastrando = true;
    this.authService.cadastrar({
      nome: this.nome.trim(),
      email: this.email,
      senha: this.senha,
      documento: this.documento.trim(),
      telefone: this.telefone.trim(),
      logradouro: this.logradouro,
    }).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (erro: { status?: number; error?: string }) => {
        this.erro = erro.error === 'EMAIL_DUPLICADO'
          ? 'Este e-mail já está cadastrado.'
          : erro.error === 'CPF_DUPLICADO'
            ? 'Este CPF já está cadastrado.'
            : erro.error === 'CPF_INVALIDO'
              ? 'Informe um CPF válido.'
              : erro.error === 'EMAIL_INVALIDO'
                ? 'Informe um e-mail válido.'
                : erro.error === 'TELEFONE_INVALIDO'
                  ? 'Informe um telefone válido com DDD.'
                  : erro.status === 409
                    ? 'Este e-mail já está cadastrado.'
                    : 'Não foi possível salvar o cadastro. Verifique os dados e tente novamente.';
        this.cadastrando = false;
        this.changeDetector.markForCheck();
      },
    });
  }
}
