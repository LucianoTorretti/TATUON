// =============================================================
// Persistencia local — wrapper sobre localStorage con namespace
// =============================================================
const PREFIX = 'tatuon:'

export const storageKey = (name) => `${PREFIX}${name}`

export const readCollection = (name) => {
  try {
    const raw = localStorage.getItem(storageKey(name))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const writeCollection = (name, rows) => {
  localStorage.setItem(storageKey(name), JSON.stringify(rows))
}

export const readValue = (name, fallback = null) => {
  try {
    const raw = localStorage.getItem(storageKey(name))
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export const writeValue = (name, value) => {
  localStorage.setItem(storageKey(name), JSON.stringify(value))
}

export const removeValue = (name) => localStorage.removeItem(storageKey(name))

// Simula latencia de red para que el prototipo se sienta real (RNF-01: < 1.5s)
export const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms))

// ID incremental simple tipo Firestore
export const genId = (prefix = 'id') =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
