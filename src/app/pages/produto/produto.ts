import { CommonModule, CurrencyPipe } from '@angular/common';
import { afterNextRender, Component, inject} from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { LivrosService } from '../../services/livros.service';
import { CarrinhoService } from '../../services/carrinho.service';
import { Livro } from '../../models/livro';

@Component({
  selector: 'app-produto',
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './produto.html',
  styleUrl: './produto.css',
})
export class Produto {
  private readonly route = inject(ActivatedRoute);
  private readonly livrosService = inject(LivrosService);
  readonly carrinho = inject(CarrinhoService);
  readonly livro = this.livrosService.buscarPorId(
    Number(this.route.snapshot.paramMap.get('id'))
  );
  adicionadoAoCarrinho = false;
  origem: 'card' | 'destaque' = 'card';

  constructor() {
    this.origem = history.state.origem ?? 'card';

    afterNextRender(() => {
      window.scrollTo({
        top: 0,
        behavior: 'instant'
      });
    });
  }

  adicionarAoCarrinho(livro: Livro): void{
    if (this.adicionadoAoCarrinho) {
      return;
    }
    this.carrinho.adicionar(livro);

    this.adicionadoAoCarrinho = true;
  }
}
