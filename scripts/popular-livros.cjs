const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

const raizProjeto = path.resolve(__dirname, '..');
const caminhoDados = path.join(raizProjeto, 'src/app/data/livros.ts');
const urlApi = process.env.API_URL || 'http://localhost:8081/api';
const executar = process.argv.includes('--executar');

function carregarLivros() {
  const codigoTs = fs.readFileSync(caminhoDados, 'utf8');
  const codigoJs = ts.transpileModule(codigoTs, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const moduloDados = new Module(caminhoDados, module);
  moduloDados.filename = caminhoDados;
  moduloDados.paths = Module._nodeModulePaths(path.dirname(caminhoDados));
  moduloDados._compile(codigoJs, caminhoDados);
  return moduloDados.exports.LIVROS;
}

function chaveTitulo(titulo) {
  return titulo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('pt-BR');
}

function imagemComoDataUrl(capa) {
  const arquivo = path.join(raizProjeto, 'public', capa.replace(/^\//, ''));
  if (!fs.existsSync(arquivo)) {
    throw new Error(`Imagem não encontrada: ${arquivo}`);
  }

  const extensao = path.extname(arquivo).toLowerCase();
  const mime = extensao === '.png' ? 'image/png' : extensao === '.jpg' || extensao === '.jpeg' ? 'image/jpeg' : null;
  if (!mime) throw new Error(`Formato de imagem não suportado: ${arquivo}`);

  return `data:${mime};base64,${fs.readFileSync(arquivo).toString('base64')}`;
}

async function executarPopular() {
  const livros = carregarLivros();
  if (process.argv.includes('--validar')) {
    for (const livro of livros) imagemComoDataUrl(livro.capa);
    console.log(`${livros.length} livros e capas locais conferidos; nenhum dado foi enviado ao banco.`);
    return;
  }

  const respostaExistentes = await fetch(`${urlApi}/livros`);
  if (!respostaExistentes.ok) {
    throw new Error(`Não foi possível consultar o catálogo (${respostaExistentes.status}).`);
  }

  const existentes = await respostaExistentes.json();
  const titulosExistentes = new Set(existentes.map((livro) => chaveTitulo(livro.titulo)));
  const pendentes = livros.filter((livro) => !titulosExistentes.has(chaveTitulo(livro.titulo)));

  if (pendentes.length === 0) {
    console.log('Todos os livros de src/app/data/livros.ts já estão no banco.');
    return;
  }

  // Validate all local files before writing, avoiding partial imports from a missing cover.
  const catalogo = pendentes.map((livro) => ({
    livro,
    capa: imagemComoDataUrl(livro.capa),
  }));

  console.log(`${pendentes.length} livro(s) ainda não cadastrado(s):`);
  for (const { livro } of catalogo) console.log(`- ${livro.titulo} (${livro.capa})`);

  if (!executar) {
    console.log('\nPrévia apenas; nada foi gravado. Para inserir, execute: npm run popular:livros -- --executar');
    return;
  }

  for (const { livro, capa } of catalogo) {
    const resposta = await fetch(`${urlApi}/livro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: livro.titulo,
        autor: livro.autor ?? '',
        descricao: livro.descricao ?? '',
        categorias: (livro.categorias ?? []).map((categoria) => categoria.trim().toLocaleLowerCase('pt-BR')),
        preco: Number(livro.preco),
        precoPromocional: Number(livro.precoPromocional ?? 0),
        capa,
        destaque: Boolean(livro.destaque),
      }),
    });

    if (!resposta.ok) {
      const detalhe = await resposta.text();
      throw new Error(`Falha ao cadastrar "${livro.titulo}" (${resposta.status}): ${detalhe}`);
    }
    console.log(`Cadastrado: ${livro.titulo}`);
  }

  console.log('\nCarga concluída. Atualize a página da loja para conferir o catálogo.');
}

executarPopular().catch((erro) => {
  console.error(`Erro: ${erro.message}`);
  process.exitCode = 1;
});
