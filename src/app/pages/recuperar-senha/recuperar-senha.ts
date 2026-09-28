import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recuperar-senha',
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './recuperar-senha.html',
  styleUrl: './recuperar-senha.css',
})
export class RecuperarSenha {
  email = '';
  mensagem = '';

  enviarLink(): void{
    this.mensagem = `Se o email informado estiver cadastrado, um email com o link para recuperação de senha será enviado}.`
    this.email = '';
  }
}
