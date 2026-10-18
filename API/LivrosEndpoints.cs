using Microsoft.AspNetCore.Mvc;

public static class LivroEndpoints
{
    public static void MapLivroEndpoints(this WebApplication app)
    {
        //CREATE
        //POST: /api/livro/cadastrar
        app.MapPost("/api/livro/cadastrar",
            ([FromBody] Livro? livro,
            [FromServices] AppDbContext ctx) =>
        {
            if (livro is null)
            {
                return Results.BadRequest("O livro não pode ser nulo");
            }

            if (livro.Titulo == "")
            {
                return Results.BadRequest("O título não pode ser vazio");
            }

            ctx.Livros.Add(livro);
            ctx.SaveChanges();
            return Results.Created($"/api/livro/buscar/{livro.LivroId}", livro);
        });

        //READ
        //GET: /api/livro/listar
        app.MapGet("/api/livro/listar", (
            [FromServices] AppDbContext ctx) =>
        {
            return Results.Ok(ctx.Livros.ToList());
        });

        //GET: /api/livro/buscar/id_livro
        app.MapGet("/api/livro/buscar/{id}",
            ([FromRoute] int id,
            [FromServices] AppDbContext ctx) =>
        {
            Livro? livroEncontrado = ctx.Livros.Find(id);
            if (livroEncontrado is null)
            {
                return Results.NotFound("Livro não encontrado!");
            }
            return Results.Ok(livroEncontrado);
        });

        //UPDATE
        //PUT: /api/livro/alterar/id_livro
        app.MapPut("/api/livro/alterar/{id}",
            ([FromRoute] int id,
            [FromBody] Livro livroAlterado,
            [FromServices] AppDbContext ctx) =>
        {
            Livro? livroEncontrado = ctx.Livros.Find(id);
            if (livroEncontrado is null)
            {
                return Results.NotFound("Livro não encontrado!");
            }

            livroEncontrado.Titulo = livroAlterado.Titulo;
            livroEncontrado.Autor = livroAlterado.Autor;
            livroEncontrado.AnoPublicacao = livroAlterado.AnoPublicacao;
            ctx.Livros.Update(livroEncontrado);
            ctx.SaveChanges();
            return Results.Ok(livroEncontrado);
        });

        //DELETE
        //DELETE: /api/livro/remover/id_livro
        app.MapDelete("/api/livro/remover/{id}",
            ([FromRoute] int id,
            [FromServices] AppDbContext ctx) =>
        {
            Livro? livroEncontrado = ctx.Livros.Find(id);
            if (livroEncontrado is null)
            {
                return Results.NotFound("Livro não encontrado!");
            }
            ctx.Livros.Remove(livroEncontrado);
            ctx.SaveChanges();
            return Results.Ok(livroEncontrado);
        });
    }
}