import { Logradouro } from './logradouro';

export interface Usuario {
  codigo: number;
  nome: string;
  email: string;
  senha: string;
  ativo: boolean;
  documento: string;
  logradouro: Logradouro;
  telefone: string;
  tipo: 'god' | 'human';
}
