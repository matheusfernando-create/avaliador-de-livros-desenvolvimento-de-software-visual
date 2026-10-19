# Avaliador de Livros

Projeto da matéria de **Desenvolvimento de Software Visual**.

API REST em que usuários cadastram livros, dão notas e comentários e montam a sua
**estante de leitura** (Quero ler / Lendo / Lido), no estilo Skoob ou Letterboxd.

## Tecnologias

- **.NET 8** com ASP.NET Core **Minimal API**
- **Entity Framework Core 8** com banco **SQLite** (arquivo `AvaliadorLivros.db`)
- Arquivos `.http` para testar as rotas pelo VS Code (extensão REST Client) ou pelo Visual Studio

## Como rodar

Pré-requisitos: [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) e a ferramenta do EF:

```bash
dotnet tool install --global dotnet-ef --version 8.0.31
```

Dentro da pasta `API`:

```bash
dotnet ef database update   # cria o banco e as tabelas a partir das migrations
dotnet run                  # sobe a API em http://localhost:5195
```

> Se a máquina tiver só o .NET 10 instalado, rode antes `export DOTNET_ROLL_FORWARD=Major`
> (PowerShell: `$env:DOTNET_ROLL_FORWARD = "Major"`) ou instale o runtime do .NET 8.

## Estrutura

```
API/
├── Data/AppDbContext.cs      # conexão com o SQLite e índices únicos
├── Models/                   # entidades: Livro, Usuario, Avaliacao, Estante
├── Migrations/               # histórico do banco gerado pelo EF
├── LivrosEndpoints.cs        # CRUD de livros
├── UsuarioEndpoints.cs       # CRUD de usuários
├── AvaliacaoEndpoints.cs     # CRUD de avaliações + média por livro
├── EstanteEndpoints.cs       # estante de leitura do usuário
├── Tests/                    # requisições .http para testar a API
└── Program.cs                # registra o banco e os endpoints
```

## Modelo de dados

```
Usuario 1 ──── N Avaliacao N ──── 1 Livro
Usuario 1 ──── N Estante   N ──── 1 Livro
```

- **Avaliacao** e **Estante** ligam um usuário a um livro (relacionamento N:N com dados extras).
- Um usuário só pode **avaliar** o mesmo livro uma vez e só pode ter o mesmo livro **uma vez na estante**
  (índices únicos em `UsuarioId + LivroId`).
- A estante usa o enum `StatusLeitura`: `0 = QueroLer`, `1 = Lendo`, `2 = Lido`.
  Quando o status vira `Lido`, a `DataConclusao` é preenchida automaticamente.

## Endpoints

### Livros

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/livro/cadastrar` | Cadastra um livro (`titulo`, `autor`, `anoPublicacao`) |
| GET | `/api/livro/listar` | Lista todos os livros |
| GET | `/api/livro/buscar/{id}` | Busca um livro pelo id |
| PUT | `/api/livro/alterar/{id}` | Altera título, autor e ano |
| DELETE | `/api/livro/remover/{id}` | Remove um livro |

### Usuários

| Método | Rota | Descrição |
|---|---|---|
| POST | `/usuarios` | Cadastra um usuário (`nome`) |
| GET | `/usuarios` | Lista todos os usuários |
| GET | `/usuarios/{id}` | Busca um usuário pelo id |
| PUT | `/usuarios/{id}` | Altera o nome |
| DELETE | `/usuarios/{id}` | Remove (bloqueado se o usuário já tiver avaliações) |
| GET | `/usuarios/{id}/avaliacoes` | Avaliações feitas pelo usuário |

### Avaliações

| Método | Rota | Descrição |
|---|---|---|
| POST | `/avaliacoes` | Avalia um livro (`livroId`, `usuarioId`, `nota` de 1 a 5, `comentario`) |
| GET | `/avaliacoes` | Lista todas as avaliações |
| GET | `/avaliacoes/{id}` | Busca uma avaliação pelo id |
| PUT | `/avaliacoes/{id}` | Altera nota e comentário |
| DELETE | `/avaliacoes/{id}` | Remove uma avaliação |
| GET | `/livros/{id}/avaliacoes` | Avaliações de um livro |
| GET | `/livros/{id}/media` | Média das notas de um livro |

### Estante

| Método | Rota | Descrição |
|---|---|---|
| POST | `/estante` | Adiciona um livro à estante (`usuarioId`, `livroId`, `status`) |
| GET | `/usuarios/{id}/estante` | Lista a estante do usuário, com título e autor |
| GET | `/usuarios/{id}/estante/{status}` | Lista só um status (`Lido` ou `2`, por exemplo) |
| GET | `/usuarios/{id}/estante/resumo` | Quantos livros o usuário tem em cada status |
| PUT | `/estante/{id}` | Muda o status de um item |
| DELETE | `/estante/{id}` | Tira um livro da estante |

Exemplo de resposta do resumo:

```json
{ "usuarioId": 1, "queroLer": 3, "lendo": 1, "lido": 5, "total": 9 }
```

## Testando

Abra os arquivos da pasta `API/Tests` (`Livros.http`, `Estante.http`) com a API rodando e clique
em **Send Request** em cada bloco. Comece cadastrando um usuário e um livro, porque as avaliações
e a estante dependem deles.
