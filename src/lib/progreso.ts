// Progreso de cada ejercicio, guardado solo en este celular (localStorage).

import { useEffect, useState } from "react";

export type Ejercicio = "partida" | "estrategia" | "valores" | "corrido" | "real";

export type Marca = {
  intentos: number;
  aciertos: number;
  mejorRacha: number;
  ultimaVez: string | null;
};

type Progreso = Record<Ejercicio, Marca>;

const CLAVE = "conteo-progreso-v1";
const vacia = (): Marca => ({ intentos: 0, aciertos: 0, mejorRacha: 0, ultimaVez: null });
const inicial = (): Progreso => ({ partida: vacia(), estrategia: vacia(), valores: vacia(), corrido: vacia(), real: vacia() });

function leer(): Progreso {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE) ?? "null") as Partial<Progreso> | null;
    return { ...inicial(), ...guardado };
  } catch {
    return inicial();
  }
}

let estado = leer();
const oyentes = new Set<() => void>();

export function anotar(ejercicio: Ejercicio, acierto: boolean, racha: number) {
  const m = estado[ejercicio];
  estado = {
    ...estado,
    [ejercicio]: {
      intentos: m.intentos + 1,
      aciertos: m.aciertos + (acierto ? 1 : 0),
      mejorRacha: Math.max(m.mejorRacha, racha),
      ultimaVez: new Date().toISOString(),
    },
  };
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
  } catch {
    // Sin almacenamiento (modo privado): el progreso vive solo mientras la app esté abierta.
  }
  for (const o of oyentes) {
    o();
  }
}

export function useProgreso() {
  const [actual, setActual] = useState(estado);
  useEffect(() => {
    const avisar = () => setActual(estado);
    oyentes.add(avisar);
    return () => {
      oyentes.delete(avisar);
    };
  }, []);
  return actual;
}

export const precision = (m: Marca) => (m.intentos > 0 ? Math.round((m.aciertos / m.intentos) * 100) : 0);

// Una lección se da por dominada con práctica suficiente y buena precisión.
export const dominada = (m: Marca, minimo: number) => m.intentos >= minimo && precision(m) >= 90;
