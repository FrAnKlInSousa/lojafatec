import { Injectable } from "@angular/core";
import { Livro } from "../models/livro";
import { LIVROS } from "../data/livros";

@Injectable({providedIn: 'root'})
export class LivrosService{
  listar(): Livro[] {
    return LIVROS;
  }

  buscarPorId(id: number): Livro | undefined {
    return LIVROS.find((livro) => livro.id === id);
  }

  buscar(termo: string, categoria?: string): Livro[] {
    const busca = termo.trim().toLocaleLowerCase();

    return LIVROS.filter((livro) =>{
      const textoLivroOuAutor =
        !busca ||
        livro.titulo.toLocaleLowerCase().includes(busca) ||
        livro.autor.toLocaleLowerCase().includes(busca);

      const textoCategoria =
        !categoria ||
        livro.categorias.includes(categoria);

      return textoCategoria && textoLivroOuAutor;

    }

    );
  }
}
