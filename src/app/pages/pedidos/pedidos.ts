import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PedidosService } from '../../services/pedidos.service';
import { Pedido } from '../../models/pedido';
import { CAPA_PADRAO } from '../../services/livros.service';

@Component({
  selector: 'app-pedidos',
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.css',
})
export class Pedidos implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly pedidosService = inject(PedidosService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  pedidos: Pedido[] = [];
  carregando = true;
  erro = '';
  pedidoParaConfirmar: Pedido | null = null;
  erroAtualizacao = '';
  atualizandoPedido = false;

  ngOnInit(): void {
    const usuario = this.auth.usuarioAtual();
    if (!usuario) return;
    this.pedidosService.listar(usuario.codigo).subscribe({
      next: (pedidos) => {
        this.pedidos = pedidos;
        this.carregando = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.erro = 'Não foi possível carregar o histórico de pedidos.';
        this.carregando = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  confirmarEntrega(pedido: Pedido): void {
    const usuario = this.auth.usuarioAtual();
    if (!usuario || pedido.status === 'ENTREGUE') return;
    this.pedidoParaConfirmar = pedido;
    this.erroAtualizacao = '';
  }

  confirmarRecebimento(): void {
    const usuario = this.auth.usuarioAtual();
    const pedido = this.pedidoParaConfirmar;
    if (!usuario || !pedido || this.atualizandoPedido) return;

    this.pedidosService.marcarEntregue(pedido, usuario.codigo).subscribe({
      next: (atualizado) => {
        this.pedidos = this.pedidos.map((item) => item.codigoPedido === atualizado.codigoPedido ? atualizado : item);
        this.pedidoParaConfirmar = null;
        this.atualizandoPedido = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.erroAtualizacao = 'Não foi possível atualizar o status do pedido. Tente novamente.';
        this.atualizandoPedido = false;
        this.changeDetector.markForCheck();
      },
    });
    this.atualizandoPedido = true;
  }

  fecharConfirmacao(): void {
    if (this.atualizandoPedido) return;
    this.pedidoParaConfirmar = null;
    this.erroAtualizacao = '';
  }

  rotuloStatus(status: string): string {
    return status === 'ENTREGUE' ? 'Entregue' : 'A caminho';
  }

  usarCapaPadrao(imagem: HTMLImageElement): void {
    imagem.src = CAPA_PADRAO;
  }
}
