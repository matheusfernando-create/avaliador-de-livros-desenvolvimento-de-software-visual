import { useCallback, useEffect, useState } from "react";
import { api, STATUS, formatarData } from "../api.js";

// Página da Estante de leitura — responsável: Helder (fez a estante na API).
//
// Mostra a estante do leitor escolhido no seletor do cabeçalho (prop usuarioAtual):
// - resumo com a quantidade de livros em cada status       -> api.resumoEstante
// - lista dos livros da estante                            -> api.estanteDoUsuario
// - filtro por status (clicando nos cartões do resumo)     -> api.estantePorStatus
// - formulário para adicionar um livro com status          -> api.listarLivros + api.adicionarNaEstante
// - troca de status, com data de conclusão quando Lido     -> api.mudarStatus
// - botão para tirar o livro da estante                    -> api.removerDaEstante
//
// A API usa os números 0 (Quero ler), 1 (Lendo) e 2 (Lido) — lista STATUS em ../api.js.

const RESUMO_VAZIO = { queroLer: 0, lendo: 0, lido: 0, total: 0 };

// Nome da propriedade do resumo da API para cada status.
const CAMPO_RESUMO = { 0: "queroLer", 1: "lendo", 2: "lido" };

export default function Estante({ avisar, irPara, usuarioAtual }) {
  const [estante, setEstante] = useState([]); // estante completa do leitor
  const [lista, setLista] = useState([]); // o que aparece na tela (com filtro aplicado)
  const [resumo, setResumo] = useState(RESUMO_VAZIO);
  const [livros, setLivros] = useState([]);
  const [filtro, setFiltro] = useState(null); // null = todos, ou 0, 1, 2
  const [form, setForm] = useState({ livroId: "", status: 0 });
  const [carregando, setCarregando] = useState(true);

  // Quando troca o leitor no cabeçalho, volta a mostrar todos os status.
  useEffect(() => {
    setFiltro(null);
  }, [usuarioAtual]);

  const carregar = useCallback(async () => {
    if (!usuarioAtual) {
      setCarregando(false);
      return;
    }
    try {
      const [completa, filtrada, r, l] = await Promise.all([
        api.estanteDoUsuario(usuarioAtual),
        filtro === null ? null : api.estantePorStatus(usuarioAtual, filtro),
        api.resumoEstante(usuarioAtual),
        api.listarLivros(),
      ]);
      setEstante(completa);
      setLista(filtrada ?? completa);
      setResumo(r);
      setLivros(l);
    } catch (e) {
      avisar(e.message, "erro");
    } finally {
      setCarregando(false);
    }
  }, [usuarioAtual, filtro, avisar]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Só oferece no formulário os livros que ainda não estão na estante do leitor.
  const livrosDisponiveis = livros.filter((l) => !estante.some((e) => e.livroId === l.livroId));

  async function adicionar(e) {
    e.preventDefault();
    if (!form.livroId) return avisar("Escolha um livro.", "erro");
    try {
      await api.adicionarNaEstante({
        usuarioId: usuarioAtual,
        livroId: Number(form.livroId),
        status: form.status,
      });
      avisar("Livro adicionado à estante!");
      setForm({ livroId: "", status: 0 });
      carregar();
    } catch (e) {
      // Ex.: 409 "Este livro já está na estante do usuário."
      avisar(e.message, "erro");
    }
  }

  async function mudarStatus(item, status) {
    if (item.status === status) return;
    try {
      await api.mudarStatus(item.estanteId, {
        usuarioId: usuarioAtual,
        livroId: item.livroId,
        status,
      });
      const nome = STATUS.find((s) => s.valor === status).nome;
      avisar(`"${item.titulo}" agora está em ${nome}.`);
      carregar();
    } catch (e) {
      avisar(e.message, "erro");
    }
  }

  async function remover(item) {
    if (!confirm(`Tirar "${item.titulo}" da estante?`)) return;
    try {
      await api.removerDaEstante(item.estanteId);
      avisar("Livro removido da estante.");
      carregar();
    } catch (e) {
      avisar(e.message, "erro");
    }
  }

  if (!usuarioAtual) {
    return (
      <section>
        <div className="painel">
          <h3>🗂️ Estante de leitura</h3>
          <p className="vazio">
            Cadastre um <a onClick={() => irPara("usuarios")}>leitor</a> e escolha-o no topo da página
            para montar a estante.
          </p>
        </div>
      </section>
    );
  }

  const porcentagemLida = resumo.total ? Math.round((resumo.lido / resumo.total) * 100) : 0;
  const statusFiltro = STATUS.find((s) => s.valor === filtro);

  return (
    <section>
      {/* Resumo: cada cartão também funciona como filtro */}
      <div className="cartoes">
        <div
          className={filtro === null ? "cartao-num selecionado" : "cartao-num"}
          onClick={() => setFiltro(null)}
          title="Mostrar todos"
        >
          <span>🗂️ Total</span>
          <span className="num">{resumo.total}</span>
        </div>
        {STATUS.map((s) => (
          <div
            key={s.valor}
            className={filtro === s.valor ? "cartao-num selecionado" : "cartao-num"}
            onClick={() => setFiltro(filtro === s.valor ? null : s.valor)}
            title={`Filtrar: ${s.nome}`}
          >
            <span>
              {s.icone} {s.nome}
            </span>
            <span className="num">{resumo[CAMPO_RESUMO[s.valor]]}</span>
          </div>
        ))}
      </div>

      <div className="painel">
        <div className="progresso-texto">
          <span>Progresso de leitura</span>
          <span>
            <b>{resumo.lido}</b> de {resumo.total} livros lidos ({porcentagemLida}%)
          </span>
        </div>
        <div className="barra">
          <div className="barra-preenchida" style={{ width: `${porcentagemLida}%` }} />
        </div>
      </div>

      <div className="painel">
        <h3>➕ Adicionar à estante</h3>
        {livros.length === 0 ? (
          <p className="vazio">
            Nenhum livro cadastrado ainda. <a onClick={() => irPara("livros")}>Cadastre um livro</a>.
          </p>
        ) : livrosDisponiveis.length === 0 ? (
          <p className="vazio">Todos os livros cadastrados já estão na estante deste leitor.</p>
        ) : (
          <form className="formulario" onSubmit={adicionar}>
            <label>
              Livro *
              <select value={form.livroId} onChange={(e) => setForm({ ...form, livroId: e.target.value })}>
                <option value="">Selecione…</option>
                {livrosDisponiveis.map((l) => (
                  <option key={l.livroId} value={l.livroId}>
                    {l.titulo} {l.autor ? `— ${l.autor}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <div className="seletor-status">
                {STATUS.map((s) => (
                  <button
                    key={s.valor}
                    type="button"
                    className={form.status === s.valor ? "chip ativo" : "chip"}
                    onClick={() => setForm({ ...form, status: s.valor })}
                  >
                    {s.icone} {s.nome}
                  </button>
                ))}
              </div>
            </label>
            <div className="acoes-form">
              <button className="btn primario" type="submit">
                Adicionar
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="painel">
        <div className="painel-topo">
          <h3>
            📚 {statusFiltro ? `${statusFiltro.icone} ${statusFiltro.nome}` : "Minha estante"} ({lista.length})
          </h3>
          {filtro !== null && (
            <button className="btn pequeno" onClick={() => setFiltro(null)}>
              Mostrar todos
            </button>
          )}
        </div>

        <div style={{ marginTop: 14 }}>
          {carregando ? (
            <p className="vazio">Carregando…</p>
          ) : lista.length === 0 ? (
            <p className="vazio">
              {filtro === null
                ? "A estante está vazia. Adicione um livro acima."
                : `Nenhum livro em "${statusFiltro.nome}".`}
            </p>
          ) : (
            <div className="grade-livros">
              {lista.map((item) => (
                <article key={item.estanteId} className={`cartao-livro status-${item.status}`}>
                  <div className="capa">{item.titulo?.charAt(0).toUpperCase() ?? "?"}</div>
                  <div className="info">
                    <h4>{item.titulo}</h4>
                    <p>{item.autor || "Autor desconhecido"}</p>
                    <small>Adicionado em {formatarData(item.dataAdicionado)}</small>
                    {item.status === 2 && <small>✅ Concluído em {formatarData(item.dataConclusao)}</small>}

                    <div className="seletor-status">
                      {STATUS.map((s) => (
                        <button
                          key={s.valor}
                          className={item.status === s.valor ? "chip ativo" : "chip"}
                          onClick={() => mudarStatus(item, s.valor)}
                          title={`Marcar como ${s.nome}`}
                        >
                          {s.icone} {s.nome}
                        </button>
                      ))}
                    </div>

                    <div className="acoes">
                      <button className="btn pequeno perigo" onClick={() => remover(item)}>
                        Tirar da estante
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
