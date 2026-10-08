public class Usuario
{
    public int UsuarioId { get; set; }
    public string Nome { get; set; } = String.Empty;
    public DateTime DataCadastro { get; set; } = DateTime.Now;
    
    public List<Avaliacao> Avaliacoes { get; set; } = new();
}