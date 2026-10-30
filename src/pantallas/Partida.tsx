// Lección 1: reglas del blackjack y manos de práctica contra el crupier. Sin dinero.

import { useState } from "react";

import { Encabezado, Explicacion, Mano } from "../componentes/basicos";
import { type Carta, describirMano, esBlackjack, totalMano, zapato } from "../lib/cartas";
import { anotar } from "../lib/progreso";

type Fase = "jugando" | "fin";

// Un zapato de 6 barajas que se vuelve a revolver cuando queda poco.
let mazo = zapato(6);
function sacar() {
  if (mazo.length < 60) {
    mazo = zapato(6);
  }
  return mazo.pop() as Carta;
}

function resultadoFinal(tu: Carta[], crupier: Carta[]) {
  const t = totalMano(tu).total;
  const c = totalMano(crupier).total;
  if (t > 21) {
    return { texto: "Te pasaste de 21. Gana el crupier.", gano: false };
  }
  if (esBlackjack(tu) && !esBlackjack(crupier)) {
    return { texto: "¡Blackjack! Ganas.", gano: true };
  }
  if (esBlackjack(crupier) && !esBlackjack(tu)) {
    return { texto: "El crupier tiene blackjack.", gano: false };
  }
  if (c > 21) {
    return { texto: "El crupier se pasó. ¡Ganas!", gano: true };
  }
  if (t > c) {
    return { texto: `Ganas: ${t} contra ${c}.`, gano: true };
  }
  if (t < c) {
    return { texto: `Gana el crupier: ${c} contra ${t}.`, gano: false };
  }
  return { texto: `Empate a ${t}.`, gano: false };
}

export function Partida({ onVolver }: { onVolver: () => void }) {
  const [tu, setTu] = useState<Carta[]>(() => [sacar(), sacar()]);
  const [crupier, setCrupier] = useState<Carta[]>(() => [sacar(), sacar()]);
  const [fase, setFase] = useState<Fase>(() => (esBlackjack(tu) ? "fin" : "jugando"));
  const [doblada, setDoblada] = useState(false);

  // El crupier destapa y pide hasta llegar a 17 o más.
  const terminar = (mano: Carta[]) => {
    const suya = [...crupier];
    if (totalMano(mano).total <= 21) {
      while (totalMano(suya).total < 17) {
        suya.push(sacar());
      }
    }
    setCrupier(suya);
    setFase("fin");
    anotar("partida", resultadoFinal(mano, suya).gano, 0);
  };

  const pedir = () => {
    const mano = [...tu, sacar()];
    setTu(mano);
    if (totalMano(mano).total >= 21) {
      terminar(mano);
    }
  };

  const doblar = () => {
    const mano = [...tu, sacar()];
    setTu(mano);
    setDoblada(true);
    terminar(mano);
  };

  const nueva = () => {
    const mano = [sacar(), sacar()];
    setTu(mano);
    setCrupier([sacar(), sacar()]);
    setDoblada(false);
    setFase(esBlackjack(mano) ? "fin" : "jugando");
  };

  const final = fase === "fin" ? resultadoFinal(tu, crupier) : null;

  return (
    <main className="pantalla">
      <Encabezado onVolver={onVolver} paso="Lección 1" titulo="Cómo se juega" />

      <Explicacion abierta titulo="Las reglas en 1 minuto">
        <ul>
          <li><strong>Objetivo:</strong> acercarte a 21 más que el crupier, sin pasarte.</li>
          <li><strong>Valores:</strong> del 2 al 10 valen su número; J, Q y K valen 10; el As vale 1 u 11, lo que te convenga.</li>
          <li><strong>Reparto:</strong> recibes 2 cartas. El crupier también, pero una queda boca abajo.</li>
          <li><strong>Pedir:</strong> otra carta. <strong>Plantarse:</strong> te quedas como estás.</li>
          <li><strong>Doblar:</strong> en tus 2 primeras cartas, duplicas la apuesta y recibes solo una carta más.</li>
          <li><strong>Dividir:</strong> si tienes un par, lo separas en dos manos (lo practicas en la lección 2).</li>
          <li><strong>El crupier</strong> no decide: pide hasta tener 17 o más.</li>
          <li><strong>Blackjack:</strong> As + una carta de 10 en las dos primeras. Es la mejor mano.</li>
        </ul>
        <p className="nota">Aquí no hay dinero: solo practicas.</p>
      </Explicacion>

      <section className="mesa">
        <div className="lado">
          <p className="etiqueta">
            Crupier {fase === "fin" ? <strong>{describirMano(crupier)}</strong> : null}
          </p>
          <Mano cartas={crupier} ocultarSegunda={fase === "jugando"} />
        </div>
        <div className="lado">
          <p className="etiqueta">
            Tú <strong>{describirMano(tu)}</strong>
            {doblada ? <span className="chip">Doblaste</span> : null}
          </p>
          <Mano cartas={tu} />
        </div>
      </section>

      {final ? (
        <div className={`resultado ${final.gano ? "bien" : "neutro"}`} role="status">
          <strong>{final.texto}</strong>
        </div>
      ) : null}

      <div className="acciones">
        {fase === "jugando" ? (
          <>
            <button className="boton" onClick={pedir} type="button">Pedir</button>
            <button className="boton secundario" onClick={() => terminar(tu)} type="button">Plantarse</button>
            {tu.length === 2 ? (
              <button className="boton secundario" onClick={doblar} type="button">Doblar</button>
            ) : null}
          </>
        ) : (
          <button className="boton ancho" onClick={nueva} type="button">Otra mano</button>
        )}
      </div>
    </main>
  );
}
