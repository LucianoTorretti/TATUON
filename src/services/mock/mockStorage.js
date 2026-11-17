// =============================================================
// mockStorage — simula Firebase Storage (subida de PDF e imágenes)
// Guarda el archivo como dataURL en localStorage y devuelve una "URL".
// =============================================================
import { delay, genId } from './persistence'

const MAX_BYTES = 4 * 1024 * 1024 // 4 MB tope para no saturar localStorage

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

// Sube un archivo. path: carpeta lógica ("documentos", "portafolio", "avatars")
export const upload = async (path, file) => {
  await delay(700)
  if (!file) throw new Error('No se seleccionó ningún archivo.')
  if (file.size > MAX_BYTES) {
    throw new Error('El archivo supera el tamaño máximo permitido (4 MB).')
  }
  const dataUrl = await fileToDataUrl(file)
  const id = genId('file')
  const key = `tatuon:storage:${path}/${id}`
  try {
    localStorage.setItem(key, dataUrl)
  } catch {
    // Si localStorage se llena, devolvemos el dataURL igual (sesión en memoria)
  }
  return {
    url: dataUrl, // en Supabase sería una URL https://...
    ref: `${path}/${id}`,
    name: file.name,
    size: file.size,
    contentType: file.type,
  }
}

export const storage = { upload }
