using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Livro> Livros { get; set; }
    public DbSet<Avaliacao> Avaliacoes { get; set; }
    public DbSet<Estante> Estantes { get; set; }

     protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlite("Data Source=AvaliadorLivros.db");
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        //Impede que o usuário avalie o mesmo livro mais de uma vez.
        modelBuilder.Entity<Avaliacao>()
            .HasIndex(a => new { a.UsuarioId, a.LivroId })
            .IsUnique();

        //Impede que o mesmo livro apareça duas vezes na estante do mesmo usuário.
        modelBuilder.Entity<Estante>()
            .HasIndex(e => new { e.UsuarioId, e.LivroId })
            .IsUnique();
    }
}
