// Lección 3: conteo Hi-Lo. Primero el valor de cada carta; luego el conteo corrido con cartas que pasan solas.

import { useEffect, useRef, useState } from "react";

import { CartaVista, Encabezado, Explicacion, Racha, Resultado, signo } from "../componentes/basicos";
import { type Carta, cartaAlAzar, conteoDe, valorHiLo, zapato } from "../lib/cartas";
import { anotar, useProgreso } from "../lib/progreso";

export function Conteo({ onVolver }: { onVolver: () => void }) {
  const [modo, setModo] = useState<"valores" | "corrido">("valores");

  return (
    <main className="pantalla">
      <Encabezado onVolver={onVolver} paso="Lección 3" titulo="Conteo Hi-Lo" />

      <Explicacion abierta={modo === "valores"} titulo="La idea del conteo">
        <p>
          Las cartas altas (10, J, Q, K, As) le convienen al jugador; las bajas, al crupier. Si ya salieron muchas bajas,
          en lo que queda hay más altas. Contar es llevar esa cuenta de cabeza, carta por carta:
        </p>
        <div className="tabla-hilo">
          <div><strong>+1</strong><span>2 3 4 5 6</span></div>
          <div><strong>0</strong><span>7 8 9</span></div>
          <div><strong>−1</strong><span>10 J Q K A</span></div>
        </div>
        <p>Una baraja completa suma 0. Por eso un conteo positivo significa que quedan más cartas altas.</p>
      </Explicacion>

      <div className="pestanas" role="tablist">
        <button aria-selected={modo === "valores"} onClick={() => setModo("valores")} role="tab" type="button">
          1. Valor de cada carta
        </button>
        <button aria-selected={modo === "corrido"} onClick={() => setModo("corrido")} role="tab" type="button">
          2. Conteo corrido
        </button>
      </div>

      {modo === "valores" ? <Valores /> : <Corrido />}
    </main>
  );
}

