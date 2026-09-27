import { Injectable } from "@angular/core";
import { Livro } from "../models/livro";
import { ItemCarrinho } from "../models/item-carrinho";

@Injectable({providedIn: 'root'})
export class CarrinhoService{
  private itens: ItemCarrinho[] = this.carregar();

  listar(): ItemCarrinho[]{
    return this.itens;
  }

  adicionar(livro: Livro): void{
    const item = this.itens.find(
      (itemCarrinho) => itemCarrinho.livro.id === livro.id
    );

    if(item){
      item.quantidade++;

    }else{
      this.itens.push({
        livro,
        quantidade: 1
      });
    }
    this.salvar();
  }

  limpar(): void{
    this.itens = [];
    this.salvar();
  }

  remover(livroId: number): void{
    this.itens = this.itens.filter(
      (item) => item.livro.id !== livroId
    );
    this.salvar();
  }

  quantidadeTotal(): number {
    return this.itens.reduce(
      (total, item) => total + item.quantidade, 0
    );
  }

  total(): number {
    return this.itens.reduce(
      (total, item) => total + item.livro.preco * item.quantidade, 0
    )
  }

  private salvar(): void{
    localStorage.setItem('carrinho', JSON.stringify(this.itens));
  }

  private carregar(): ItemCarrinho[]{
    const dados = localStorage.getItem('carrinho');
    return dados ? JSON.parse(dados) : [];
  }




}
