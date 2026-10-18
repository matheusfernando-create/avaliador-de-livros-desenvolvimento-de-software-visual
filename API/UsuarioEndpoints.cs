using Microsoft.EntityFrameworkCore;

// Endpoints de Usuário (CRUD) e lista de avaliações feitas por um usuário.
// Para ativar, o Program.cs precisa ter esta linha antes do app.Run():
//     app.MapUsuarioEndpoints();

public static class UsuarioEndpoints
{
    public static void MapUsuarioEndpoints(this WebApplication app)
    {
        var grupo = app.MapGroup("/usuarios");

        // Listar todos os usuários
        grupo.MapGet("/", async (AppDbContext db) =>
            await db.Usuarios
                .Select(u => new { u.UsuarioId, u.Nome, u.DataCadastro })
                .ToListAsync());

        // Buscar um usuário pelo id
        grupo.MapGet("/{id:int}", async (int id, AppDbContext db) =>
        {
            var u = await db.Usuarios.FindAsync(id);
            return u is null
                ? Results.NotFound("Usuário não encontrado.")
                : Results.Ok(new { u.UsuarioId, u.Nome, u.DataCadastro });
        });

        // Cadastrar um usuário
        grupo.MapPost("/", async (UsuarioDto dto, AppDbContext db) =>
        {
            if (string.IsNullOrWhiteSpace(dto.Nome))
                return Results.BadRequest("O nome é obrigatório.");

            var novo = new Usuario { Nome = dto.Nome.Trim() };

            db.Usuarios.Add(novo);
            await db.SaveChangesAsync();

            return Results.Created($"/usuarios/{novo.UsuarioId}",
                new { novo.UsuarioId, novo.Nome, novo.DataCadastro });
        });

        // Alterar o nome de um usuário
        grupo.MapPut("/{id:int}", async (int id, UsuarioDto dto, AppDbContext db) =>
        {
            if (string.IsNullOrWhiteSpace(dto.Nome))
                return Results.BadRequest("O nome é obrigatório.");

            var u = await db.Usuarios.FindAsync(id);
            if (u is null) return Results.NotFound("Usuário não encontrado.");

            u.Nome = dto.Nome.Trim();
            await db.SaveChangesAsync();

            return Results.NoContent();
        });

        // Remover um usuário (não deixa apagar se ele já fez avaliações)
        grupo.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
        {
            var u = await db.Usuarios.FindAsync(id);
            if (u is null) return Results.NotFound("Usuário não encontrado.");

            if (await db.Avaliacoes.AnyAsync(a => a.UsuarioId == id))
                return Results.Conflict("Este usuário possui avaliações e não pode ser removido.");

            db.Usuarios.Remove(u);
            await db.SaveChangesAsync();

            return Results.NoContent();
        });

        // Listar as avaliações feitas por um usuário
        grupo.MapGet("/{id:int}/avaliacoes", async (int id, AppDbContext db) =>
        {
            if (!await db.Usuarios.AnyAsync(u => u.UsuarioId == id))
                return Results.NotFound("Usuário não encontrado.");

            var lista = await db.Avaliacoes
                .Where(a => a.UsuarioId == id)
                .Select(a => new { a.AvaliacaoId, a.Nota, a.Comentario, a.DataAvaliacao, a.LivroId })
                .ToListAsync();

            return Results.Ok(lista);
        });
    }
}

// Dados de entrada da API (evita expor a entidade diretamente)
public record UsuarioDto(string Nome);