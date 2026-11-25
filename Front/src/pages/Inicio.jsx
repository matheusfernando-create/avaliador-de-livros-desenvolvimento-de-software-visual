// Página Inicial — responsável: a definir pela equipe.
//
// O que falta fazer:
// [ ] Texto de boas-vindas explicando o sistema
// [ ] Cartões com o total de livros, leitores e avaliações  -> api.listarLivros, api.listarUsuarios, api.listarAvaliacoes
// [ ] (Extra) Ranking dos livros mais bem avaliados          -> api.mediaLivro para cada livro, ordenando pela média
//
// Dicas: use irPara("livros") para mudar de aba ao clicar num cartão.
// Classes de estilo prontas no index.css: boas-vindas, cartoes, cartao-num, ranking...

export default function Inicio({ avisar, irPara }) {
  return (
    <section>
      <div className="painel">
        <h3>🏠 Início</h3>
        <p className="vazio">Página em construção.</p>
      </div>
    </section>
  );
}
