public class Avaliacao
{
    public int AvaliacaoId { get; set; }
    public int Nota { get; set; }
    public string? Comentario { get; set; }
    public DateTime DataAvaliacao { get; set; } = DateTime.Now;

    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    public int LivroId { get; set; }
    public Livro? Livro { get; set; }
}