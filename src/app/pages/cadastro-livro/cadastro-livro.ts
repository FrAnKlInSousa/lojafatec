import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LivrosService } from '../../services/livros.service';

@Component({
  selector: 'app-cadastro-livro',
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro-livro.html',
  styleUrl: './cadastro-livro.css',
})
export class CadastroLivro {
  private readonly livrosService = inject(LivrosService);
  private readonly router = inject(Router);

  titulo = '';
  autor = '';
  descricao = '';
  categorias = '';
  preco = '';
  precoPromocional = '';
  capa = '';
  nomeArquivoCapa = '';
  destaque = false;
  salvando = false;
  erro = '';

  selecionarCapa(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    this.erro = '';
    this.capa = '';
    this.nomeArquivoCapa = '';

    if (!arquivo) return;

    const tiposAceitos = ['image/jpeg', 'image/png'];
    if (!tiposAceitos.includes(arquivo.type)) {
      this.erro = 'Selecione uma imagem JPG ou PNG.';
      input.value = '';
      return;
    }

    const tamanhoMaximo = 4 * 1024 * 1024;
    if (arquivo.size > tamanhoMaximo) {
      this.erro = 'A imagem deve ter no máximo 4 MB.';
      input.value = '';
      return;
    }

    const leitor = new FileReader();
    leitor.onload = () => {
      if (typeof leitor.result === 'string') {
        this.capa = leitor.result;
        this.nomeArquivoCapa = arquivo.name;
      } else {
        this.erro = 'Não foi possível ler a imagem selecionada.';
      }
    };
    leitor.onerror = () => this.erro = 'Não foi possível ler a imagem selecionada.';
    leitor.readAsDataURL(arquivo);
  }

  salvar(): void {
    this.erro = '';
    if (!this.capa) {
      this.erro = 'Selecione uma imagem JPG ou PNG para a capa.';
      return;
    }
    const preco = this.converterValor(this.preco);
    const precoPromocional = this.precoPromocional.trim()
      ? this.converterValor(this.precoPromocional)
      : 0;

    if (preco === null || preco < 0) {
      this.erro = 'Informe um preço válido.';
      return;
    }
    if (precoPromocional === null || precoPromocional < 0) {
      this.erro = 'Informe um valor de promoção válido ou deixe o campo vazio.';
      return;
    }
    if (precoPromocional > 0 && precoPromocional > preco) {
      this.erro = 'O preço promocional não pode ser maior que o preço normal.';
      return;
    }

    this.salvando = true;
    this.livrosService.cadastrar({
      titulo: this.titulo.trim(),
      autor: this.autor.trim(),
      descricao: this.descricao.trim(),
      categorias: this.categorias
        .split(',')
        .map((item) => item.trim().toLocaleLowerCase('pt-BR'))
        .filter(Boolean),
      preco,
      precoPromocional,
      capa: this.capa.trim(),
      destaque: this.destaque,
    }).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.erro = 'Não foi possível cadastrar o livro. Confira a conexão com o back-end.';
        this.salvando = false;
      },
    });
  }

  private converterValor(valor: string): number | null {
    const texto = valor.trim().replace(/\s/g, '');
    if (!texto) {
      return null;
    }

    const normalizado = texto.includes(',')
      ? texto.replace(/\./g, '').replace(',', '.')
      : texto;
    if (!/^\d+(?:\.\d{1,2})?$/.test(normalizado)) {
      return null;
    }
    const numero = Number(normalizado);
    return Number.isFinite(numero) ? numero : null;
  }
}
