import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CarrinhoService } from '../../services/carrinho.service';
import { AuthService } from '../../services/auth.service';
import { Logradouro } from '../../models/logradouro';
import { PedidosService } from '../../services/pedidos.service';
import { cepValido } from '../../utils/validacoes';
import { mascararCep } from '../../utils/validacoes';

@Component({
  selector: 'app-carrinho',
  imports: [CommonModule, CurrencyPipe, RouterLink, FormsModule],
  templateUrl: './carrinho.html',
  styleUrl: './carrinho.css',
})
export class Carrinho implements OnInit {
  readonly carrinho = inject(CarrinhoService);
  readonly authService = inject(AuthService);
  readonly router = inject(Router);
  private readonly pedidosService = inject(PedidosService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  compraFinalizada = false;
  salvandoPedido = false;
  erroPedido = '';
  digitarOutroEndereco = true;
  enderecoEntrega: Logradouro = { rua: '', numero: '', complemento: '', cep: '', bairro: '', cidade: '', estado: '' };
  readonly mascararCep = mascararCep;

  bloquearCaractereNaoNumerico(evento: KeyboardEvent): void {
    if (evento.ctrlKey || evento.metaKey || evento.altKey || evento.key.length !== 1) return;
    if (!/^\d$/.test(evento.key)) evento.preventDefault();
  }

  ngOnInit(): void {
    const endereco = this.authService.usuarioAtual()?.logradouro;
    if (endereco) {
      this.enderecoEntrega = { ...endereco };
      this.digitarOutroEndereco = !(endereco.rua && endereco.numero && endereco.cep && endereco.bairro && endereco.cidade && endereco.estado);
    }
  }

  alternarEndereco(alternativo: boolean): void {
    this.digitarOutroEndereco = alternativo;
    if (alternativo) {
      this.enderecoEntrega = { rua: '', numero: '', complemento: '', cep: '', bairro: '', cidade: '', estado: '' };
    }
  }

  finalizarCompra(): void{
    const usuario = this.authService.usuarioAtual();
    if(!usuario){
      this.router.navigate(
        ['/login'],
        {queryParams: {
          retorno: '/carrinho'
        }}
      );
      return;
    }
    const endereco = this.digitarOutroEndereco ? this.enderecoEntrega : usuario.logradouro;
    if (!endereco.rua.trim() || !endereco.numero.trim() || !cepValido(endereco.cep)
      || !endereco.bairro.trim() || !endereco.cidade.trim() || !/^[A-Za-z]{2}$/.test(endereco.estado.trim())) {
      this.erroPedido = 'Preencha rua, número, bairro, CEP válido, cidade e UF com duas letras para a entrega.';
      return;
    }

    this.erroPedido = '';
    this.salvandoPedido = true;
    this.pedidosService.criar(usuario.codigo, endereco, this.carrinho.listar()).subscribe({
      next: () => {
        this.carrinho.limpar();
        this.compraFinalizada = true;
        this.salvandoPedido = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.erroPedido = 'Não foi possível registrar o pedido. Tente novamente.';
        this.salvandoPedido = false;
        this.changeDetector.markForCheck();
      },
    });
  }
}
