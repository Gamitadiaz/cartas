// Cartas, zapato (varias barajas juntas), valor de las manos y conteo Hi-Lo.

export const PALOS = ["♠", "♥", "♦", "♣"] as const;
export const RANGOS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"] as const;

export type Palo = (typeof PALOS)[number];
export type Rango = (typeof RANGOS)[number];
export type Carta = { rango: Rango; palo: Palo; id: number };

let siguienteId = 0;

export function carta(rango: Rango, palo: Palo = PALOS[Math.floor(Math.random() * 4)]): Carta {
  return { rango, palo, id: siguienteId++ };
}

export function barajar<T>(lista: T[]) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Un zapato de `barajas` barajas de 52 cartas, ya revuelto.
export function zapato(barajas: number) {
  const cartas: Carta[] = [];
  for (let b = 0; b < barajas; b++) {
    for (const palo of PALOS) {
      for (const rango of RANGOS) {
        cartas.push(carta(rango, palo));
      }
    }
  }
  return barajar(cartas);
}

export function cartaAlAzar() {
  return carta(RANGOS[Math.floor(Math.random() * RANGOS.length)]);
}

export const esRoja = (c: Carta) => c.palo === "♥" || c.palo === "♦";

// Valor en blackjack: figuras valen 10 y el As 11 (luego se baja a 1 si hace falta).
export function valorCarta(rango: Rango) {
  if (rango === "A") {
    return 11;
  }
  if (rango === "J" || rango === "Q" || rango === "K") {
    return 10;
  }
  return Number(rango);
}

// Hi-Lo: 2–6 suman, 7–9 no cuentan, 10 a As restan.
export function valorHiLo(rango: Rango) {
  const v = valorCarta(rango);
  if (v <= 6) {
    return 1;
  }
  if (v <= 9) {
    return 0;
  }
  return -1;
}

export function conteoDe(cartas: Carta[]) {
  return cartas.reduce((s, c) => s + valorHiLo(c.rango), 0);
}

// Total de una mano. "Suave" = tiene un As que todavía cuenta como 11.
export function totalMano(cartas: Carta[]) {
  let total = 0;
  let ases = 0;
  for (const c of cartas) {
    total += valorCarta(c.rango);
    if (c.rango === "A") {
      ases++;
    }
  }
  while (total > 21 && ases > 0) {
    total -= 10;
    ases--;
  }
  return { total, suave: ases > 0 };
}

export const esBlackjack = (cartas: Carta[]) => cartas.length === 2 && totalMano(cartas).total === 21;

export function describirMano(cartas: Carta[]) {
  const { total, suave } = totalMano(cartas);
  if (esBlackjack(cartas)) {
    return "Blackjack";
  }
  if (total > 21) {
    return `${total}: te pasaste`;
  }
  return suave && total < 21 ? `${total - 10} o ${total}` : String(total);
}
