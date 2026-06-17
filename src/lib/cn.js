// Pequeño helper para concatenar clases condicionales (sin dependencias)
export function cn(...args) {
  return args
    .flat()
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}
