import { Injectable } from "@angular/core";
import { Usuario } from "../models/usuario";

@Injectable({
  providedIn: 'root'
})
export class AuthService{
  private readonly chaveUsuarios = 'usuarios';
  private readonly chaveUsuarioLogado = 'usuarioLogado';

  cadastrar(nome: string, email: string, senha: string): boolean{
    const usuarios = this.listarUsuarios();
    const emailNormalizado = email.trim().toLocaleLowerCase();
    const usuarioExistente = usuarios.some(
      (usuario) => usuario.email === emailNormalizado
    );

    if (usuarioExistente){
      return false;
    }

    const novoUsuario: Usuario = {
      id: Date.now(),
      nome: nome.trim(),
      email: emailNormalizado,
      senha
    };

    usuarios.push(novoUsuario);

    localStorage.setItem(
      this.chaveUsuarios,
      JSON.stringify(usuarios)
    );
    return true;
  }

  login(email: string, senha: string): boolean{
    const usuarios = this.listarUsuarios();
    const emailNormalizado = email.trim().toLocaleLowerCase();

    const usuario = usuarios.find(
      (usuario) =>
        usuario.email === emailNormalizado &&
        usuario.senha === senha
    );

    if (!usuario){
      return false;
    }

    localStorage.setItem(
      this.chaveUsuarioLogado,
      JSON.stringify(usuario)
    );

    return true;
  }

  logout(): void{
    localStorage.removeItem(this.chaveUsuarioLogado);
  }

  estaLogado(): boolean{
    return localStorage.getItem(this.chaveUsuarioLogado) !== null;
  }

  usuarioAtual(): Usuario | null {
    const dados = localStorage.getItem(this.chaveUsuarioLogado);

    return dados ? JSON.parse(dados) : null;
  }

  private listarUsuarios(): Usuario[] {
    const dados = localStorage.getItem(this.chaveUsuarios);

    return dados ? JSON.parse(dados) : [];
  }
}
