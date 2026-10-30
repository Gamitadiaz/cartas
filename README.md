# Conteo

App para aprender blackjack y conteo de cartas Hi-Lo, paso a paso y solo como práctica (sin dinero).
Funciona sin internet y guarda el progreso en el celular.

- Lección 1: reglas y manos de práctica contra el crupier.
- Lección 2: estrategia básica (4–8 barajas, crupier se planta en 17 suave).
- Lección 3: valor Hi-Lo de cada carta y conteo corrido a distintas velocidades.
- Lección 4: conteo real (corrido ÷ barajas que quedan).

Publicada en https://gamitadiaz.github.io/cartas/ en cada push a `main`.

```
npm install
npm run dev
```

## Cómo se publica

Cada `git push` a `main` corre [`.github/workflows/publicar.yml`](.github/workflows/publicar.yml): GitHub instala
las dependencias, compila con `npm run build` (sale en `dist/`) y lo sube a GitHub Pages.
La app guarda una copia en el celular (service worker), así que abre sin internet y se actualiza sola.

## Qué hace cada archivo

```
index.html                 Página base: título, colores de la barra del celular, ícono
vite.config.ts             Configuración: subruta /cartas/ y datos para instalar la app (PWA)
public/                    Íconos (icono.svg y los PNG que genera rsvg-convert a partir de él)
src/
  main.tsx                 Arranque: carga la fuente y los estilos, registra el modo sin internet
  App.tsx                  Navegación entre el inicio y las 4 lecciones (el botón atrás del cel funciona)
  estilos.css              Todo el diseño: colores "mesa de noche", cartas dibujadas, botones, animaciones
  componentes/
    basicos.tsx            Piezas reutilizables: la carta, una mano, encabezado, racha, explicación, resultado
  pantallas/
    Inicio.tsx             Lista de lecciones con anillo de progreso
    Partida.tsx            Lección 1: reglas y manos contra el crupier
    Estrategia.tsx         Lección 2: elige la jugada y te explica por qué
    Conteo.tsx             Lección 3: valor Hi-Lo de cada carta y conteo corrido con cartas que pasan solas
    ConteoReal.tsx         Lección 4: conteo corrido ÷ barajas que quedan
  lib/                     Lógica sin pantallas
    cartas.ts              Cartas, barajar, zapato de varias barajas, total de una mano, valor Hi-Lo
    estrategia.ts          Tabla de estrategia básica y la explicación de cada jugada
    progreso.ts            Aciertos y rachas guardados en el celular (localStorage)
```

Para cambiar las reglas de la estrategia (por ejemplo, otra cantidad de barajas) solo se toca `estrategia.ts`.
