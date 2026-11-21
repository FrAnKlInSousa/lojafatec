import { afterNextRender, Injectable, signal } from "@angular/core";
import { Livro } from "../models/livro";
import { ItemCarrinho } from "../models/item-carrinho";

@Injectable({providedIn: 'root'})
export class CarrinhoService{
  private readonly itens = signal<ItemCarrinho[]>([]);
  readonly carregando = signal(true);

  constructor() {
    afterNextRender(() => {
      window.setTimeout(() => {
        this.itens.set(this.carregar());
        this.carregando.set(false);
      }, 0);
    });
  }

  listar(): ItemCarrinho[]{
    return this.itens();
  }

  adicionar(livro: Livro): void{
    const itens = this.itens();
    const item = itens.find(
      (itemCarrinho) => itemCarrinho.livro.id === livro.id
    );

    if(item){
      item.quantidade++;

    }else{
      itens.push({
        livro,
        quantidade: 1
      });
    }
    this.itens.set([...itens]);
    this.salvar();
  }

  limpar(): void{
    this.itens.set([]);
    this.salvar();
  }

  diminuirQuantidade(livroId: number): void{
    const itens = this.itens();
    const item = itens.find(
      (itemCarrinho) => itemCarrinho.livro.id === livroId
    );

    if(!item){
      return;
    }
    item.quantidade--;

    if(item.quantidade === 0){
      this.itens.set(itens.filter(
        (itemCarrinho) => itemCarrinho.livro.id !== livroId
      ));
    }
    else this.itens.set([...itens]);
    this.salvar();
  }

  quantidadeTotal(): number {
    return this.itens().reduce(
      (total, item) => total + item.quantidade, 0
    );
  }

  total(): number {
    return this.itens().reduce(
      (total, item) => total + this.precoUnitario(item.livro) * item.quantidade, 0
    )
  }

  precoUnitario(livro: Livro): number {
    return livro.precoPromocional && livro.precoPromocional > 0
      ? livro.precoPromocional
      : livro.preco;
  }

  private salvar(): void{
    const itensCompactos = this.itens().map(({ livro, quantidade }) => ({
      quantidade,
      livro: { ...livro, capa: this.urlCapa(livro.id) },
    }));
    localStorage.setItem('carrinho', JSON.stringify(itensCompactos));
  }

  private carregar(): ItemCarrinho[]{
    const dados = localStorage.getItem('carrinho');
    if (!dados) return [];

    try {
      const itens = JSON.parse(dados) as ItemCarrinho[];
      const compactados = itens.map((item) => ({
        ...item,
        livro: {
          ...item.livro,
          capa: this.urlCapa(item.livro.id),
        },
      }));
      this.salvarItensCompactos(compactados);
      return compactados;
    } catch {
      localStorage.removeItem('carrinho');
      return [];
    }
  }

  private salvarItensCompactos(itens: ItemCarrinho[]): void {
    localStorage.setItem('carrinho', JSON.stringify(itens.map(({ livro, quantidade }) => ({
      quantidade,
      livro: { ...livro, capa: this.urlCapa(livro.id) },
    }))));
  }

  private urlCapa(id: number): string {
    return `http://localhost:8081/api/livro/${id}/capa`;
  }




}
