// Mostra a nota em estrelas. Se receber "aoEscolher", vira um seletor de nota (1 a 5).
export default function Estrelas({ nota = 0, aoEscolher, tamanho = "normal" }) {
  const cheias = Math.round(nota);
  return (
    <span className={`estrelas estrelas-${tamanho} ${aoEscolher ? "clicavel" : ""}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={n <= cheias ? "estrela cheia" : "estrela"}
          onClick={aoEscolher ? () => aoEscolher(n) : undefined}
          title={aoEscolher ? `Nota ${n}` : undefined}
        >
          ★
        </span>
      ))}
    </span>
  );
}
