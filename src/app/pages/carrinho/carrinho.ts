import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CarrinhoService } from '../../services/carrinho.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-carrinho',
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './carrinho.html',
  styleUrl: './carrinho.css',
})
export class Carrinho {
  readonly carrinho = inject(CarrinhoService);
  readonly authService = inject(AuthService);
  readonly router = inject(Router)

  compraFinalizada = false;

  finalizarCompra(): void{
    if(!this.authService.estaLogado()){
      this.router.navigate(['/login']);
      return;
    }
    this.carrinho.limpar();
    this.compraFinalizada = true;
  }
}
