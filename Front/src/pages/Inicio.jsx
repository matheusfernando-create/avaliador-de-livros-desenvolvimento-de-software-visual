import { useEffect, useState } from "react";
import { api } from "../api.js";
import Estrelas from "../components/Estrelas.jsx";

// Página Inicial.
//
// - Texto de boas-vindas explicando o sistema
// - Cartões com o total de livros, leitores e avaliações  -> api.listarLivros, api.listarUsuarios, api.listarAvaliacoes
// - Ranking dos livros mais bem avaliados                 -> api.mediaLivro para cada livro, ordenando pela média
//
// Clicar num cartão leva para a aba correspondente (irPara).

const TAMANHO_RANKING = 5;

export default function Inicio({ avisar, irPara }) {
  const [totais, setTotais] = useState({ livros: 0, leitores: 0, avaliacoes: 0 });
  const [ranking, setRanking] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const [livros, usuarios, avaliacoes] = await Promise.all([
          api.listarLivros(),
          api.listarUsuarios(),
          api.listarAvaliacoes(),
        ]);
        setTotais({ livros: livros.length, leitores: usuarios.length, avaliacoes: avaliacoes.length });

        // Busca a média de cada livro e mantém só os que já têm avaliação.
        const medias = await Promise.all(livros.map((l) => api.mediaLivro(l.livroId)));
        const ordenados = medias
          .filter((m) => m.totalAvaliacoes > 0)
          .sort((a, b) => b.media - a.media || b.totalAvaliacoes - a.totalAvaliacoes)
          .slice(0, TAMANHO_RANKING);
        setRanking(ordenados);
      } catch (e) {
        avisar(e.message, "erro");
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [avisar]);

  const cartoes = [
    { aba: "livros", icone: "📚", nome: "Livros", valor: totais.livros },
    { aba: "usuarios", icone: "👤", nome: "Leitores", valor: totais.leitores },
    { aba: "avaliacoes", icone: "⭐", nome: "Avaliações", valor: totais.avaliacoes },
  ];

  return (
    <section>
      <div className="boas-vindas">
        <h2>Bem-vindo ao Avaliador de Livros!</h2>
        <p>
          Cadastre livros e leitores, dê notas de 1 a 5 estrelas com comentários e organize sua estante de
          leitura com os status <b>Quero ler</b>, <b>Lendo</b> e <b>Lido</b>. Escolha o leitor no topo da
          página para avaliar e montar a estante como ele.
        </p>
      </div>

      <div className="cartoes">
        {cartoes.map((c) => (
          <div key={c.aba} className="cartao-num" onClick={() => irPara(c.aba)} title={`Ir para ${c.nome}`}>
            <span>
              {c.icone} {c.nome}
            </span>
            <span className="num">{carregando ? "…" : c.valor}</span>
          </div>
        ))}
      </div>

      <div className="painel">
        <h3>🏆 Livros mais bem avaliados</h3>
        {carregando ? (
          <p className="vazio">Carregando…</p>
        ) : ranking.length === 0 ? (
          <p className="vazio">
            Nenhum livro avaliado ainda. <a onClick={() => irPara("avaliacoes")}>Faça a primeira avaliação</a>.
          </p>
        ) : (
          <ol className="ranking">
            {ranking.map((r, i) => (
              <li key={r.livroId}>
                <span className="posicao">{i + 1}º</span>
                <div className="ranking-livro">
                  <b>{r.titulo}</b>
                  <small>{r.autor || "Autor desconhecido"}</small>
                </div>
                <Estrelas nota={r.media} />
                <span className="media">{r.media.toFixed(1)}</span>
                <small className="total">
                  ({r.totalAvaliacoes} {r.totalAvaliacoes === 1 ? "avaliação" : "avaliações"})
                </small>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
