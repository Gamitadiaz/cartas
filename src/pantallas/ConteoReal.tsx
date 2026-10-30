// Lección 4: conteo real. El conteo corrido se divide entre las barajas que faltan por salir.

import { useState } from "react";

import { Encabezado, Explicacion, Racha, Resultado, signo } from "../componentes/basicos";
import { barajar } from "../lib/cartas";
import { anotar, useProgreso } from "../lib/progreso";

const BARAJAS_ZAPATO = 6;

function nuevoEjercicio() {
  const restantes = (Math.floor(Math.random() * 11) + 1) / 2; // de 0.5 a 5.5 barajas
  const corrido = Math.round((Math.random() * 2 - 1) * 14);
  // Se quitan los decimales: +7 entre 2 da +3 (no +4); −7 entre 2 da −3.
  const real = Math.trunc(corrido / restantes);
  // Tres distractores cercanos al azar, para que la correcta no caiga siempre en el mismo lugar.
  const opciones = new Set([real]);
  for (const delta of barajar([-3, -2, -1, 1, 2, 3])) {
    if (opciones.size < 4) {
      opciones.add(real + delta);
    }
  }
  return { restantes, corrido, real, opciones: [...opciones].sort((a, b) => a - b) };
}

const textoBarajas = (n: number) => `${String(n).replace(".5", " y media")} ${n === 1 ? "baraja" : "barajas"}`.replace("0 y media barajas", "media baraja");

// Dibujo de la bandeja de descarte: lo que ya salió frente a lo que queda.
function Zapato({ restantes }: { restantes: number }) {
  const salieron = BARAJAS_ZAPATO - restantes;
  return (
    <div className="zapato" aria-label={`Quedan ${textoBarajas(restantes)} de ${BARAJAS_ZAPATO}`} role="img">
      <div className="pila">
        <div className="pila-relleno descartes" style={{ height: `${(salieron / BARAJAS_ZAPATO) * 100}%` }} />
        <span>Ya salieron</span>
      </div>
      <div className="pila">
        <div className="pila-relleno quedan" style={{ height: `${(restantes / BARAJAS_ZAPATO) * 100}%` }} />
        <span>Quedan</span>
      </div>
    </div>
  );
}

export function ConteoReal({ onVolver }: { onVolver: () => void }) {
  const progreso = useProgreso().real;
  const [ejercicio, setEjercicio] = useState(nuevoEjercicio);
  const [elegida, setElegida] = useState<number | null>(null);
  const [racha, setRacha] = useState(0);

  const elegir = (n: number) => {
    if (elegida !== null) {
      return;
    }
    const bien = n === ejercicio.real;
    const nueva = bien ? racha + 1 : 0;
    setElegida(n);
    setRacha(nueva);
    anotar("real", bien, nueva);
  };

  return (
    <main className="pantalla">
      <Encabezado onVolver={onVolver} paso="Lección 4" titulo="Conteo real" />

      <Explicacion abierta={progreso.intentos === 0} titulo="¿Por qué dividir?">
        <p>
          Un +6 no significa lo mismo con 6 barajas por salir que con 1. Con muchas barajas, esas cartas altas de más se
          diluyen. Por eso se divide:
        </p>
        <p className="formula">conteo real = conteo corrido ÷ barajas que quedan</p>
        <p>
          Las barajas que quedan se calculan a ojo, viendo la bandeja de cartas descartadas. Al dividir,{" "}
          <strong>quita los decimales</strong>: +7 ÷ 2 = 3.5 → <strong>+3</strong>.
        </p>
        <p>
          ¿Para qué sirve? Con un conteo real de <strong>+2 o más</strong>, la ventaja pasa del casino al jugador. Es pura
          estadística: por eso los casinos usan muchas barajas y revuelven seguido.
        </p>
      </Explicacion>

      <Racha mejor={progreso.mejorRacha} racha={racha} />

      <section className="tarjeta-ejercicio">
        <div className="dato">
          <span>Conteo corrido</span>
          <strong>{signo(ejercicio.corrido)}</strong>
        </div>
        <Zapato restantes={ejercicio.restantes} />
        <p className="texto-suave">Quedan {textoBarajas(ejercicio.restantes)} de {BARAJAS_ZAPATO}. ¿Cuál es el conteo real?</p>
      </section>

      <div className="opciones">
        {ejercicio.opciones.map((n) => (
          <button
            className={`opcion grande${elegida !== null && n === ejercicio.real ? " correcta" : ""}${elegida === n && n !== ejercicio.real ? " incorrecta" : ""}`}
            disabled={elegida !== null && n !== elegida && n !== ejercicio.real}
            key={n}
            onClick={() => elegir(n)}
            type="button"
          >
            {signo(n)}
          </button>
        ))}
      </div>

      {elegida !== null ? (
        <>
          <Resultado bien={elegida === ejercicio.real}>
            <p>
              {signo(ejercicio.corrido)} ÷ {ejercicio.restantes} = {(ejercicio.corrido / ejercicio.restantes).toFixed(2)} →{" "}
              <strong>{signo(ejercicio.real)}</strong>
              {ejercicio.real >= 2 ? ". Momento favorable para el jugador." : ejercicio.real <= -1 ? ". Momento desfavorable." : "."}
            </p>
          </Resultado>
          <button className="boton ancho" onClick={() => { setEjercicio(nuevoEjercicio()); setElegida(null); }} type="button">
            Siguiente
          </button>
        </>
      ) : null}
    </main>
  );
}
