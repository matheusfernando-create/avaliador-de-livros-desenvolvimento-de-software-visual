import { useCallback, useEffect, useState } from "react";
import { api } from "./api.js";
import Inicio from "./pages/Inicio.jsx";
import Livros from "./pages/Livros.jsx";
import Usuarios from "./pages/Usuarios.jsx";
import Avaliacoes from "./pages/Avaliacoes.jsx";
import Estante from "./pages/Estante.jsx";
import Aviso from "./components/Aviso.jsx";

// Navegação simples por abas (sem biblioteca de rotas, só estado do React).
const ABAS = [
  { id: "inicio", nome: "Início", icone: "🏠" },
  { id: "livros", nome: "Livros", icone: "📚" },
  { id: "usuarios", nome: "Leitores", icone: "👤" },
  { id: "avaliacoes", nome: "Avaliações", icone: "⭐" },
  { id: "estante", nome: "Estante", icone: "🗂️" },
];

export default function App() {
  const [aba, setAba] = useState("inicio");
  const [aviso, setAviso] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  // Leitor escolhido no seletor fixo do cabeçalho. Fica salvo no navegador (localStorage).
  const [usuarioAtual, setUsuarioAtual] = useState(() => {
    const salvo = localStorage.getItem("usuarioAtual");
    return salvo ? Number(salvo) : null;
  });

  // Mostra uma mensagem rápida no canto da tela (sucesso ou erro).
  // useCallback mantém a mesma função entre renderizações (evita recarregar as páginas à toa).
  const avisar = useCallback((texto, tipo = "sucesso") => {
    setAviso({ texto, tipo, id: Date.now() });
  }, []);
  const fecharAviso = useCallback(() => setAviso(null), []);

  // Recarrega a lista de leitores ao trocar de aba (pode ter leitor novo ou removido).
  useEffect(() => {
    api
      .listarUsuarios()
      .then((lista) => {
        setUsuarios(lista);
        // Se o leitor salvo não existe mais, escolhe o primeiro da lista.
        setUsuarioAtual((atual) =>
          lista.some((u) => u.usuarioId === atual) ? atual : lista[0]?.usuarioId ?? null
        );
      })
      .catch(() => {});
  }, [aba]);

  useEffect(() => {
    if (usuarioAtual) localStorage.setItem("usuarioAtual", usuarioAtual);
  }, [usuarioAtual]);

  const props = { avisar, irPara: setAba, usuarioAtual };

  return (
    <div className="app">
      <header className="topo">
        <div className="topo-linha">
          <div className="marca" onClick={() => setAba("inicio")}>
            <span className="marca-icone">📚</span>
            <div>
              <h1>Avaliador de Livros</h1>
              <p>Avalie, organize e acompanhe suas leituras</p>
            </div>
          </div>

          <label className="seletor-usuario">
            <span className="avatar">
              {usuarios.find((u) => u.usuarioId === usuarioAtual)?.nome.charAt(0).toUpperCase() ?? "?"}
            </span>
            <select
              value={usuarioAtual ?? ""}
              onChange={(e) => setUsuarioAtual(Number(e.target.value))}
              disabled={usuarios.length === 0}
              title="Trocar de leitor"
            >
              {usuarios.length === 0 && <option value="">Nenhum leitor</option>}
              {usuarios.map((u) => (
                <option key={u.usuarioId} value={u.usuarioId}>
                  {u.nome}
                </option>
              ))}
            </select>
          </label>
        </div>

        <nav className="abas">
          {ABAS.map((a) => (
            <button
              key={a.id}
              className={aba === a.id ? "aba ativa" : "aba"}
              onClick={() => setAba(a.id)}
            >
              <span>{a.icone}</span> {a.nome}
            </button>
          ))}
        </nav>
      </header>

      <main className="conteudo">
        {aba === "inicio" && <Inicio {...props} />}
        {aba === "livros" && <Livros {...props} />}
        {aba === "usuarios" && <Usuarios {...props} />}
        {aba === "avaliacoes" && <Avaliacoes {...props} />}
        {aba === "estante" && <Estante {...props} />}
      </main>

      <footer className="rodape">
        Projeto Final · Desenvolvimento de Software Visual · React + .NET 8 Minimal API + EF Core + SQLite
      </footer>

      {aviso && <Aviso key={aviso.id} {...aviso} aoFechar={fecharAviso} />}
    </div>
  );
}
