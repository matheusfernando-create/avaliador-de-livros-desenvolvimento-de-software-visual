import { useEffect, useState } from "react";
import Estrelas from "../components/Estrelas.jsx";

// Página de Livros (cadastrar, listar, editar, remover e mostrar a média em estrelas).
// Segue o exemplo do professor (CadastrarProduto + ListarProdutos): useState, useEffect
// e fetch com .then. A diferença é que aqui tem editar, remover e a média das notas.

// O front chama "/backend/...": o Vite repassa para a API em http://localhost:5195
// (ver vite.config.js). Por isso não dá erro de CORS.
const URL_API = "/backend";

// Lê a resposta da API. Se deu erro (400, 404...), a API manda a mensagem como texto.
// Aqui a mensagem vira um erro, que é mostrado no .catch de cada requisição.
function lerResposta(resposta) {
  return resposta.json().then((dados) => {
    if (!resposta.ok) {
      throw new Error(typeof dados === "string" ? dados : "Erro " + resposta.status);
    }
    return dados;
  });
}

export default function Livros({ avisar }) {
  //Estados/Variáveis
  const [livros, setLivros] = useState([]);
  const [medias, setMedias] = useState({}); // média de cada livro, pelo livroId
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [ano, setAno] = useState("");
  const [editandoId, setEditandoId] = useState(null); // null = cadastrando

  //useEffect é utilizado para executar qualquer código
  //no momento em que o componente estiver sendo aberto
  useEffect(() => {
    listarLivros();
  }, []);

  //GET: /api/livro/listar
  function listarLivros() {
    fetch(URL_API + "/api/livro/listar")
      .then(lerResposta)
      .then((dados) => {
        setLivros(dados);
        carregarMedias(dados);
      })
      .catch((erro) => avisar(erro.message, "erro"));
  }

  //GET: /livros/{id}/media (uma chamada para cada livro)
  function carregarMedias(lista) {
    lista.forEach((livro) => {
      fetch(URL_API + "/livros/" + livro.livroId + "/media")
        .then(lerResposta)
        .then((dados) => {
          setMedias((atual) => ({ ...atual, [livro.livroId]: dados }));
        })
        .catch(() => {
          // Se falhar, o livro só fica sem a média na tela.
        });
    });
  }

  //POST: /api/livro/cadastrar  ou  PUT: /api/livro/alterar/{id}
  function salvarLivro(e) {
    e.preventDefault();

    const livro = {
      titulo: titulo.trim(),
      autor: autor.trim(),
      anoPublicacao: Number(ano) || 0,
    };

    if (livro.titulo === "") {
      avisar("O título é obrigatório.", "erro");
      return;
    }

    let url = URL_API + "/api/livro/cadastrar";
    let metodo = "POST";
    if (editandoId !== null) {
      url = URL_API + "/api/livro/alterar/" + editandoId;
      metodo = "PUT";
    }

    fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(livro),
    })
      .then(lerResposta)
      .then(() => {
        avisar(metodo === "POST" ? "Livro cadastrado!" : "Livro atualizado!");
        limparFormulario();
        listarLivros();
      })
      .catch((erro) => avisar(erro.message, "erro"));
  }

  // Preenche o formulário com os dados do livro para alterar
  function editarLivro(livro) {
    setEditandoId(livro.livroId);
    setTitulo(livro.titulo);
    setAutor(livro.autor);
    setAno(livro.anoPublicacao ? String(livro.anoPublicacao) : "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function limparFormulario() {
    setEditandoId(null);
    setTitulo("");
    setAutor("");
    setAno("");
  }

  //DELETE: /api/livro/remover/{id}
  function removerLivro(livro) {
    const mensagem =
      'Remover "' +
      livro.titulo +
      '"? As avaliações e os itens de estante deste livro também serão removidos.';
    if (!window.confirm(mensagem)) {
      return;
    }

    fetch(URL_API + "/api/livro/remover/" + livro.livroId, {
      method: "DELETE",
    })
      .then(lerResposta)
      .then(() => {
        avisar("Livro removido.");
        if (editandoId === livro.livroId) {
          limparFormulario();
        }
        listarLivros();
      })
      .catch((erro) => avisar(erro.message, "erro"));
  }

  // Mostra a média do livro em estrelas (ou "Sem avaliações")
  function mostrarMedia(livroId) {
    const media = medias[livroId];
    if (!media) {
      return "…";
    }
    if (media.totalAvaliacoes === 0) {
      return <small>Sem avaliações</small>;
    }
    return (
      <>
        <Estrelas nota={media.media} tamanho="pequeno" />{" "}
        <small>
          {media.media.toFixed(1).replace(".", ",")} ({media.totalAvaliacoes})
        </small>
      </>
    );
  }

  return (
    <section>
      <div className="painel">
        <h3>{editandoId !== null ? "✏️ Editar livro" : "📚 Cadastrar livro"}</h3>
        <form className="formulario" onSubmit={salvarLivro}>
          <label>
            Título *
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </label>
          <label>
            Autor
            <input
              type="text"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
            />
          </label>
          <label className="curto">
            Ano
            <input
              type="number"
              value={ano}
              onChange={(e) => setAno(e.target.value)}
            />
          </label>
          <div className="acoes-form">
            <button className="btn primario" type="submit">
              {editandoId !== null ? "Salvar alterações" : "Cadastrar"}
            </button>
            {editandoId !== null && (
              <button className="btn" type="button" onClick={limparFormulario}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="painel">
        <h3>📖 Lista de livros ({livros.length})</h3>

        {livros.length === 0 ? (
          <p className="vazio">Nenhum livro cadastrado ainda.</p>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>#</th>
                <th>Título</th>
                <th>Autor</th>
                <th>Ano</th>
                <th>Média</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {livros.map((livro) => (
                <tr key={livro.livroId}>
                  <td>{livro.livroId}</td>
                  <td>{livro.titulo}</td>
                  <td>{livro.autor || "—"}</td>
                  <td>{livro.anoPublicacao || "—"}</td>
                  <td>{mostrarMedia(livro.livroId)}</td>
                  <td>
                    <div className="acoes">
                      <button
                        className="btn pequeno"
                        onClick={() => editarLivro(livro)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn pequeno perigo"
                        onClick={() => removerLivro(livro)}
                      >
                        Remover
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}