// =============================================================
// mockDb — CRUD genérico estilo Firestore sobre localStorage
// =============================================================
import { readCollection, writeCollection } from './persistence'

export const all = (collection) => readCollection(collection)

export const find = (collection, predicate) =>
  readCollection(collection).filter(predicate)

export const findOne = (collection, predicate) =>
  readCollection(collection).find(predicate) || null

export const findById = (collection, idField, id) =>
  readCollection(collection).find((r) => r[idField] === id) || null

export const insert = (collection, row) => {
  const rows = readCollection(collection)
  rows.push(row)
  writeCollection(collection, rows)
  return row
}

export const update = (collection, idField, id, patch) => {
  const rows = readCollection(collection)
  const idx = rows.findIndex((r) => r[idField] === id)
  if (idx === -1) return null
  rows[idx] = { ...rows[idx], ...patch }
  writeCollection(collection, rows)
  return rows[idx]
}

export const remove = (collection, idField, id) => {
  const rows = readCollection(collection).filter((r) => r[idField] !== id)
  writeCollection(collection, rows)
}
