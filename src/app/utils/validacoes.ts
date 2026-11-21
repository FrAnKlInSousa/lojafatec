export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

export function cpfValido(valor: string): boolean {
  const cpf = somenteDigitos(valor);
  if (cpf.length !== 11 || /^([0-9])\1{10}$/.test(cpf)) return false;

  const calcularDigito = (tamanho: number): number => {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(cpf[i]) * (tamanho + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return calcularDigito(9) === Number(cpf[9]) && calcularDigito(10) === Number(cpf[10]);
}

export function emailValido(valor: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor.trim());
}

export function telefoneValido(valor: string): boolean {
  const telefone = somenteDigitos(valor);
  return /^[1-9]{2}9\d{8}$/.test(telefone) || /^[1-9]{2}[2-5]\d{7}$/.test(telefone);
}

export function cepValido(valor: string): boolean {
  return /^\d{5}-?\d{3}$/.test(valor.trim());
}

export function mascararCpf(valor: string): string {
  const cpf = somenteDigitos(valor).slice(0, 11);
  const parte1 = cpf.slice(0, 3);
  const parte2 = cpf.slice(3, 6);
  const parte3 = cpf.slice(6, 9);
  const parte4 = cpf.slice(9, 11);
  return parte1
    + (cpf.length > 3 ? `.${parte2}` : '')
    + (cpf.length > 6 ? `.${parte3}` : '')
    + (cpf.length > 9 ? `-${parte4}` : '');
}

export function mascararTelefone(valor: string): string {
  const telefone = somenteDigitos(valor).slice(0, 11);
  if (telefone.length <= 2) return telefone;

  const ddd = telefone.slice(0, 2);
  const local = telefone.slice(2);
  const tamanhoBloco = local.startsWith('9') ? 5 : 4;
  const parteInicial = local.slice(0, tamanhoBloco);
  const parteFinal = local.slice(tamanhoBloco, tamanhoBloco + 4);
  return `(${ddd}) ${parteInicial}${parteFinal ? `-${parteFinal}` : ''}`;
}

export function mascararCep(valor: string): string {
  const cep = somenteDigitos(valor).slice(0, 8);
  return cep.length > 5 ? `${cep.slice(0, 5)}-${cep.slice(5)}` : cep;
}
