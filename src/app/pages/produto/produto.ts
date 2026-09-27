import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject} from '@angular/core';
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

  adicionarAoCarrinho(livro: Livro): void{
    this.carrinho.adicionar(livro);

    this.adicionadoAoCarrinho = true;

    setTimeout(()=>{
      this.adicionadoAoCarrinho = false;
    }, 2000);
  }
}
