// utils/drumPatterns.ts

export const getDrumTrack = (abcInput: string, style: string) => {
  if (style === 'none') return "";

  // 1. CABECERAS
  const headers = [
    "V:2 clef=perc stafflines=1", 
    "%%MIDI channel 10", 
    "%%MIDI drummap E 37", 
    "%%MIDI drummap F 36", 
    "%%MIDI drummap G 41", 
    "%%MIDI drummap A 44"  
  ].join("\n");

  // 2. PATRONES
  const patterns: Record<string, string> = {
    basic: "| E2 E2 E2 E2 ",       
    rock:  "| F2 G2 F2 G2 ",        
    disco: "| F/A/ G/A/ F/A/ G/A/ F/A/ G/A/ F/A/ G/A/ ", 
    jazz:  "| F z G z F z G z "   
  };

  const selectedPattern = patterns[style] || patterns['basic'];

  // 3. PROCESAMIENTO INTELIGENTE DE LÍNEAS
  const inputLines = abcInput.split('\n');
  const drumLines: string[] = []; 

  inputLines.forEach((line) => {
    let trimmedLine = line.trim();

    // Comprobamos si es una línea de música (ignora headers como K:, M:, etc.)
    // Y ahora permitimos que tenga barras invertidas también
    const isMusicLine = (trimmedLine.includes('|') || trimmedLine.includes('\\')) && !/^[A-Z]:/.test(trimmedLine);

    if (isMusicLine) {
      // --- DETECCIÓN DE CONTINUACIÓN (\) ---
      // Verificamos si la línea termina en '\'
      const hasContinuation = trimmedLine.endsWith('\\');

      // Si tiene continuación, la quitamos temporalmente para poder contar los compases bien
      // (si no, el conteo podría fallar o contar la barra como compás)
      if (hasContinuation) {
          trimmedLine = trimmedLine.slice(0, -1).trim();
      }

      // --- CONTEO DE COMPASES ---
      // Reemplazamos barras complejas por simples y limpiamos
      const normalizedLine = trimmedLine.replace(/\|:|:\||\|\]|\[\||\|\|/g, '|');
      const barsInLine = normalizedLine.split('|').filter(s => s.trim().length > 0).length;

      if (barsInLine > 0) {
        let currentLinePattern = "";
        for (let i = 0; i < barsInLine; i++) {
          currentLinePattern += selectedPattern;
        }

        // --- APLICACIÓN DE LA CONTINUACIÓN ---
        // Si la melodía tenía '\', se la ponemos también a la batería.
        // Esto le dice a ABCJS: "Une esta línea con la siguiente visualmente"
        if (hasContinuation) {
            drumLines.push(currentLinePattern + " \\");
        } else {
            drumLines.push(currentLinePattern);
        }
      }
    }
  });

  // 4. UNIÓN FINAL
  let drumNotes = drumLines.join('\n');
  drumNotes += "|]";

  return `${headers}\n${drumNotes}`;
};