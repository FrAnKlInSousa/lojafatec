import { Injectable } from "@angular/core";
import { Livro } from "../models/livro";
import { LIVROS } from "../data/livros";

@Injectable({providedIn: 'root'})
export class LivrosService{
  private normalizarTexto(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase();
  }

  listar(): Livro[] {
    return LIVROS;
  }

  buscarPorId(id: number): Livro | undefined {
    return LIVROS.find((livro) => livro.id === id);
  }

  buscar(termo: string, categoria?: string): Livro[] {
    const busca = this.normalizarTexto(termo.trim());

    return LIVROS.filter((livro) =>{
      const textoLivroOuAutor =
        !busca ||
        this.normalizarTexto(livro.titulo).includes(busca) ||
        this.normalizarTexto(livro.autor).includes(busca);

      const textoCategoria =
        !categoria ||
        livro.categorias.includes(categoria);

      return textoCategoria && textoLivroOuAutor;
    });
  }
}
