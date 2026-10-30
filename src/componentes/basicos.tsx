import type { ReactNode } from "react";

import { type Carta, esRoja } from "../lib/cartas";

// Una carta dibujada con CSS. `oculta` la muestra boca abajo (la segunda carta del crupier).
export function CartaVista({ carta, oculta = false, grande = false }: { carta: Carta; oculta?: boolean; grande?: boolean }) {
  if (oculta) {
    return <div aria-label="Carta boca abajo" className={`carta reverso${grande ? " grande" : ""}`} role="img" />;
  }
  const clase = `carta${esRoja(carta) ? " roja" : ""}${grande ? " grande" : ""}`;
  return (
    <div aria-label={`${carta.rango} de ${carta.palo}`} className={clase} role="img">
      <span className="esquina">
        {carta.rango}
        <small>{carta.palo}</small>
      </span>
      <span className="centro">{carta.palo}</span>
      <span className="esquina abajo">
        {carta.rango}
        <small>{carta.palo}</small>
      </span>
    </div>
  );
}

export function Mano({ cartas, ocultarSegunda = false }: { cartas: Carta[]; ocultarSegunda?: boolean }) {
  return (
    <div className="mano">
      {cartas.map((c, i) => (
        <CartaVista carta={c} key={c.id} oculta={ocultarSegunda && i === 1} />
      ))}
    </div>
  );
}

export function Encabezado({ titulo, paso, onVolver }: { titulo: string; paso?: string; onVolver: () => void }) {
  return (
    <header className="encabezado">
      <button aria-label="Volver" className="volver" onClick={onVolver} type="button">
        ←
      </button>
      <div>
        {paso ? <p className="paso">{paso}</p> : null}
        <h1>{titulo}</h1>
      </div>
    </header>
  );
}

export function Racha({ racha, mejor }: { racha: number; mejor: number }) {
  return (
    <div className="racha" aria-live="polite">
      <span>
        Racha <strong>{racha}</strong>
      </span>
      <span>
        Mejor <strong>{mejor}</strong>
      </span>
    </div>
  );
}

export function Explicacion({ titulo, children, abierta = false }: { titulo: string; children: ReactNode; abierta?: boolean }) {
  return (
    <details className="explicacion" open={abierta}>
      <summary>{titulo}</summary>
      <div className="explicacion-cuerpo">{children}</div>
    </details>
  );
}

export function Resultado({ bien, children }: { bien: boolean; children: ReactNode }) {
  return (
    <div className={`resultado ${bien ? "bien" : "mal"}`} role="status">
      <strong>{bien ? "¡Correcto!" : "No exactamente"}</strong>
      <div>{children}</div>
    </div>
  );
}

// Con signo siempre visible y el menos tipográfico (−), que se lee mejor que el guion.
const signo = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : "0");
export { signo };
