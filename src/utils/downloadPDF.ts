import jsPDF from 'jspdf';
import type { RefObject } from 'react';

export const handleDownloadPDF = async (printAreaRef: RefObject<HTMLDivElement | null>, filename: string) => {
  if (!printAreaRef.current) return;

  const svgElement = printAreaRef.current.querySelector('.sheet svg');
  if (!svgElement) {
    alert("No hay partitura para descargar.");
    return;
  }

  if (!svgElement.getAttribute('xmlns')) {
    svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }

  const svgData = new XMLSerializer().serializeToString(svgElement);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const rect = svgElement.getBoundingClientRect();
  const width = rect.width || 800;
  const height = rect.height || 600;

  // Renderizamos en Alta Definición
  canvas.width = width * 2;
  canvas.height = height * 2;
  ctx.scale(2, 2);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const img = new Image();
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    ctx.drawImage(img, 0, 0, width, height);
    URL.revokeObjectURL(url);

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeightMm = pdf.internal.pageSize.getHeight();
    
    // Dejamos 10mm de margen arriba y abajo para que respire
    const marginMm = 10;
    const usablePageHeightMm = pdfHeightMm - (marginMm * 2); 
    
    // Calculamos la relación de aspecto (Píxeles a Milímetros)
    const ratio = pdfWidth / canvas.width;
    const pageHeightPx = Math.floor(usablePageHeightMm / ratio); 

    let remainingHeight = canvas.height;
    let sourceY = 0; // Por dónde vamos copiando la imagen original

    while (remainingHeight > 0) {
      let chunkHeight = pageHeightPx;

      // Si la imagen es más grande que una página, buscamos el "corte seguro"
      if (remainingHeight > pageHeightPx) {
        const safeCutY = sourceY + pageHeightPx;
        let consecutiveWhiteLines = 0;

        try {
          // ESCÁNER DE PÍXELES: Escaneamos hacia arriba buscando el hueco entre pentagramas
          for (let y = safeCutY; y > sourceY; y--) {
            // Leemos 1 línea horizontal entera
            const pixelData = ctx.getImageData(0, y, canvas.width, 1).data;
            let isWhite = true;
            
            // Revisamos cada píxel de esa línea
            for (let i = 0; i < pixelData.length; i += 4) {
              if (pixelData[i] < 250 || pixelData[i+1] < 250 || pixelData[i+2] < 250) {
                isWhite = false; // ¡Chocamos con una nota o una línea del pentagrama!
                break;
              }
            }

            if (isWhite) {
              consecutiveWhiteLines++;
              // Si encontramos 5 líneas blancas seguidas, cortamos aquí
              if (consecutiveWhiteLines >= 20) {
                chunkHeight = y - sourceY;
                break;
              }
            } else {
              consecutiveWhiteLines = 0; // Reiniciamos el contador si tocamos tinta
            }
          }
        } catch (e) {
            console.error("Error al escanear píxeles para corte seguro:", e);
            console.warn("Seguridad del navegador impidió escanear píxeles. Usando corte por defecto.");
        }
      } else {
        // Es la última página, imprimimos lo que queda
        chunkHeight = remainingHeight;
      }

      // Creamos un mini-canvas solo para este trozo (página actual)
      const pieceCanvas = document.createElement('canvas');
      pieceCanvas.width = canvas.width;
      pieceCanvas.height = chunkHeight;
      const pieceCtx = pieceCanvas.getContext('2d');
      
      if (pieceCtx) {
        pieceCtx.fillStyle = '#ffffff';
        pieceCtx.fillRect(0, 0, pieceCanvas.width, pieceCanvas.height);
        
        // Copiamos la franja exacta de la imagen original
        pieceCtx.drawImage(canvas, 0, sourceY, canvas.width, chunkHeight, 0, 0, canvas.width, chunkHeight);
        
        const pieceData = pieceCanvas.toDataURL('image/png');
        const pieceHeightMm = chunkHeight * ratio;
        
        // Si no es la primera página, añadimos un folio nuevo
        if (sourceY > 0) pdf.addPage();
        
        // Pegamos el trozo en el folio con su margen superior
        pdf.addImage(pieceData, "PNG", 0, marginMm, pdfWidth, pieceHeightMm);
      }

      // Avanzamos los cursores matemáticos
      sourceY += chunkHeight;
      remainingHeight -= chunkHeight;
    }

    pdf.save(filename + ".pdf");
  };
  
  img.src = url;
};