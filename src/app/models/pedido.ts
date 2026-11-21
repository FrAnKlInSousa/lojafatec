import { Logradouro } from './logradouro';

export interface ItemPedido {
  codigoLivro: number;
  titulo: string;
  capa: string;
  quantidade: number;
  valorUnitario: number;
  subtotal: number;
}

export interface Pedido {
  codigoPedido: number;
  valorTotal: number;
  entrega: Logradouro;
  dataPedido: string;
  status: 'A CAMINHO' | 'ENTREGUE' | string;
  itens: ItemPedido[];
}
