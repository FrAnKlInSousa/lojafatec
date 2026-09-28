import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Livro } from '../../models/livro';
import { LivrosService } from '../../services/livros.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements AfterViewInit {
  private readonly livrosService = inject(LivrosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly livros = this.livrosService.listar();
  termo = '';
  categoriaSelecionada = '';

  constructor(){
    this.route.queryParamMap.subscribe((params) => {
      this.termo = params.get('q') ?? '';
    });
  }

  ngAfterViewInit(): void {
  const scroll = sessionStorage.getItem('home-scroll');

    if (!scroll) {
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: Number(scroll),
          behavior: 'instant'
        });

        sessionStorage.removeItem('home-scroll');
      });
    });
  }

salvarScroll(): void {
  sessionStorage.setItem('home-scroll', String(window.scrollY));
}

  irParaProduto(id: number, origem: 'card' | 'destaque'): void {
    this.salvarScroll();

    this.router.navigate(
      ['/produto', id],
      {
        state: { origem }
      }
    );
  }

  get livrosFiltrados(): Livro[] {
    return this.livrosService.buscar(
      this.termo,
      this.categoriaSelecionada
    );
  }

  get livrosDestaque(): Livro[]{
    return this.livros.filter((livro) => livro.destaque)
  }

  get categorias(): string[]{
    return [...new Set(
      this.livros.flatMap((livro) => livro.categorias)
    )].sort();
  }

}
