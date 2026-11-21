export interface Livro {
  id: number;
  titulo: string;
  autor?: string;
  descricao: string;
  categorias: string[];
  preco: number;
  precoPromocional?: number;
  capa: string;
  destaque?: boolean;
}
