import abcjs from "abcjs";

class CursorControl {
  lastElements: Element[] = [];

  onEvent(event: abcjs.NoteTimingEvent | null) {
    // 1. BORRAR EL COLOR ANTERIOR (Restaurar)
    if (this.lastElements && this.lastElements.length > 0) {
      this.lastElements.forEach((el) => {
        // En lugar de quitar clase, borramos el estilo directo
        (el as HTMLElement).style.fill = ""; 
        (el as HTMLElement).style.stroke = "";
      });
    }

    if (!event || !event.elements) {
      this.lastElements = [];
      return;
    }

    // 2. OBTENER NUEVOS ELEMENTOS
    const rawElements = event.elements as unknown as Element[][];
    this.lastElements = rawElements.flat();

    // 3. PINTAR DIRECTAMENTE (Fuerza bruta)
    this.lastElements.forEach((el) => {
      // Forzamos el color rojo directamente en el elemento
      (el as HTMLElement).style.fill = "#ff0000"; 
      (el as HTMLElement).style.stroke = "#ff0000";
    });
  }

  onFinished() {
    this.onEvent(null);
  }
}

export default CursorControl;