package com.ads.lojinha;

import java.util.List;

public class PedidoCriacao {
    private int codigoCliente;
    private String entrega;
    private List<ItemPedidoCriacao> itens;

    public int getCodigoCliente() { return codigoCliente; }
    public void setCodigoCliente(int codigoCliente) { this.codigoCliente = codigoCliente; }
    public String getEntrega() { return entrega; }
    public void setEntrega(String entrega) { this.entrega = entrega; }
    public List<ItemPedidoCriacao> getItens() { return itens; }
    public void setItens(List<ItemPedidoCriacao> itens) { this.itens = itens; }

    public static class ItemPedidoCriacao {
        private int codigoLivro;
        private int quantidade;

        public int getCodigoLivro() { return codigoLivro; }
        public void setCodigoLivro(int codigoLivro) { this.codigoLivro = codigoLivro; }
        public int getQuantidade() { return quantidade; }
        public void setQuantidade(int quantidade) { this.quantidade = quantidade; }
    }
}
