// Estrategia básica para 4–8 barajas: el crupier se planta en 17 suave y se puede doblar después de dividir.
// Es la jugada que, a la larga, pierde menos; no depende del conteo.

import { type Carta, type Rango, totalMano, valorCarta } from "./cartas";

export type Jugada = "pedir" | "plantarse" | "doblar" | "dividir";

export const NOMBRE_JUGADA: Record<Jugada, string> = {
  pedir: "Pedir",
  plantarse: "Plantarse",
  doblar: "Doblar",
  dividir: "Dividir",
};

// Carta visible del crupier como número: 2–10, y el As como 11.
const entre = (d: number, desde: number, hasta: number) => d >= desde && d <= hasta;

function pares(rango: number, d: number): Jugada | null {
  switch (rango) {
    case 11:
    case 8:
      return "dividir";
    case 2:
    case 3:
    case 7:
      return entre(d, 2, 7) ? "dividir" : null;
    case 4:
      return entre(d, 5, 6) ? "dividir" : null;
    case 6:
      return entre(d, 2, 6) ? "dividir" : null;
    case 9:
      return d === 7 || d >= 10 ? "plantarse" : "dividir";
    default:
      // 5-5 se juega como 10 duro y 10-10 siempre se planta.
      return null;
  }
}

function suaves(total: number, d: number, puedeDoblar: boolean): Jugada {
  const doblarO = (otra: Jugada) => (puedeDoblar ? "doblar" : otra);
  if (total >= 19) {
    return "plantarse";
  }
  if (total === 18) {
    if (entre(d, 3, 6)) {
      return doblarO("plantarse");
    }
    return d <= 8 ? "plantarse" : "pedir";
  }
  const desde = { 17: 3, 16: 4, 15: 4, 14: 5, 13: 5 }[total] ?? 99;
  return entre(d, desde, 6) ? doblarO("pedir") : "pedir";
}

function duras(total: number, d: number, puedeDoblar: boolean): Jugada {
  if (total >= 17) {
    return "plantarse";
  }
  if (total >= 13) {
    return d <= 6 ? "plantarse" : "pedir";
  }
  if (total === 12) {
    return entre(d, 4, 6) ? "plantarse" : "pedir";
  }
  if (puedeDoblar && ((total === 11 && d <= 10) || (total === 10 && d <= 9) || (total === 9 && entre(d, 3, 6)))) {
    return "doblar";
  }
  return "pedir";
}

export function jugadaCorrecta(mano: Carta[], crupier: Rango): Jugada {
  const d = valorCarta(crupier);
  const puedeDoblar = mano.length === 2;
  if (mano.length === 2 && valorCarta(mano[0].rango) === valorCarta(mano[1].rango)) {
    const division = pares(valorCarta(mano[0].rango), d);
    if (division) {
      return division;
    }
  }
  const { total, suave } = totalMano(mano);
  return suave ? suaves(total, d, puedeDoblar) : duras(total, d, puedeDoblar);
}

// Una frase corta del porqué, para aprender la idea y no solo memorizar la tabla.
export function porQue(mano: Carta[], crupier: Rango): string {
  const d = valorCarta(crupier);
  const jugada = jugadaCorrecta(mano, crupier);
  const { total, suave } = totalMano(mano);
  const debil = d <= 6;
  const par = mano.length === 2 && valorCarta(mano[0].rango) === valorCarta(mano[1].rango);

  if (par && jugada === "dividir") {
    if (mano[0].rango === "A") {
      return "Dos ases siempre se dividen: cada uno puede llegar a 21.";
    }
    if (valorCarta(mano[0].rango) === 8) {
      return "16 es la peor mano; dos manos que empiezan en 8 son mucho mejores.";
    }
    return "El crupier muestra una carta débil: conviene tener dos manos contra él.";
  }
  if (jugada === "doblar") {
    return debil
      ? "El crupier está débil y tu mano puede mejorar mucho con una sola carta: aprovecha y dobla."
      : "Con este total, una carta de 10 te deja muy fuerte: vale la pena doblar.";
  }
  if (suave && jugada === "pedir") {
    return "Tu mano es suave: el As puede volver a valer 1, así que pedir no te puede pasar de 21.";
  }
  if (jugada === "plantarse") {
    if (total >= 17) {
      return "Ya tienes una mano hecha; pedir te arriesga a pasarte.";
    }
    return "El crupier muestra carta baja (2–6): lo más probable es que él se pase. Deja que se arriesgue él.";
  }
  if (total <= 11) {
    return "Con 11 o menos no te puedes pasar: siempre pide.";
  }
  if (total === 12 && debil) {
    return "12 contra 2 o 3 es la excepción: el crupier no está tan débil y solo te pasas con una carta de 10.";
  }
  return "El crupier muestra carta alta (7 a As): con mano baja casi seguro te gana si te plantas.";
}
