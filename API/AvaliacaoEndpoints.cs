using Microsoft.EntityFrameworkCore;

// Endpoints de Avaliação (CRUD) e média de notas por livro.
// Para ativar, o Program.cs precisa ter esta linha antes do app.Run():
//     app.MapAvaliacaoEndpoints();

public static class AvaliacaoEndpoints
{
    public static void MapAvaliacaoEndpoints(this WebApplication app)
    {
        var grupo = app.MapGroup("/avaliacoes");

        // Listar todas as avaliações
        grupo.MapGet("/", async (AppDbContext db) =>
            await db.Avaliacoes
                .Select(a => new { a.AvaliacaoId, a.Nota, a.Comentario, a.DataAvaliacao, a.LivroId, a.UsuarioId })
                .ToListAsync());

        // Buscar uma avaliação pelo id
        grupo.MapGet("/{id:int}", async (int id, AppDbContext db) =>
        {
            var a = await db.Avaliacoes.FindAsync(id);
            return a is null
                ? Results.NotFound()
                : Results.Ok(new { a.AvaliacaoId, a.Nota, a.Comentario, a.DataAvaliacao, a.LivroId, a.UsuarioId });
        });

        // Criar uma avaliação (usa o relacionamento: precisa de um Livro e de um Usuário existentes)
        grupo.MapPost("/", async (AvaliacaoDto dto, AppDbContext db) =>
        {
            if (dto.Nota < 1 || dto.Nota > 5)
                return Results.BadRequest("A nota deve ser de 1 a 5.");
            if (!await db.Livros.AnyAsync(l => l.LivroId == dto.LivroId))
                return Results.BadRequest("Livro não encontrado.");
            if (!await db.Usuarios.AnyAsync(u => u.UsuarioId == dto.UsuarioId))
                return Results.BadRequest("Usuário não encontrado.");

            // O banco só permite uma avaliação por usuário e livro (índice único no AppDbContext)
            if (await db.Avaliacoes.AnyAsync(a => a.UsuarioId == dto.UsuarioId && a.LivroId == dto.LivroId))
                return Results.Conflict("Este usuário já avaliou este livro.");

            var nova = new Avaliacao
            {
                LivroId = dto.LivroId,
                UsuarioId = dto.UsuarioId,
                Nota = dto.Nota,
                Comentario = dto.Comentario
            };

            db.Avaliacoes.Add(nova);
            await db.SaveChangesAsync();

            return Results.Created($"/avaliacoes/{nova.AvaliacaoId}",
                new { nova.AvaliacaoId, nova.Nota, nova.Comentario, nova.DataAvaliacao, nova.LivroId, nova.UsuarioId });
        });

        // Alterar nota e comentário de uma avaliação
        grupo.MapPut("/{id:int}", async (int id, AvaliacaoDto dto, AppDbContext db) =>
        {
            if (dto.Nota < 1 || dto.Nota > 5)
                return Results.BadRequest("A nota deve ser de 1 a 5.");

            var a = await db.Avaliacoes.FindAsync(id);
            if (a is null) return Results.NotFound();

            a.Nota = dto.Nota;
            a.Comentario = dto.Comentario;
            await db.SaveChangesAsync();

            return Results.NoContent();
        });

        // Remover uma avaliação
        grupo.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
        {
            var a = await db.Avaliacoes.FindAsync(id);
            if (a is null) return Results.NotFound();

            db.Avaliacoes.Remove(a);
            await db.SaveChangesAsync();

            return Results.NoContent();
        });

        // Listar as avaliações de um livro
        app.MapGet("/livros/{id:int}/avaliacoes", async (int id, AppDbContext db) =>
        {
            if (!await db.Livros.AnyAsync(l => l.LivroId == id))
                return Results.NotFound("Livro não encontrado.");

            var lista = await db.Avaliacoes
                .Where(a => a.LivroId == id)
                .Select(a => new { a.AvaliacaoId, a.Nota, a.Comentario, a.DataAvaliacao, a.UsuarioId })
                .ToListAsync();

            return Results.Ok(lista);
        });

        // Média de notas de um livro
        app.MapGet("/livros/{id:int}/media", async (int id, AppDbContext db) =>
        {
            var livro = await db.Livros.FindAsync(id);
            if (livro is null) return Results.NotFound("Livro não encontrado.");

            var notas = db.Avaliacoes.Where(a => a.LivroId == id);
            var total = await notas.CountAsync();
            double media = total == 0 ? 0 : await notas.AverageAsync(a => a.Nota);

            return Results.Ok(new
            {
                LivroId = id,
                livro.Titulo,
                livro.Autor,
                TotalAvaliacoes = total,
                Media = Math.Round(media, 2)
            });
        });
    }
}

// Dados de entrada da API (evita expor as entidades diretamente e problemas de referência circular no JSON)
public record AvaliacaoDto(int LivroId, int UsuarioId, int Nota, string? Comentario);
