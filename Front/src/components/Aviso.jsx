import { useEffect } from "react";

// Mensagem flutuante que some sozinha depois de alguns segundos.
export default function Aviso({ texto, tipo, aoFechar }) {
  useEffect(() => {
    const t = setTimeout(aoFechar, 3500);
    return () => clearTimeout(t);
  }, [aoFechar]);

  return (
    <div className={`aviso aviso-${tipo}`} onClick={aoFechar}>
      {tipo === "erro" ? "⚠️" : "✔️"} {texto}
    </div>
  );
}
