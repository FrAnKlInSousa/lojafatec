import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { Livro } from "../models/livro";

@Injectable({providedIn: 'root'})
export class LivrosService{
  private readonly apiUrl = 'http://localhost:8081/api';

  constructor(private readonly http: HttpClient) {}

  listarDoBackend(): Observable<Livro[]> {
    return this.http.get<LivroApi[]>(`${this.apiUrl}/livros`).pipe(
      map((produtos) => produtos.map((produto) => this.converterProduto(produto)))
    );
  }

  buscarNoBackend(id: number): Observable<Livro> {
    return this.http.get<LivroApi>(`${this.apiUrl}/livro/${id}`).pipe(
      map((produto) => {
        if (!produto.codigo) {
          throw new Error('Produto não encontrado.');
        }
        return produto;
      }),
      map((produto) => this.converterProduto(produto))
    );
  }

  cadastrar(livro: Omit<Livro, 'id'>): Observable<Livro> {
    return this.http.post<LivroApi>(`${this.apiUrl}/livro`, livro).pipe(
      map((produto) => this.converterProduto(produto))
    );
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/livro/${id}`);
  }

  private converterProduto(produto: LivroApi): Livro {
    return {
      id: produto.codigo,
      titulo: produto.titulo,
      autor: produto.autor ?? '',
      descricao: produto.descricao ?? '',
      categorias: produto.categorias ?? [],
      preco: Number(produto.preco),
      precoPromocional: Number(produto.precoPromocional ?? 0),
      capa: produto.capa || (produto.codigo > 0 ? this.urlCapa(produto.codigo) : CAPA_PADRAO),
      destaque: Boolean(produto.destaque),
    };
  }

  private normalizarTexto(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase();
  }

  formatarCategoria(categoria: string): string {
    const texto = categoria.trim().toLocaleLowerCase('pt-BR');
    return texto ? texto[0].toLocaleUpperCase('pt-BR') + texto.slice(1) : texto;
  }

  formatarCategorias(categorias: string[]): string {
    return categorias.map((categoria) => this.formatarCategoria(categoria)).join(' • ');
  }

  urlCapa(id: number): string {
    return `${this.apiUrl}/livro/${id}/capa`;
  }

  buscarEm(livros: Livro[], termo: string, categoria?: string): Livro[] {
    const busca = this.normalizarTexto(termo.trim());

    return livros
      .filter((livro) => {
        const textoLivroOuAutor =
          !busca ||
          this.normalizarTexto(livro.titulo).includes(busca) ||
          this.normalizarTexto(livro.autor ?? '').includes(busca);

        const textoCategoria =
          !categoria ||
          livro.categorias.includes(categoria);

        return textoCategoria && textoLivroOuAutor;
      })
      .sort((a, b) =>
        a.titulo.localeCompare(b.titulo, 'pt-BR', {
          sensitivity: 'base'
        })
      );
  }
}

interface LivroApi {
  codigo: number;
  titulo: string;
  autor?: string;
  descricao?: string;
  categorias?: string[];
  preco: number;
  precoPromocional?: number;
  capa?: string;
  destaque: boolean;
}

export const CAPA_PADRAO = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="420" height="560" viewBox="0 0 420 560"><rect width="420" height="560" fill="#eee9df"/><path d="M80 110h260v340H80z" fill="#d7cfc0"/><path d="M105 140h210v280H105z" fill="#faf8f3"/><text x="210" y="275" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#514b42">Imagem indisponível</text><text x="210" y="310" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#514b42">no cadastro do produto</text></svg>'
);
