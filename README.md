# Avaliador de Livros

Projeto Final, Parte 1, da disciplina de **Desenvolvimento de Software Visual**.

## Identificação

- **Projeto:** Avaliador de Livros
- **Turma:** 47_28708_Presencial_60
- **Integrantes:**
  - _Helder Dupont_
    - **Curso:** _Ciência da Computação_
  - _Matheus Fernando Costa Perrude da Silva_
    - **Curso:** _Ciência da Computação_
  - _Rodrigo Matsuda Valencia_
    - **Curso:** _Engenharia da Computação_
  - _Yasmin Cristini Lopes Oliveira_
    - **Curso:** _Analise e desenvolvimento de sistemas_

## Resumo

O **Avaliador de Livros** é uma API REST desenvolvida em C# com .NET 8 (Minimal API), Entity
Framework Core e SQLite, inspirada em plataformas como Skoob e Letterboxd. O sistema permite cadastrar
usuários e livros e, a partir desses dados, registrar avaliações com nota de 1 a 5 e comentário,
calcular a média de notas de cada livro e organizar uma estante de leitura pessoal em que cada livro
recebe o status "Quero ler", "Lendo" ou "Lido". Avaliações e itens da estante só podem ser criados para
usuários e livros já cadastrados. Regras no banco impedem que o mesmo usuário avalie um livro duas
vezes ou o adicione duas vezes à estante. Assim, os cadastros básicos alimentam funcionalidades de
acompanhamento de leitura e de opinião sobre os livros.

## Funcionalidades

- Cadastro, listagem, busca, alteração e remoção de **livros** (CRUD completo)
- Cadastro, listagem, busca, alteração e remoção de **usuários** (CRUD completo)
- **Avaliação de livros** com nota de 1 a 5 e comentário, limitada a uma por usuário para cada livro
- **Média de notas** e lista de avaliações de cada livro
- Histórico de **avaliações feitas por um usuário**
- **Estante de leitura** com os status Quero ler, Lendo e Lido
- **Filtro da estante por status** e **resumo** com a quantidade de livros em cada status
- **Data de conclusão automática** quando um livro é marcado como Lido
- **Validações de relacionamento**: só é possível avaliar ou adicionar à estante usuários e livros já cadastrados

## Descrição das funcionalidades

### Livros

Base do sistema. Cada livro tem título, autor, ano de publicação e data de cadastro, gerada
automaticamente. É possível cadastrar, listar todos, buscar pelo id, alterar e remover. O título é
obrigatório. Ao remover um livro, as avaliações e os itens de estante ligados a ele também são removidos.

### Usuários

Representam os leitores. Cada usuário tem nome e data de cadastro. O CRUD é completo, e o nome é
obrigatório. Para não perder o histórico de opiniões, **um usuário que já fez avaliações não pode ser
removido**: a API responde `409 Conflict`. Também é possível consultar todas as avaliações feitas por um
usuário.

### Avaliações

Ligam um usuário a um livro, com nota de 1 a 5 e um comentário opcional. Antes de salvar, a API
confere se o livro e o usuário existem e se a nota está no intervalo permitido. Um índice único no
banco (`UsuarioId + LivroId`) garante **uma avaliação por usuário para cada livro**. Uma segunda
tentativa retorna `409 Conflict`. A nota e o comentário podem ser alterados depois, e a avaliação pode
ser removida.

### Média e avaliações por livro

A partir das avaliações cadastradas, a API calcula a **média das notas** de um livro, arredondada para
duas casas, e informa o total de avaliações recebidas. Também lista todas as avaliações de um livro
específico.

### Estante de leitura

Funciona como a lista de leitura do usuário. Cada item liga um usuário a um livro e guarda o status
da leitura: `QueroLer`, `Lendo` ou `Lido`. Assim como nas avaliações, o mesmo livro não pode aparecer
duas vezes na estante de um usuário. O status pode ser atualizado a qualquer momento. Quando passa a ser
**Lido**, a **data de conclusão é preenchida automaticamente**. Se o status voltar atrás, a data é
apagada.

