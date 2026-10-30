import { type Ejercicio, type Marca, dominada, precision, useProgreso } from "../lib/progreso";

export type Leccion = "partida" | "estrategia" | "conteo" | "real";

const LECCIONES: { id: Leccion; titulo: string; descripcion: string; marcas: Ejercicio[]; minimo: number }[] = [
  { id: "partida", titulo: "Cómo se juega", descripcion: "Reglas del blackjack y manos de práctica.", marcas: ["partida"], minimo: 10 },
  { id: "estrategia", titulo: "Estrategia básica", descripcion: "La mejor jugada para cada mano.", marcas: ["estrategia"], minimo: 50 },
  { id: "conteo", titulo: "Conteo Hi-Lo", descripcion: "+1, 0 o −1 por carta, de cabeza y a velocidad.", marcas: ["valores", "corrido"], minimo: 20 },
  { id: "real", titulo: "Conteo real", descripcion: "Ajustar la cuenta a las barajas que quedan.", marcas: ["real"], minimo: 20 },
];

// Avance de 0 a 1: práctica hecha hacia el mínimo, y la partida solo cuenta manos jugadas.
function avance(marcas: Marca[], minimo: number, soloPractica: boolean) {
  const partes = marcas.map((m) => {
    if (soloPractica) {
      return Math.min(1, m.intentos / minimo);
    }
    return dominada(m, minimo) ? 1 : Math.min(0.95, m.intentos / minimo) * Math.min(1, precision(m) / 90);
  });
  return partes.reduce((s, p) => s + p, 0) / partes.length;
}

function Anillo({ valor, numero }: { valor: number; numero: number }) {
  const r = 22;
  const largo = 2 * Math.PI * r;
  return (
    <svg aria-hidden="true" className="anillo" viewBox="0 0 52 52">
      <circle className="anillo-fondo" cx="26" cy="26" r={r} />
      <circle className="anillo-valor" cx="26" cy="26" r={r} strokeDasharray={largo} strokeDashoffset={largo * (1 - valor)} />
      <text x="26" y="31">{valor >= 1 ? "✓" : numero}</text>
    </svg>
  );
}

export function Inicio({ onAbrir }: { onAbrir: (l: Leccion) => void }) {
  const progreso = useProgreso();

  return (
    <main className="pantalla">
      <header className="portada">
        <p className="paso">Escuela de conteo</p>
        <h1>
          Conteo<span className="acento">+1</span>
        </h1>
        <p className="texto-suave">Aprende blackjack y a contar cartas paso a paso. Solo práctica: sin dinero ni apuestas.</p>
      </header>

      <ol className="lecciones">
        {LECCIONES.map((l, i) => {
          const marcas = l.marcas.map((m) => progreso[m]);
          const valor = avance(marcas, l.minimo, l.id === "partida");
          const practicas = marcas.reduce((s, m) => s + m.intentos, 0);
          return (
            <li key={l.id}>
              <button className="leccion" onClick={() => onAbrir(l.id)} type="button">
                <Anillo numero={i + 1} valor={valor} />
                <span className="leccion-texto">
                  <strong>{l.titulo}</strong>
                  <span>{l.descripcion}</span>
                  {practicas > 0 && l.id !== "partida" ? (
                    <span className="leccion-dato">
                      {Math.round(marcas.reduce((s, m) => s + precision(m), 0) / marcas.length)} % de aciertos · racha máx.{" "}
                      {Math.max(...marcas.map((m) => m.mejorRacha))}
                    </span>
                  ) : practicas > 0 ? (
                    <span className="leccion-dato">{practicas} manos jugadas</span>
                  ) : null}
                </span>
                <span aria-hidden="true" className="flecha">→</span>
              </button>
            </li>
          );
        })}
      </ol>

      <p className="nota">Tu progreso se guarda solo en este celular.</p>
    </main>
  );
}
