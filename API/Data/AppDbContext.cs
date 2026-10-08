using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Livro> Livros { get; set; }
    public DbSet<Avaliacao> Avaliacoes { get; set; }

     protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlite("Data Source=AvaliadorLivros.db");
    }

    //Impede que o usuário avalie o mesmo livro mais de uma vez.
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Avaliacao>()
            .HasIndex(a => new { a.UsuarioId, a.LivroId })
            .IsUnique();
    }
}