### Consultas da estante

Além de listar a estante completa de um usuário, com título e autor de cada livro, é possível filtrar
por um status, informando o nome (`Lido`) ou o número (`2`). Também existe um **resumo** com a
quantidade de livros em cada status e o total, útil para acompanhar o progresso de leitura.

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

### Front-end (React)

Pré-requisito: [Node.js](https://nodejs.org/) 18 ou mais novo. Com a API rodando, em outro terminal,
dentro da pasta `Front`:

```bash
npm install   # só na primeira vez
npm run dev   # abre o site em http://localhost:5173
```

O front chama `/backend/...` e o Vite repassa para a API em `http://localhost:5195`
(configurado em `Front/vite.config.js`), por isso a API não precisa de CORS.

### Divisão do front-end

Cada integrante faz a página da parte que criou na API. As páginas já existem em `Front/src/pages`
com o título e, no topo do arquivo, a lista do que falta e quais funções de `src/api.js` usar.

| Página | Arquivo | Responsável | Situação |
|---|---|---|---|
| Avaliações | `Avaliacoes.jsx` | Rodrigo | Pronta |
| Livros | `Livros.jsx` | Matheus | A fazer |
| Leitores | `Usuarios.jsx` | Yasmin | A fazer |
| Estante | `Estante.jsx` | Helder | A fazer |
| Início | `Inicio.jsx` | A definir | A fazer |

## Estrutura

```
Front/
├── src/api.js                # todas as chamadas à API
├── src/App.jsx               # cabeçalho e navegação por abas
├── src/pages/                # Início, Livros, Leitores, Avaliações e Estante
├── src/components/           # Estrelas (nota) e Aviso (mensagens)
└── src/index.css             # estilo da aplicação (gerado com IA)

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

Abra os arquivos da pasta `API/Tests` com a API rodando e clique em **Send Request** em cada bloco:

| Arquivo | O que testa |
|---|---|
| `Livros.http` | CRUD de livros |
| `Usuarios.http` | CRUD de usuários e avaliações de um usuário |
| `Avaliacoes.http` | CRUD de avaliações, média, avaliações por livro e erros (nota inválida, duplicada, livro inexistente) |
| `Estante.http` | Estante, filtro por status, resumo e erros (item duplicado, status inválido) |
| `Demo.http` | Roteiro completo de demonstração, do cadastro até a estante (rodar com o banco limpo) |

Comece cadastrando um usuário e um livro, porque as avaliações e a estante dependem deles.

## Uso de IA

Conforme pedido no enunciado, a documentação deste README foi produzida com auxílio de Inteligência Artificial.

- **Ferramenta utilizada:** Claude (Anthropic), pelo Claude Code integrado ao VS Code.
- **Forma de uso:**
  - Foi pedido que completasse o README com as seções exigidas (identificação, resumo,
    funcionalidades, descrição das funcionalidades e uso de IA), com base no que o código realmente faz.
  - A IA também foi usada para validar os arquivos de teste.
  - Exemplo de prompt usado: _"Verifique se tudo o que foi solicitado pelo professor está sendo
    apresentado no projeto"_ e, depois, _"Complete o README com as informações solicitadas que estão faltando"_.
- **Revisões realizadas pela equipe:**
  - _Informações preenchidas no README foram todas revisadas pelos membros da equipe
    e algumas foram reescritas para se adequar melhor a situação do projeto e do desenvolvimento._
  - _Arquivos de teste foram ajsutados e validados pela equipe após a validação feita pelo agente de IA._

### Parte 2: front-end e CSS

- O **CSS** do front-end (`Front/src/index.css`, tema "biblioteca" em tons de papel e vinho) foi
  gerado com IA, como pede o enunciado.
- A IA também ajudou a montar as telas em React a partir das rotas da API.
