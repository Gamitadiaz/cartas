import { useEffect, useState } from "react";

import { Conteo } from "./pantallas/Conteo";
import { ConteoReal } from "./pantallas/ConteoReal";
import { Estrategia } from "./pantallas/Estrategia";
import { Inicio, type Leccion } from "./pantallas/Inicio";
import { Partida } from "./pantallas/Partida";

// Navegación simple: la lección abierta vive en el historial para que el botón "atrás" del celular regrese al inicio.
export function App() {
  const [leccion, setLeccion] = useState<Leccion | null>(null);

  useEffect(() => {
    const alRegresar = () => setLeccion(null);
    window.addEventListener("popstate", alRegresar);
    return () => window.removeEventListener("popstate", alRegresar);
  }, []);

  const abrir = (l: Leccion) => {
    history.pushState({ leccion: l }, "");
    setLeccion(l);
    window.scrollTo(0, 0);
  };
  const volver = () => history.back();

  switch (leccion) {
    case "partida":
      return <Partida onVolver={volver} />;
    case "estrategia":
      return <Estrategia onVolver={volver} />;
    case "conteo":
      return <Conteo onVolver={volver} />;
    case "real":
      return <ConteoReal onVolver={volver} />;
    default:
      return <Inicio onAbrir={abrir} />;
  }
}
