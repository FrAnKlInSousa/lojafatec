import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Logradouro } from '../../models/logradouro';
import { cepValido, cpfValido, emailValido, mascararCep, mascararCpf, mascararTelefone, telefoneValido } from '../../utils/validacoes';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  private readonly auth = inject(AuthService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  readonly usuario = this.auth.usuarioAtual();
  nome = this.usuario?.nome ?? '';
  email = this.usuario?.email ?? '';
  documento = this.usuario?.documento ?? '';
  telefone = this.usuario?.telefone ?? '';
  logradouro: Logradouro = this.usuario?.logradouro ?? {
    rua: '', numero: '', complemento: '', cep: '', bairro: '', cidade: '', estado: '',
  };

  senhaAtual = '';
  novaSenha = '';
  confirmarSenha = '';
  mensagemPerfil = '';
  erroPerfil = '';
  mensagemSenha = '';
  erroSenha = '';
  salvandoPerfil = false;
  salvandoSenha = false;

  readonly mascararCpf = mascararCpf;
  readonly mascararTelefone = mascararTelefone;
  readonly mascararCep = mascararCep;

  bloquearCaractereNaoNumerico(evento: KeyboardEvent): void {
    if (evento.ctrlKey || evento.metaKey || evento.altKey || evento.key.length !== 1) return;
    if (!/^\d$/.test(evento.key)) evento.preventDefault();
  }
  readonly cepValido = cepValido;

  get perfilEmailValido(): boolean { return emailValido(this.email); }
  get perfilCpfValido(): boolean { return cpfValido(this.documento); }
  get perfilTelefoneValido(): boolean { return telefoneValido(this.telefone); }
  get novaSenhaValida(): boolean { return this.novaSenha.length >= 6; }
  get confirmarNovaSenhaValida(): boolean {
    return this.confirmarSenha.length > 0 && this.novaSenha === this.confirmarSenha;
  }

  get perfilValido(): boolean {
    return this.nome.trim().length > 0 && emailValido(this.email) && cpfValido(this.documento)
      && telefoneValido(this.telefone) && this.logradouro.rua.trim().length > 0
      && this.logradouro.numero.trim().length > 0 && cepValido(this.logradouro.cep)
      && this.logradouro.bairro.trim().length > 0 && this.logradouro.cidade.trim().length > 0
      && /^[A-Za-z]{2}$/.test(this.logradouro.estado.trim());
  }

  salvarPerfil(): void {
    if (!this.usuario) return;
    this.mensagemPerfil = '';
    this.erroPerfil = '';
    if (!this.perfilValido) {
      this.erroPerfil = 'Confira os dados: informe um e-mail válido, CPF válido, telefone com DDD e endereço completo.';
      return;
    }
    this.salvandoPerfil = true;
    this.auth.atualizarPerfil(this.usuario.codigo, {
      nome: this.nome.trim(), email: this.email.trim(), documento: this.documento.trim(),
      telefone: this.telefone.trim(), logradouro: this.logradouro,
    }).subscribe({
      next: () => {
        this.mensagemPerfil = 'Dados pessoais atualizados.';
        this.salvandoPerfil = false;
        this.changeDetector.markForCheck();
      },
      error: (erro: { status?: number; error?: unknown }) => {
        const codigoErro = typeof erro.error === 'string'
          ? erro.error
          : (erro.error as { message?: string } | null)?.message ?? '';
        this.erroPerfil = codigoErro === 'EMAIL_DUPLICADO'
          ? 'Este e-mail já está cadastrado em outra conta.'
          : codigoErro === 'CPF_DUPLICADO'
            ? 'Este CPF já está cadastrado em outra conta.'
            : codigoErro === 'CPF_INVALIDO'
              ? 'Informe um CPF válido.'
              : codigoErro === 'EMAIL_INVALIDO'
                ? 'Informe um e-mail válido.'
                : codigoErro === 'TELEFONE_INVALIDO'
                  ? 'Informe um telefone válido com DDD.'
                  : erro.status === 409
                    ? 'Este e-mail já está cadastrado em outra conta.'
                    : 'Não foi possível atualizar os dados. Tente novamente.';
        this.salvandoPerfil = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  salvarSenha(): void {
    if (!this.usuario) return;
    this.mensagemSenha = '';
    this.erroSenha = '';
    if (this.novaSenha.length < 6) {
      this.erroSenha = 'A nova senha deve ter pelo menos 6 caracteres.';
      return;
    }
    if (this.novaSenha !== this.confirmarSenha) {
      this.erroSenha = 'A confirmação de senha não confere.';
      return;
    }

    this.salvandoSenha = true;
    this.auth.alterarSenha(this.usuario.codigo, this.senhaAtual, this.novaSenha).subscribe({
      next: () => {
        this.salvandoSenha = false;
        this.auth.logout();
        this.router.navigate(['/login'], { queryParams: { senhaAlterada: '1' } });
      },
      error: (erro: { status?: number }) => {
        this.erroSenha = erro.status === 401
          ? 'A senha atual está incorreta.'
          : erro.status === 400
            ? 'A nova senha deve ter pelo menos 6 caracteres.'
            : 'Não foi possível alterar a senha. Tente novamente.';
        this.salvandoSenha = false;
        this.changeDetector.markForCheck();
      },
    });
  }
}
