import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { Logradouro } from '../models/logradouro';
import { Usuario } from '../models/usuario';
import { tap } from 'rxjs';

type DadosCadastro = Omit<Usuario, 'codigo' | 'ativo' | 'tipo'>;
type UsuarioDaSessao = Omit<Usuario, 'senha'>;
export type DadosPerfil = Pick<Usuario, 'nome' | 'email' | 'documento' | 'telefone' | 'logradouro'>;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://localhost:8081/api/cliente';
  private readonly chaveUsuarioLogado = 'usuarioLogado';

  constructor(private readonly http: HttpClient) {}

  cadastrar(dados: DadosCadastro): Observable<void> {
    return this.http.post(
      this.apiUrl,
      {
        ...dados,
        email: dados.email.trim().toLocaleLowerCase(),
        ativo: 1,
        logradouro: JSON.stringify(dados.logradouro),
        tipo: 'human',
      },
      { responseType: 'text' },
    ).pipe(map(() => undefined));
  }

  login(email: string, senha: string): Observable<boolean> {
    this.logout();
    return this.http.post<ClienteApi | null>(`${this.apiUrl}/login`, {
      email: email.trim().toLocaleLowerCase(),
      senha,
    }).pipe(
      map((cliente) => {
      const codigo = Number(cliente?.codigo);
      if (!cliente || !Number.isFinite(codigo) || codigo <= 0 || Number(cliente.ativo) !== 1) {
        return false;
      }

      const usuario: Usuario = {
        codigo,
        nome: cliente.nome,
        email: cliente.email,
        senha: cliente.senha,
        ativo: cliente.ativo === 1,
        documento: cliente.documento,
        telefone: cliente.telefone,
        logradouro: this.parseLogradouro(cliente.logradouro),
        tipo: cliente.tipo === 'god' ? 'god' : 'human',
      };

      const { senha: _senha, ...sessao } = usuario;
      localStorage.setItem(this.chaveUsuarioLogado, JSON.stringify(sessao));
      return true;
      }),
      catchError((erro: { status?: number }) =>
        erro.status === 401 ? of(false) : throwError(() => erro)
      ),
    );
  }

  atualizarPerfil(codigo: number, dados: DadosPerfil): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${codigo}/perfil`, {
      ...dados,
      email: dados.email.trim().toLocaleLowerCase(),
      logradouro: JSON.stringify(dados.logradouro),
    }).pipe(tap(() => {
      const atual = this.usuarioAtual();
      if (atual) {
        localStorage.setItem(this.chaveUsuarioLogado, JSON.stringify({
          ...atual,
          ...dados,
          email: dados.email.trim().toLocaleLowerCase(),
        }));
      }
    }));
  }

  alterarSenha(codigo: number, senhaAtual: string, novaSenha: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${codigo}/senha`, { senhaAtual, novaSenha });
  }

  logout(): void {
    localStorage.removeItem(this.chaveUsuarioLogado);
  }

  estaLogado(): boolean {
    const dados = localStorage.getItem(this.chaveUsuarioLogado);
    if (!dados) {
      return false;
    }

    try {
      const valido = Number((JSON.parse(dados) as { codigo?: number }).codigo) > 0;
      if (!valido) {
        this.logout();
      }
      return valido;
    } catch {
      this.logout();
      return false;
    }
  }

  usuarioAtual(): UsuarioDaSessao | null {
    const dados = localStorage.getItem(this.chaveUsuarioLogado);
    return dados ? JSON.parse(dados) as UsuarioDaSessao : null;
  }

  private parseLogradouro(valor: string | null): Logradouro {
    if (valor) {
      try {
        return JSON.parse(valor) as Logradouro;
      } catch {
        // Compatibilidade com registros antigos que guardavam só a rua.
      }
    }

    return {
      rua: valor ?? '',
      numero: '',
      complemento: '',
      cep: '',
      bairro: '',
      cidade: '',
      estado: '',
    };
  }
}

interface ClienteApi {
  codigo: number;
  nome: string;
  telefone: string;
  documento: string;
  senha: string;
  logradouro: string | null;
  email: string;
  ativo: number;
  tipo?: string | null;
}
