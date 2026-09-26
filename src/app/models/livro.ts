export interface Livro {
  id: number;
  titulo: string;
  autor: string;
  descricao: string;
  categoria: string;
  preco: number;
  capa: string;
  destaque?: boolean;
}
