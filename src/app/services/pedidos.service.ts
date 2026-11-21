import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ItemCarrinho } from '../models/item-carrinho';
import { Logradouro } from '../models/logradouro';
import { Pedido } from '../models/pedido';
import { CarrinhoService } from './carrinho.service';
import { LivrosService } from './livros.service';

@Injectable({ providedIn: 'root' })
export class PedidosService {
  private readonly apiUrl = 'http://localhost:8081/api/pedidos';

  constructor(
    private readonly http: HttpClient,
    private readonly carrinho: CarrinhoService,
    private readonly livros: LivrosService,
  ) {}

  criar(codigoCliente: number, entrega: Logradouro, itens: ItemCarrinho[]): Observable<Pedido> {
    return this.http.post<PedidoApi>(this.apiUrl, {
      codigoCliente,
      entrega: JSON.stringify(entrega),
      itens: itens.map((item) => ({ codigoLivro: item.livro.id, quantidade: item.quantidade })),
    }).pipe(map((pedido) => this.converter(pedido)));
  }

  listar(codigoCliente: number): Observable<Pedido[]> {
    return this.http.get<PedidoApi[]>(`${this.apiUrl}/cliente/${codigoCliente}`).pipe(
      map((pedidos) => pedidos.map((pedido) => this.converter(pedido)))
    );
  }

  marcarEntregue(pedido: Pedido, codigoCliente: number): Observable<Pedido> {
    return this.http.patch<PedidoApi>(
      `${this.apiUrl}/${pedido.codigoPedido}/entregue?codigoCliente=${codigoCliente}`,
      {},
    ).pipe(map((atualizado) => this.converter(atualizado)));
  }

  private converter(pedido: PedidoApi): Pedido {
    let entrega: Logradouro = pedido.entrega as unknown as Logradouro;
    if (typeof pedido.entrega === 'string') {
      try { entrega = JSON.parse(pedido.entrega) as Logradouro; }
      catch { entrega = { rua: pedido.entrega, numero: '', complemento: '', cep: '', bairro: '', cidade: '', estado: '' }; }
    }

    let itens = pedido.itens;
    if (typeof itens === 'string') {
      try { itens = JSON.parse(itens) as ItemPedidoApi[]; }
      catch { itens = []; }
    }

    return {
      codigoPedido: pedido.codigoPedido,
      valorTotal: Number(pedido.valorTotal),
      entrega,
      dataPedido: pedido.dataPedido,
      status: pedido.status ?? 'A CAMINHO',
      itens: (itens ?? []).map((item) => {
        const codigoLivro = Number(item.codigoLivro ?? item.codigoProduto);
        return {
          codigoLivro,
          titulo: item.titulo ?? `Livro ${codigoLivro}`,
          capa: item.capa || this.livros.urlCapa(codigoLivro),
          quantidade: Number(item.quantidade),
          valorUnitario: Number(item.valorUnitario ?? item.valor),
          subtotal: Number(item.subtotal ?? Number(item.valorUnitario ?? item.valor) * item.quantidade),
        };
      }),
    };
  }
}

interface ItemPedidoApi {
  codigoLivro?: number;
  codigoProduto?: number;
  titulo?: string;
  capa?: string;
  quantidade: number;
  valorUnitario?: number;
  valor?: number;
  subtotal?: number;
}

interface PedidoApi {
  codigoPedido: number;
  valorTotal: number;
  entrega: string;
  dataPedido: string;
  status?: string;
  itens?: string | ItemPedidoApi[];
}
