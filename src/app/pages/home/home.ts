import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { AfterViewInit, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Livro } from '../../models/livro';
import { LivrosService } from '../../services/livros.service';
import { AuthService } from '../../services/auth.service';
import { CAPA_PADRAO } from '../../services/livros.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements AfterViewInit, OnInit {
  readonly livrosService = inject(LivrosService);
  readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);

  livros = signal<Livro[]>([]);
  erroCatalogo = signal('');
  termo = '';
  categoriaSelecionada = '';
  livroParaExcluir: Livro | null = null;
  erroExclusao = '';
  excluindoLivro = false;

  constructor(){
    this.route.queryParamMap.subscribe((params) => {
      this.termo = params.get('q') ?? '';
    });
  }

  ngOnInit(): void {
    this.livrosService.listarDoBackend().subscribe({
      next: (livros) => {
        this.livros.set(livros);
        this.erroCatalogo.set('');
      },
      error: () => {
        this.livros.set([]);
        this.erroCatalogo.set('Não foi possível conectar ao back-end. O catálogo ficará disponível quando a API estiver ligada.');
      },
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

  excluirLivro(livro: Livro): void {
    if (this.authService.usuarioAtual()?.tipo !== 'god') return;
    this.livroParaExcluir = livro;
    this.erroExclusao = '';
  }

  confirmarExclusao(): void {
    const livro = this.livroParaExcluir;
    if (!livro || this.excluindoLivro || this.authService.usuarioAtual()?.tipo !== 'god') return;

    this.excluindoLivro = true;
    this.erroExclusao = '';
    this.livrosService.excluir(livro.id).subscribe({
      next: () => {
        this.livros.update((itens) => itens.filter((item) => item.id !== livro.id));
        this.livroParaExcluir = null;
        this.excluindoLivro = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.erroExclusao = 'Não foi possível excluir o livro. Tente novamente.';
        this.excluindoLivro = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  fecharConfirmacaoExclusao(): void {
    if (this.excluindoLivro) return;
    this.livroParaExcluir = null;
    this.erroExclusao = '';
  }

  usarCapaPadrao(imagem: HTMLImageElement): void {
    imagem.src = CAPA_PADRAO;
  }

  get livrosFiltrados(): Livro[] {
    return this.livrosService.buscarEm(
      this.livros(),
      this.termo,
      this.categoriaSelecionada
    );
  }

  get livrosDestaque(): Livro[]{
    return this.livros().filter((livro) => livro.destaque)
  }

  get categorias(): string[]{
    return [...new Set(
      this.livros().flatMap((livro) => livro.categorias)
    )].sort();
  }

}
