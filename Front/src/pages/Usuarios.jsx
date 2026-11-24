// Página de Leitores (usuários) — responsável: Yasmin (fez os endpoints de Usuário na API).
//
// O que falta fazer:
// [ ] Formulário para cadastrar leitor (nome obrigatório)               -> api.cadastrarUsuario
// [ ] Lista dos leitores com data de cadastro (formatarData)            -> api.listarUsuarios
// [ ] Botão "Editar" para alterar o nome                                -> api.alterarUsuario
// [ ] Botão "Remover" com confirmação                                   -> api.removerUsuario
//     (a API responde erro 409 se o leitor já fez avaliações: mostrar a mensagem com avisar)
// [ ] (Extra) Ver o histórico de avaliações do leitor                  -> api.avaliacoesDoUsuario
//
// Dicas: as funções da API estão em ../api.js. Use avisar("mensagem") ou avisar(e.message, "erro")
// para mostrar mensagens. Classes de estilo prontas no index.css: painel, formulario, btn, tabela, avatar...

export default function Usuarios({ avisar }) {
  return (
    <section>
      <div className="painel">
        <h3>👤 Leitores</h3>
        <p className="vazio">Página em construção.</p>
      </div>
    </section>
  );
}
