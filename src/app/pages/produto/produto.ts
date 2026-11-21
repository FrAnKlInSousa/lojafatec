import { CommonModule, CurrencyPipe } from '@angular/common';
import { afterNextRender, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { LivrosService } from '../../services/livros.service';
import { CarrinhoService } from '../../services/carrinho.service';
import { AuthService } from '../../services/auth.service';
import { Livro } from '../../models/livro';
import { EMPTY, catchError, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-produto',
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './produto.html',
  styleUrl: './produto.css',
})
export class Produto implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly livrosService = inject(LivrosService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  readonly carrinho = inject(CarrinhoService);
  readonly authService = inject(AuthService);
  livro?: Livro;
  carregando = true;
  erroProduto = '';
  adicionadoAoCarrinho = false;
  origem: 'card' | 'destaque' | 'carrinho' = 'card';

  constructor() {
    this.origem = history.state.origem ?? 'card';
    afterNextRender(() => {
      window.scrollTo({
        top: 0,
        behavior: 'instant'
      });
    });
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      tap(() => {
        this.carregando = true;
        this.livro = undefined;
        this.erroProduto = '';
        this.changeDetector.markForCheck();
      }),
      switchMap((params) => this.livrosService.buscarNoBackend(Number(params.get('id'))).pipe(
        catchError((erro: { status?: number }) => {
          this.carregando = false;
          this.erroProduto = erro.status === 404
            ? 'Livro não encontrado.'
            : 'Não foi possível carregar este produto. Verifique se o back-end está ligado.';
          this.changeDetector.markForCheck();
          return EMPTY;
        }),
      )),
    ).subscribe((livro) => {
      this.livro = livro;
      this.carregando = false;
      this.changeDetector.markForCheck();
    });
  }

  adicionarAoCarrinho(livro: Livro): void{
    if (this.authService.usuarioAtual()?.tipo !== 'human') return;
    if (this.adicionadoAoCarrinho) {
      return;
    }
    this.carrinho.adicionar(livro);

    this.adicionadoAoCarrinho = true;
  }
}