function Valores() {
  const progreso = useProgreso().valores;
  const [actual, setActual] = useState(cartaAlAzar);
  const [racha, setRacha] = useState(0);
  const [fallo, setFallo] = useState<number | null>(null);

  const responder = (valor: number) => {
    const correcto = valorHiLo(actual.rango);
    const bien = valor === correcto;
    const nueva = bien ? racha + 1 : 0;
    setRacha(nueva);
    anotar("valores", bien, nueva);
    if (bien) {
      setFallo(null);
      setActual(cartaAlAzar());
    } else {
      setFallo(correcto);
    }
  };

  return (
    <>
      <Racha mejor={progreso.mejorRacha} racha={racha} />
      <div className="centro-carta">
        <CartaVista carta={actual} grande key={actual.id} />
      </div>
      {fallo !== null ? (
        <Resultado bien={false}>
          <p>
            El {actual.rango} vale <strong>{signo(fallo)}</strong>.
          </p>
        </Resultado>
      ) : null}
      {fallo !== null ? (
        <button className="boton ancho" onClick={() => { setFallo(null); setActual(cartaAlAzar()); }} type="button">
          Siguiente carta
        </button>
      ) : (
        <div className="opciones tres">
          {[1, 0, -1].map((v) => (
            <button className="opcion grande" key={v} onClick={() => responder(v)} type="button">
              {signo(v)}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

const VELOCIDADES = [
  { nombre: "Lento", ms: 1500 },
  { nombre: "Normal", ms: 1000 },
  { nombre: "Rápido", ms: 650 },
  { nombre: "Casino", ms: 400 },
];
const CANTIDADES = [10, 20, 52];

type Fase = { tipo: "listo" } | { tipo: "pasando"; cartas: Carta[]; indice: number } | { tipo: "respuesta"; cartas: Carta[] };

function Corrido() {
  const progreso = useProgreso().corrido;
  const [cantidad, setCantidad] = useState(20);
  const [velocidad, setVelocidad] = useState(1000);
  const [fase, setFase] = useState<Fase>({ tipo: "listo" });
  const [respuesta, setRespuesta] = useState(0);
  const [revisada, setRevisada] = useState(false);
  const [racha, setRacha] = useState(0);
  const temporizador = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (fase.tipo !== "pasando") {
      return;
    }
    temporizador.current = window.setTimeout(() => {
      setFase(fase.indice + 1 < fase.cartas.length ? { ...fase, indice: fase.indice + 1 } : { tipo: "respuesta", cartas: fase.cartas });
    }, velocidad);
    return () => window.clearTimeout(temporizador.current);
  }, [fase, velocidad]);

  const empezar = () => {
    setRespuesta(0);
    setRevisada(false);
    setFase({ tipo: "pasando", cartas: zapato(1).slice(0, cantidad), indice: 0 });
  };

  if (fase.tipo === "listo") {
    return (
      <>
        <Racha mejor={progreso.mejorRacha} racha={racha} />
        <p className="texto-suave">Las cartas pasan solas, una por una. Lleva la cuenta en tu cabeza y al final dices el total.</p>
        <p className="etiqueta">Cartas</p>
        <div className="selector">
          {CANTIDADES.map((c) => (
            <button aria-pressed={cantidad === c} key={c} onClick={() => setCantidad(c)} type="button">
              {c === 52 ? "Baraja entera" : c}
            </button>
          ))}
        </div>
        <p className="etiqueta">Velocidad</p>
        <div className="selector">
          {VELOCIDADES.map((v) => (
            <button aria-pressed={velocidad === v.ms} key={v.ms} onClick={() => setVelocidad(v.ms)} type="button">
              {v.nombre}
            </button>
          ))}
        </div>
        <button className="boton ancho" onClick={empezar} type="button">Empezar</button>
        {cantidad === 52 ? <p className="nota">Truco: si al terminar no te da 0, te equivocaste en algo.</p> : null}
      </>
    );
  }

  if (fase.tipo === "pasando") {
    const actual = fase.cartas[fase.indice];
    return (
      <>
        <p className="contador-cartas">
          Carta {fase.indice + 1} de {fase.cartas.length}
        </p>
        <div className="centro-carta">
          <CartaVista carta={actual} grande key={actual.id} />
        </div>
        <button className="boton secundario ancho" onClick={() => setFase({ tipo: "listo" })} type="button">Detener</button>
      </>
    );
  }

  const correcto = conteoDe(fase.cartas);
  const bien = respuesta === correcto;
  const revisar = () => {
    const nueva = bien ? racha + 1 : 0;
    setRacha(nueva);
    setRevisada(true);
    anotar("corrido", bien, nueva);
  };

  return (
    <>
      <p className="texto-suave">¿Cuánto da tu cuenta?</p>
      <div className="paso-numero">
        <button aria-label="Restar uno" disabled={revisada} onClick={() => setRespuesta((r) => r - 1)} type="button">−</button>
        <output aria-live="polite">{signo(respuesta)}</output>
        <button aria-label="Sumar uno" disabled={revisada} onClick={() => setRespuesta((r) => r + 1)} type="button">+</button>
      </div>
      {revisada ? (
        <>
          <Resultado bien={bien}>
            <p>
              El conteo era <strong>{signo(correcto)}</strong>.
            </p>
          </Resultado>
          <details className="explicacion">
            <summary>Ver las cartas con su cuenta</summary>
            <ol className="repaso">
              {fase.cartas.map((c, i) => (
                <li key={c.id}>
                  <CartaVista carta={c} />
                  <span>{signo(conteoDe(fase.cartas.slice(0, i + 1)))}</span>
                </li>
              ))}
            </ol>
          </details>
          <button className="boton ancho" onClick={empezar} type="button">Otra ronda</button>
          <button className="boton secundario ancho" onClick={() => setFase({ tipo: "listo" })} type="button">Cambiar cartas o velocidad</button>
        </>
      ) : (
        <button className="boton ancho" onClick={revisar} type="button">Revisar</button>
      )}
    </>
  );
}
