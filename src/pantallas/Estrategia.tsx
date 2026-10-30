// Lección 2: ¿qué jugada toca? Una mano y la carta del crupier; eliges y te explica el porqué.

import { useState } from "react";

import { CartaVista, Encabezado, Explicacion, Mano, Racha, Resultado } from "../componentes/basicos";
import { type Carta, type Rango, RANGOS, carta, describirMano } from "../lib/cartas";
import { type Jugada, NOMBRE_JUGADA, jugadaCorrecta, porQue } from "../lib/estrategia";
import { anotar, useProgreso } from "../lib/progreso";

const azar = <T,>(lista: readonly T[]) => lista[Math.floor(Math.random() * lista.length)];
const SIN_FIGURAS = RANGOS.filter((r) => r !== "J" && r !== "Q" && r !== "K");

// Mezcla de manos para practicar de todo: ~25 % pares, ~25 % suaves (con As), el resto duras.
function nuevaMano(): { mano: Carta[]; crupier: Carta } {
  const tipo = Math.random();
  let mano: Carta[];
  if (tipo < 0.25) {
    const r = azar(RANGOS);
    mano = [carta(r), carta(r)];
  } else if (tipo < 0.5) {
    mano = [carta("A"), carta(azar(SIN_FIGURAS.filter((r) => r !== "A" && r !== "10")))];
  } else {
    let a: Rango;
    let b: Rango;
    do {
      a = azar(RANGOS.filter((r) => r !== "A"));
      b = azar(RANGOS.filter((r) => r !== "A"));
    } while (a === b);
    mano = [carta(a), carta(b)];
  }
  return { mano, crupier: carta(azar(RANGOS)) };
}

const JUGADAS: Jugada[] = ["pedir", "plantarse", "doblar", "dividir"];

export function Estrategia({ onVolver }: { onVolver: () => void }) {
  const progreso = useProgreso().estrategia;
  const [ronda, setRonda] = useState(nuevaMano);
  const [elegida, setElegida] = useState<Jugada | null>(null);
  const [racha, setRacha] = useState(0);

  const correcta = jugadaCorrecta(ronda.mano, ronda.crupier.rango);
  const esPar = ronda.mano[0].rango === ronda.mano[1].rango;

  const elegir = (j: Jugada) => {
    if (elegida) {
      return;
    }
    const bien = j === correcta;
    const nueva = bien ? racha + 1 : 0;
    setElegida(j);
    setRacha(nueva);
    anotar("estrategia", bien, nueva);
  };

  const siguiente = () => {
    setRonda(nuevaMano());
    setElegida(null);
  };

  return (
    <main className="pantalla">
      <Encabezado onVolver={onVolver} paso="Lección 2" titulo="Estrategia básica" />

      <Explicacion titulo="¿Qué es la estrategia básica?">
        <p>
          Para cada mano tuya y cada carta visible del crupier hay una jugada que, a la larga, pierde menos. Matemáticos la
          calcularon simulando millones de manos. Es la base: contar cartas sin saber esto no sirve de nada.
        </p>
        <p>La idea clave: si el crupier muestra <strong>2 a 6</strong> está débil (puede pasarse); con <strong>7 a As</strong> está fuerte.</p>
      </Explicacion>

      <Racha mejor={progreso.mejorRacha} racha={racha} />

      <section className="mesa">
        <div className="lado">
          <p className="etiqueta">Crupier muestra</p>
          <div className="mano">
            <CartaVista carta={ronda.crupier} />
            <CartaVista carta={ronda.crupier} oculta />
          </div>
        </div>
        <div className="lado">
          <p className="etiqueta">
            Tu mano <strong>{esPar ? `par de ${ronda.mano[0].rango}` : describirMano(ronda.mano)}</strong>
          </p>
          <Mano cartas={ronda.mano} />
        </div>
      </section>

      <div className="opciones">
        {JUGADAS.map((j) => (
          <button
            className={`opcion${elegida && j === correcta ? " correcta" : ""}${elegida === j && j !== correcta ? " incorrecta" : ""}`}
            disabled={(j === "dividir" && !esPar) || (elegida !== null && j !== elegida && j !== correcta)}
            key={j}
            onClick={() => elegir(j)}
            type="button"
          >
            {NOMBRE_JUGADA[j]}
          </button>
        ))}
      </div>

      {elegida ? (
        <>
          <Resultado bien={elegida === correcta}>
            {elegida !== correcta ? <p>Lo correcto era <strong>{NOMBRE_JUGADA[correcta]}</strong>.</p> : null}
            <p>{porQue(ronda.mano, ronda.crupier.rango)}</p>
          </Resultado>
          <button className="boton ancho" onClick={siguiente} type="button">Siguiente mano</button>
        </>
      ) : null}
    </main>
  );
}
