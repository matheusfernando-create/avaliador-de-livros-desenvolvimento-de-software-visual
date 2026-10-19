using Microsoft.EntityFrameworkCore;

public static class EstanteEndpoints
{
    public static void MapEstanteEndpoints(this WebApplication app)
    {
        var grupo = app.MapGroup("/estante");

        //Adicionar um livro à estante do usuário
        grupo.MapPost("/", async (EstanteDto dto, AppDbContext db) =>
        {
            if (!Enum.IsDefined(dto.Status))
                return Results.BadRequest("Status inválido. Use 0 (QueroLer), 1 (Lendo) ou 2 (Lido).");
            if (!await db.Usuarios.AnyAsync(u => u.UsuarioId == dto.UsuarioId))
                return Results.BadRequest("Usuário não encontrado.");
            if (!await db.Livros.AnyAsync(l => l.LivroId == dto.LivroId))
                return Results.BadRequest("Livro não encontrado.");

            if (await db.Estantes.AnyAsync(e => e.UsuarioId == dto.UsuarioId && e.LivroId == dto.LivroId))
                return Results.Conflict("Este livro já está na estante do usuário.");

            var item = new Estante
            {
                UsuarioId = dto.UsuarioId,
                LivroId = dto.LivroId,
                Status = dto.Status,
                DataConclusao = dto.Status == StatusLeitura.Lido ? DateTime.Now : null
            };

            db.Estantes.Add(item);
            await db.SaveChangesAsync();

            return Results.Created($"/estante/{item.EstanteId}",
                new { item.EstanteId, item.UsuarioId, item.LivroId, item.Status, item.DataAdicionado, item.DataConclusao });
        });

        //Listar a estante de um usuário
        //GET /usuarios/{id}/estante
        app.MapGet("/usuarios/{id:int}/estante", async (int id, AppDbContext db) =>
        {
            if (!await db.Usuarios.AnyAsync(u => u.UsuarioId == id))
                return Results.NotFound("Usuário não encontrado.");

            var lista = await db.Estantes
                .Where(e => e.UsuarioId == id)
                .OrderByDescending(e => e.DataAdicionado)
                .Select(e => new
                {
                    e.EstanteId,
                    e.LivroId,
                    e.Livro!.Titulo,
                    e.Livro.Autor,
                    e.Status,
                    e.DataAdicionado,
                    e.DataConclusao
                })
                .ToListAsync();

            return Results.Ok(lista);
        });

        //Listar os livros de um determinado status (QueroLer, Lendo, Lido) de um usuário
        //GET /usuarios/{id}/estante/Lido   (ou /usuarios/{id}/estante/2)
        app.MapGet("/usuarios/{id:int}/estante/{status}", async (int id, StatusLeitura status, AppDbContext db) =>
        {
            if (!Enum.IsDefined(status))
                return Results.BadRequest("Status inválido. Use QueroLer, Lendo ou Lido (ou 0, 1, 2).");
            if (!await db.Usuarios.AnyAsync(u => u.UsuarioId == id))
                return Results.NotFound("Usuário não encontrado.");

            var lista = await db.Estantes
                .Where(e => e.UsuarioId == id && e.Status == status)
                .OrderByDescending(e => e.DataAdicionado)
                .Select(e => new
                {
                    e.EstanteId,
                    e.LivroId,
                    e.Livro!.Titulo,
                    e.Livro.Autor,
                    e.Status,
                    e.DataAdicionado,
                    e.DataConclusao
                })
                .ToListAsync();

            return Results.Ok(lista);
        });

        //Resumo da estante: quantos livros o usuário tem em cada status
        //GET /usuarios/{id}/estante/resumo
        app.MapGet("/usuarios/{id:int}/estante/resumo", async (int id, AppDbContext db) =>
        {
            if (!await db.Usuarios.AnyAsync(u => u.UsuarioId == id))
                return Results.NotFound("Usuário não encontrado.");

            var estante = db.Estantes.Where(e => e.UsuarioId == id);

            return Results.Ok(new
            {
                UsuarioId = id,
                QueroLer = await estante.CountAsync(e => e.Status == StatusLeitura.QueroLer),
                Lendo = await estante.CountAsync(e => e.Status == StatusLeitura.Lendo),
                Lido = await estante.CountAsync(e => e.Status == StatusLeitura.Lido),
                Total = await estante.CountAsync()
            });
        });

        //Mudar o status de um item
        //PUT /estante/{id}
        grupo.MapPut("/{id:int}", async (int id, EstanteDto dto, AppDbContext db) =>
        {
            if (!Enum.IsDefined(dto.Status))
                return Results.BadRequest("Status inválido. Use 0 (QueroLer), 1 (Lendo) ou 2 (Lido).");

            var item = await db.Estantes.FindAsync(id);
            if (item is null) return Results.NotFound("Item da estante não encontrado.");

            item.Status = dto.Status;
            
            item.DataConclusao = dto.Status == StatusLeitura.Lido ? DateTime.Now : null;
            await db.SaveChangesAsync();

            return Results.NoContent();
        });

        //Tirar um livro da estante
        //DELETE /estante/{id}
        grupo.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
        {
            var item = await db.Estantes.FindAsync(id);
            if (item is null) return Results.NotFound("Item da estante não encontrado.");

            db.Estantes.Remove(item);
            await db.SaveChangesAsync();

            return Results.NoContent();
        });
    }
}

// Dados de entrada da API
public record EstanteDto(int UsuarioId, int LivroId, StatusLeitura Status);
