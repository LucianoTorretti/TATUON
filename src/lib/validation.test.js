import { describe, it, expect } from 'vitest'
import {
  validateDatos, validateVerificacion, normalizePhone, LIMITES,
} from './validation'
import { ROLES } from './constants'

const datosOk = {
  nombre: 'Camila Rojas',
  email: 'camila@mail.cl',
  password: 'tatuaje123',
  telefono: '+56 9 1234 5678',
  comuna: 'Providencia',
}

describe('validateDatos', () => {
  it('no devuelve errores con datos válidos', () => {
    expect(validateDatos(datosOk)).toEqual({})
  })

  it('exige nombre de al menos 3 caracteres sin contar espacios', () => {
    expect(validateDatos({ ...datosOk, nombre: '  ab  ' }).nombre).toBeDefined()
  })

  it('rechaza nombres demasiado largos', () => {
    const nombre = 'a'.repeat(LIMITES.NOMBRE_MAX + 1)
    expect(validateDatos({ ...datosOk, nombre }).nombre).toBeDefined()
  })

  it.each(['', 'sin-arroba', 'a@b', 'a b@mail.cl'])('rechaza el correo "%s"', (email) => {
    expect(validateDatos({ ...datosOk, email }).email).toBeDefined()
  })

  it('acepta correos con espacios alrededor', () => {
    expect(validateDatos({ ...datosOk, email: '  camila@mail.cl ' }).email).toBeUndefined()
  })

  it.each(['abc12', 'abcdefgh', '12345678'])('rechaza la contraseña débil "%s"', (password) => {
    expect(validateDatos({ ...datosOk, password }).password).toBeDefined()
  })

  it('exige teléfono', () => {
    expect(validateDatos({ ...datosOk, telefono: '' }).telefono).toBeDefined()
  })

  it.each(['12345', '+56 2 2123 4567', '+1 555 123 4567'])('rechaza el teléfono "%s"', (telefono) => {
    expect(validateDatos({ ...datosOk, telefono }).telefono).toBeDefined()
  })

  it('rechaza comunas que no están en la lista', () => {
    expect(validateDatos({ ...datosOk, comuna: 'Narnia' }).comuna).toBeDefined()
  })

  it('omite correo y contraseña al completar perfil (Google)', () => {
    const { password, email, ...resto } = datosOk
    expect(validateDatos(resto, { requireCredenciales: false })).toEqual({})
  })
})

describe('normalizePhone', () => {
  it.each([
    ['+56 9 1234 5678', '+56912345678'],
    ['+56912345678', '+56912345678'],
    ['56912345678', '+56912345678'],
    ['9 1234 5678', '+56912345678'],
    ['9-1234-5678', '+56912345678'],
  ])('normaliza "%s" a "%s"', (input, esperado) => {
    expect(normalizePhone(input)).toBe(esperado)
  })

  it('devuelve null si no es un móvil chileno', () => {
    expect(normalizePhone('22123456')).toBeNull()
  })
})

describe('validateVerificacion', () => {
  const artistaOk = {
    estilos: ['Blackwork'], tarifa_media: '80000', instagram: '@camila.ink', biografia: '',
  }

  it('cliente no tiene paso de verificación', () => {
    expect(validateVerificacion({}, ROLES.CLIENTE)).toEqual({})
  })

  it('artista válido no tiene errores', () => {
    expect(validateVerificacion(artistaOk, ROLES.ARTISTA)).toEqual({})
  })

  it('artista debe elegir al menos un estilo', () => {
    expect(validateVerificacion({ ...artistaOk, estilos: [] }, ROLES.ARTISTA).estilos).toBeDefined()
  })

  it.each(['-1', '12.5', 'abc', String(LIMITES.TARIFA_MAX + 1)])('rechaza la tarifa "%s"', (tarifa_media) => {
    expect(validateVerificacion({ ...artistaOk, tarifa_media }, ROLES.ARTISTA).tarifa_media).toBeDefined()
  })

  it('la tarifa y el instagram son opcionales', () => {
    const r = validateVerificacion({ ...artistaOk, tarifa_media: '', instagram: '' }, ROLES.ARTISTA)
    expect(r).toEqual({})
  })

  it.each(['con espacio', '@' + 'a'.repeat(31), 'https://instagram.com/x'])('rechaza el instagram "%s"', (instagram) => {
    expect(validateVerificacion({ ...artistaOk, instagram }, ROLES.ARTISTA).instagram).toBeDefined()
  })

  it('limita el largo de la biografía', () => {
    const biografia = 'a'.repeat(LIMITES.BIO_MAX + 1)
    expect(validateVerificacion({ ...artistaOk, biografia }, ROLES.ARTISTA).biografia).toBeDefined()
  })

  it('estudio exige dirección', () => {
    const r = validateVerificacion({ direccion: '  ', biografia: '' }, ROLES.ESTUDIO)
    expect(r.direccion).toBeDefined()
  })

  it('estudio válido no tiene errores', () => {
    expect(validateVerificacion({ direccion: 'Av. Providencia 1234', biografia: '' }, ROLES.ESTUDIO)).toEqual({})
  })
})
