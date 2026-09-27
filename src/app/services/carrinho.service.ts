import { Injectable } from "@angular/core";
import { Livro } from "../models/livro";
import { ItemCarrinho } from "../models/item-carrinho";

@Injectable({providedIn: 'root'})
export class CarrinhoService{
  private itens: ItemCarrinho[] = [];

  listar(): ItemCarrinho[]{
    return this.itens;
  }

  adicionar(livro: Livro): void{
    const item = this.itens.find((i) => i.livro.id === livro.id);

    if(item){
      item.quantidade++;
      return;
    }

    this.itens.push({livro, quantidade: 1});
  }

  remover(livroId: number): void{
    this.itens = this.itens.filter((item) => item.livro.id !== livroId);
  }

  quantidadeTotal(): number {
    return this.itens.reduce((total, item) => total + item.quantidade, 0);
  }

  total(): number {
    return this.itens.reduce(
      (total, item) => total + item.livro.preco * item.quantidade, 0
    )
  }


}
