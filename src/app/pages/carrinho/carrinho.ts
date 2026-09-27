import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarrinhoService } from '../../services/carrinho.service';

@Component({
  selector: 'app-carrinho',
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './carrinho.html',
  styleUrl: './carrinho.css',
})
export class Carrinho {
  readonly carrinho = inject(CarrinhoService);
}
