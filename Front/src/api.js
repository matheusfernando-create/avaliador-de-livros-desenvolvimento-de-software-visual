// Todas as chamadas à API ficam aqui.
// "/backend" é repassado pelo Vite para http://localhost:5195 (ver vite.config.js).
const BASE = "/backend";

async function requisicao(metodo, caminho, corpo) {
  const resposta = await fetch(BASE + caminho, {
    method: metodo,
    headers: corpo ? { "Content-Type": "application/json" } : undefined,
    body: corpo ? JSON.stringify(corpo) : undefined,
  });

  const texto = await resposta.text();
  let dados = null;
  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = texto;
    }
  }

  if (!resposta.ok) {
    // A API devolve mensagens como "Livro não encontrado." no corpo do erro.
    const mensagem =
      typeof dados === "string" ? dados : dados?.title || `Erro ${resposta.status}`;
    throw new Error(mensagem);
  }
  return dados;
}

// Status da estante: o enum StatusLeitura da API é enviado como número.
export const STATUS = [
  { valor: 0, nome: "Quero ler", icone: "🔖" },
  { valor: 1, nome: "Lendo", icone: "📖" },
  { valor: 2, nome: "Lido", icone: "✅" },
];

export const api = {
  // Livros (CRUD completo)
  listarLivros: () => requisicao("GET", "/api/livro/listar"),
  cadastrarLivro: (livro) => requisicao("POST", "/api/livro/cadastrar", livro),
  alterarLivro: (id, livro) => requisicao("PUT", `/api/livro/alterar/${id}`, livro),
  removerLivro: (id) => requisicao("DELETE", `/api/livro/remover/${id}`),
  mediaLivro: (id) => requisicao("GET", `/livros/${id}/media`),
  avaliacoesDoLivro: (id) => requisicao("GET", `/livros/${id}/avaliacoes`),

  // Usuários (CRUD completo)
  listarUsuarios: () => requisicao("GET", "/usuarios"),
  cadastrarUsuario: (nome) => requisicao("POST", "/usuarios", { nome }),
  alterarUsuario: (id, nome) => requisicao("PUT", `/usuarios/${id}`, { nome }),
  removerUsuario: (id) => requisicao("DELETE", `/usuarios/${id}`),
  avaliacoesDoUsuario: (id) => requisicao("GET", `/usuarios/${id}/avaliacoes`),

  // Avaliações (dependem de um usuário e de um livro já cadastrados)
  listarAvaliacoes: () => requisicao("GET", "/avaliacoes"),
  criarAvaliacao: (dados) => requisicao("POST", "/avaliacoes", dados),
  alterarAvaliacao: (id, dados) => requisicao("PUT", `/avaliacoes/${id}`, dados),
  removerAvaliacao: (id) => requisicao("DELETE", `/avaliacoes/${id}`),

  // Estante de leitura
  estanteDoUsuario: (id) => requisicao("GET", `/usuarios/${id}/estante`),
  estantePorStatus: (id, status) => requisicao("GET", `/usuarios/${id}/estante/${status}`),
  resumoEstante: (id) => requisicao("GET", `/usuarios/${id}/estante/resumo`),
  adicionarNaEstante: (dados) => requisicao("POST", "/estante", dados),
  mudarStatus: (id, dados) => requisicao("PUT", `/estante/${id}`, dados),
  removerDaEstante: (id) => requisicao("DELETE", `/estante/${id}`),
};

export function formatarData(data) {
  if (!data) return "—";
  return new Date(data).toLocaleDateString("pt-BR");
}
