// Página de Livros — responsável: Matheus (fez o CRUD de livros na API).
//
// O que falta fazer:
// [ ] Formulário para cadastrar livro (título obrigatório, autor, ano)   -> api.cadastrarLivro
// [ ] Lista dos livros cadastrados                                      -> api.listarLivros
// [ ] Botão "Editar" que preenche o formulário e salva a alteração      -> api.alterarLivro
// [ ] Botão "Remover" com confirmação                                   -> api.removerLivro
// [ ] Mostrar a média de notas de cada livro (componente <Estrelas />)  -> api.mediaLivro
// [ ] (Extra) Ver as avaliações de um livro                            -> api.avaliacoesDoLivro
//
// Dicas: as funções da API estão em ../api.js. Use avisar("mensagem") ou avisar(e.message, "erro")
// para mostrar mensagens. Classes de estilo prontas no index.css: painel, formulario, btn, grade-livros...

export default function Livros({ avisar }) {
  return (
    <section>
      <div className="painel">
        <h3>📚 Livros</h3>
        <p className="vazio">Página em construção.</p>
      </div>
    </section>
  );
}
