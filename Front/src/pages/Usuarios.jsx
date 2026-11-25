import { Fragment, useCallback, useEffect, useState } from "react";
import { api, formatarData } from "../api.js";
import Estrelas from "../components/Estrelas.jsx";

// Página de Leitores (usuários): cadastrar, listar, editar, remover e ver o histórico.
export default function Usuarios({ avisar }) {
  const [usuarios, setUsuarios] = useState([]);
  const [nome, setNome] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  // Histórico aberto: { usuarioId, avaliacoes, livros } ou null.
  const [historico, setHistorico] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setUsuarios(await api.listarUsuarios());
    } catch (e) {
      avisar(e.message, "erro");
    }
  }, [avisar]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function salvar(e) {
    e.preventDefault();
    if (!nome.trim()) return avisar("O nome é obrigatório.", "erro");
    try {
      if (editandoId) {
        await api.alterarUsuario(editandoId, nome.trim());
        avisar("Leitor atualizado!");
      } else {
        await api.cadastrarUsuario(nome.trim());
        avisar("Leitor cadastrado!");
      }
      cancelar();
      carregar();
    } catch (e) {
      avisar(e.message, "erro");
    }
  }

  function editar(u) {
    setEditandoId(u.usuarioId);
    setNome(u.nome);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelar() {
    setEditandoId(null);
    setNome("");
  }

  async function remover(u) {
    if (!confirm(`Remover o leitor "${u.nome}"?`)) return;
    try {
      await api.removerUsuario(u.usuarioId);
      avisar("Leitor removido.");
      if (editandoId === u.usuarioId) cancelar();
      carregar();
    } catch (e) {
      // Ex.: 409 "Este usuário possui avaliações e não pode ser removido."
      avisar(e.message, "erro");
    }
  }

  async function alternarHistorico(u) {
    if (historico?.usuarioId === u.usuarioId) return setHistorico(null);
    try {
      const [avaliacoes, livros] = await Promise.all([
        api.avaliacoesDoUsuario(u.usuarioId),
        api.listarLivros(),
      ]);
      setHistorico({ usuarioId: u.usuarioId, avaliacoes, livros });
    } catch (e) {
      avisar(e.message, "erro");
    }
  }

  const tituloLivro = (id) =>
    historico.livros.find((l) => l.livroId === id)?.titulo ?? `Livro #${id}`;

  return (
    <section>
      <div className="painel">
        <h3>{editandoId ? "✏️ Editar leitor" : "👤 Cadastrar leitor"}</h3>
        <form className="formulario" onSubmit={salvar}>
          <label className="largo">
            Nome *
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do leitor"
            />
          </label>
          <div className="acoes-form">
            <button className="btn primario" type="submit">
              {editandoId ? "Salvar alterações" : "Cadastrar"}
            </button>
            {editandoId && (
              <button className="btn" type="button" onClick={cancelar}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="painel">
        <h3>📋 Leitores ({usuarios.length})</h3>

        {usuarios.length === 0 ? (
          <p className="vazio">Nenhum leitor cadastrado ainda.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="tabela">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Cadastrado em</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <Fragment key={u.usuarioId}>
                    <tr>
                      <td>
                        <span className="avatar">{u.nome.charAt(0).toUpperCase()}</span>{" "}
                        <b>{u.nome}</b>
                      </td>
                      <td>{formatarData(u.dataCadastro)}</td>
                      <td>
                        <div className="acoes">
                          <button className="btn pequeno" onClick={() => alternarHistorico(u)}>
                            {historico?.usuarioId === u.usuarioId ? "Fechar" : "Histórico"}
                          </button>
                          <button className="btn pequeno" onClick={() => editar(u)}>
                            Editar
                          </button>
                          <button className="btn pequeno perigo" onClick={() => remover(u)}>
                            Remover
                          </button>
                        </div>
                      </td>
                    </tr>
                    {historico?.usuarioId === u.usuarioId && (
                      <tr className="linha-detalhe">
                        <td colSpan={3}>
                          {historico.avaliacoes.length === 0 ? (
                            <p className="vazio">Este leitor ainda não fez avaliações.</p>
                          ) : (
                            <ul className="lista-avaliacoes">
                              {historico.avaliacoes.map((a) => (
                                <li key={a.avaliacaoId}>
                                  <b>{tituloLivro(a.livroId)}</b> <Estrelas nota={a.nota} tamanho="pequeno" />{" "}
                                  <small>{formatarData(a.dataAvaliacao)}</small>
                                  {a.comentario && <p>“{a.comentario}”</p>}
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}