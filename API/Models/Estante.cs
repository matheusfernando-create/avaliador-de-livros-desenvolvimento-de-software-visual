// Estante = a "lista de leitura" do usuário (tipo a Watchlist do Letterboxd).
// É uma tabela de LIGAÇÃO entre Usuario e Livro (relacionamento N:N com dados extras):
//   - um usuário pode ter vários livros na estante
//   - um livro pode estar na estante de vários usuários
//   - cada ligação guarda o Status da leitura

public enum StatusLeitura
{
    QueroLer = 0,
    Lendo = 1,
    Lido = 2
}

public class Estante
{
    public int EstanteId { get; set; }
    public StatusLeitura Status { get; set; } = StatusLeitura.QueroLer;
    public DateTime DataAdicionado { get; set; } = DateTime.Now;
    public DateTime? DataConclusao { get; set; } // Apenas quando status = Lido
    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }
    public int LivroId { get; set; }
    public Livro? Livro { get; set; }

}
