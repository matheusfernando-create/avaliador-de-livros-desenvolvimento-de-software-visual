public class Livro
{
    public int LivroId { get; set; }
    public string Titulo { get; set; } = String.Empty;
    public string Autor { get; set; } = String.Empty;
    public int AnoPublicacao { get; set; }
    public DateTime DataCadastro { get; set; } = DateTime.Now;
    
    public List<Avaliacao> Avaliacoes { get; set; } = new();
}