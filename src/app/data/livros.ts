import { Livro } from "../models/livro";

export const LIVROS: Livro[] = [
  {
    id: 1,
    titulo: 'O Hobbit',
    autor: 'J. R. R. Tolkien',
    descricao: 'Bilbo Bolseiro leva uma vida tranquila até ser convidado para uma aventura inesperada.',
    categoria: 'Fantasia',
    preco: 49.90,
    capa: '/images/livros/o-hobbit.jpg',
    destaque: true
  },
  {
    id: 2,
    titulo: '1984',
    autor: 'George Orwell',
    descricao: 'Um clássico da ficção distópica sobre vigilância, poder e liberdade individual.',
    categoria: 'Ficção',
    preco: 39.90,
    capa: '/images/livros/1984.jpg',
    destaque: true
  },
  {
    id: 3,
    titulo: 'Dom Casmurro',
    autor: 'Machado de Assis',
    descricao: 'Um dos grandes clássicos da literatura brasileira, narrado por Bentinho.',
    categoria: 'Literatura brasileira',
    preco: 32.90,
    capa: '/images/livros/dom-casmurro.jpg',
    destaque: true
  },
  {
    id: 4,
    titulo: 'O Guia do Mochileiro das Galáxias',
    autor: 'Douglas Adams',
    descricao: 'Uma viagem espacial improvável, bem-humorada e completamente fora do planejado.',
    categoria: 'Ficção científica',
    preco: 44.90,
    capa: '/images/livros/o-guia-do-mochileiro-das-galaxias.jpg'
  },
  {
    id: 5,
    titulo: 'A Revolução dos Bichos',
    autor: 'George Orwell',
    descricao: 'Uma fábula política sobre poder, idealismo e as contradições de uma revolução.',
    categoria: 'Ficção',
    preco: 29.90,
    capa: '/images/livros/a-revolucao-dos-bichos.jpg'
  },
  {
    id: 6,
    titulo: 'O Alienista',
    autor: 'Machado de Assis',
    descricao: 'Uma narrativa curta e irônica sobre ciência, loucura e os limites da normalidade.',
    categoria: 'Literatura brasileira',
    preco: 24.90,
    capa: '/images/livros/o-alienista.jpg'
  }
];
