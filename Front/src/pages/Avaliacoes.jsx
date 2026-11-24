import { useCallback, useEffect, useState } from "react";
import { api, formatarData } from "../api.js";
import Estrelas from "../components/Estrelas.jsx";

const VAZIO = { usuarioId: "", livroId: "", nota: 0, comentario: "" };

// Avaliações: usam o relacionamento com Usuário e Livro já cadastrados.
export default function Avaliacoes({ avisar, irPara, usuarioAtual }) {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [livros, setLivros] = useState([]);
  const [form, setForm] = useState(VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [filtroLivro, setFiltroLivro] = useState("");
  const [soDoLeitor, setSoDoLeitor] = useState(false);

  // Quando troca o leitor no seletor do cabeçalho, o formulário passa a avaliar como ele.
  useEffect(() => {
    if (!editandoId) setForm((f) => ({ ...f, usuarioId: usuarioAtual ? String(usuarioAtual) : "" }));
  }, [usuarioAtual, editandoId]);

  const carregar = useCallback(async () => {
    try {
      const [a, u, l] = await Promise.all([
        api.listarAvaliacoes(),
        api.listarUsuarios(),
        api.listarLivros(),
      ]);
      setAvaliacoes(a.sort((x, y) => new Date(y.dataAvaliacao) - new Date(x.dataAvaliacao)));
      setUsuarios(u);
      setLivros(l);
    } catch (e) {
      avisar(e.message, "erro");
    }
  }, [avisar]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function salvar(e) {
    e.preventDefault();
    if (!form.usuarioId || !form.livroId) return avisar("Escolha o leitor e o livro.", "erro");
    if (form.nota < 1) return avisar("Escolha uma nota de 1 a 5 estrelas.", "erro");
    const dados = {
      usuarioId: Number(form.usuarioId),
      livroId: Number(form.livroId),
      nota: form.nota,
      comentario: form.comentario.trim() || null,
    };
    try {
      if (editandoId) {
        await api.alterarAvaliacao(editandoId, dados);
        avisar("Avaliação atualizada!");
      } else {
        await api.criarAvaliacao(dados);
        avisar("Avaliação registrada!");
      }
      cancelar();
      carregar();
    } catch (e) {
      // Ex.: 409 "Este usuário já avaliou este livro."
      avisar(e.message, "erro");
    }
  }

  function editar(a) {
    setEditandoId(a.avaliacaoId);
    setForm({
      usuarioId: String(a.usuarioId),
      livroId: String(a.livroId),
      nota: a.nota,
      comentario: a.comentario ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelar() {
    setEditandoId(null);
    setForm({ ...VAZIO, usuarioId: usuarioAtual ? String(usuarioAtual) : "" });
  }

  async function remover(a) {
    if (!confirm("Remover esta avaliação?")) return;
    try {
      await api.removerAvaliacao(a.avaliacaoId);
      avisar("Avaliação removida.");
      carregar();
    } catch (e) {
      avisar(e.message, "erro");
    }
  }

  const nomeUsuario = (id) => usuarios.find((u) => u.usuarioId === id)?.nome ?? `Leitor #${id}`;
  const livro = (id) => livros.find((l) => l.livroId === id);

  const semCadastros = usuarios.length === 0 || livros.length === 0;
  const lista = avaliacoes
    .filter((a) => !filtroLivro || a.livroId === Number(filtroLivro))
    .filter((a) => !soDoLeitor || a.usuarioId === usuarioAtual);

  return (
    <section>
      <div className="painel">
        <h3>{editandoId ? "✏️ Editar avaliação" : "⭐ Avaliar um livro"}</h3>

        {semCadastros ? (
          <p className="vazio">
            Para avaliar, cadastre antes pelo menos um{" "}
            <a onClick={() => irPara("usuarios")}>leitor</a> e um{" "}
            <a onClick={() => irPara("livros")}>livro</a>.
          </p>
        ) : (
          <form className="formulario" onSubmit={salvar}>
            <label>
              Leitor *
              <select
                value={form.usuarioId}
                disabled={!!editandoId}
                onChange={(e) => setForm({ ...form, usuarioId: e.target.value })}
              >
                <option value="">Selecione…</option>
                {usuarios.map((u) => (
                  <option key={u.usuarioId} value={u.usuarioId}>
                    {u.nome}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Livro *
              <select
                value={form.livroId}
                disabled={!!editandoId}
                onChange={(e) => setForm({ ...form, livroId: e.target.value })}
              >
                <option value="">Selecione…</option>
                {livros.map((l) => (
                  <option key={l.livroId} value={l.livroId}>
                    {l.titulo}
                  </option>
                ))}
              </select>
            </label>
            <label className="curto">
              Nota *
              <Estrelas nota={form.nota} aoEscolher={(n) => setForm({ ...form, nota: n })} tamanho="grande" />
            </label>
            <label className="largo">
              Comentário
              <textarea
                rows={3}
                value={form.comentario}
                onChange={(e) => setForm({ ...form, comentario: e.target.value })}
                placeholder="O que você achou do livro?"
              />
            </label>
            <div className="acoes-form">
              <button className="btn primario" type="submit">
                {editandoId ? "Salvar alterações" : "Registrar avaliação"}
              </button>
              {editandoId && (
                <button className="btn" type="button" onClick={cancelar}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      <div className="painel">
        <div className="painel-topo">
          <h3>💬 Avaliações ({lista.length})</h3>
          <label className="check">
            <input type="checkbox" checked={soDoLeitor} onChange={(e) => setSoDoLeitor(e.target.checked)} />
            Só de {nomeUsuario(usuarioAtual)}
          </label>
          <select className="busca" value={filtroLivro} onChange={(e) => setFiltroLivro(e.target.value)}>
            <option value="">Todos os livros</option>
            {livros.map((l) => (
              <option key={l.livroId} value={l.livroId}>
                {l.titulo}
              </option>
            ))}
          </select>
        </div>

        {lista.length === 0 ? (
          <p className="vazio">Nenhuma avaliação ainda.</p>
        ) : (
          <div className="grade-avaliacoes">
            {lista.map((a) => (
              <article key={a.avaliacaoId} className="cartao-avaliacao">
                <div className="cartao-avaliacao-topo">
                  <span className="avatar">{nomeUsuario(a.usuarioId).charAt(0).toUpperCase()}</span>
                  <div>
                    <b>{nomeUsuario(a.usuarioId)}</b>
                    <small> avaliou </small>
                    <b>{livro(a.livroId)?.titulo ?? `Livro #${a.livroId}`}</b>
                  </div>
                </div>
                <Estrelas nota={a.nota} />
                {a.comentario && <p className="comentario">“{a.comentario}”</p>}
                <div className="cartao-avaliacao-rodape">
                  <small>{formatarData(a.dataAvaliacao)}</small>
                  <div className="acoes">
                    <button className="btn pequeno" onClick={() => editar(a)}>
                      Editar
                    </button>
                    <button className="btn pequeno perigo" onClick={() => remover(a)}>
                      Remover
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
