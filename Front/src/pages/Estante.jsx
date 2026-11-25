// Página da Estante de leitura — responsável: Helder (fez a estante na API).
//
// O que falta fazer:
// [ ] Mostrar a estante do leitor escolhido no seletor do cabeçalho      -> prop usuarioAtual (id do leitor)
// [ ] Lista dos livros da estante do leitor                             -> api.estanteDoUsuario
// [ ] Resumo com a quantidade em cada status (Quero ler, Lendo, Lido)    -> api.resumoEstante
// [ ] Filtro por status (clicando no resumo, por exemplo)               -> api.estantePorStatus
// [ ] Formulário para adicionar um livro com status                     -> api.listarLivros + api.adicionarNaEstante
// [ ] Trocar o status de um livro (mostrar a data de conclusão quando Lido) -> api.mudarStatus
// [ ] Botão para tirar o livro da estante                               -> api.removerDaEstante
//
// Dicas: a lista STATUS (valor, nome, ícone) está em ../api.js. A API usa os números 0, 1 e 2.
// Classes de estilo prontas no index.css: cartoes, cartao-num, chip, barra, grade-livros...

export default function Estante({ avisar, usuarioAtual }) {
  return (
    <section>
      <div className="painel">
        <h3>🗂️ Estante de leitura</h3>
        <p className="vazio">Página em construção.</p>
      </div>
    </section>
  );
}
