/** @typedef { import('../chapter01.ts').Numberz } Numberz */

/** @type { (bytes: Uint8Array) => WebAssembly.Exports } */
export function loadMod(bytes) {
  const mod = new WebAssembly.Module(bytes)
  return new WebAssembly.Instance(mod).exports
}

export const instr = {
  end: 0x0b,
  i32: { 'const': 0x41 },
  i64: { 'const': 0x42 },
  f32: { 'const': 0x43 },
  f64: { 'const': 0x44 },
}

export const valtype = {
  i32: 0x7f,
  i64: 0x7e,
  f32: 0x7d,
  f64: 0x7c,
}

/** @type { () => number[] } */
export function magic() {
  // [0x00, 0x61, 0x73, 0x6d]
  return stringToBytes('\0asm')
}

/** @type { () => number[] } */
export function version() {
  return [0x01, 0x00, 0x00, 0x00]
}

const SECTION_ID_TYPE = 1

/** @type { (n: Numberz) => number[] } */
export function flat(n) {
  // @ts-ignore
  return n.flat(Infinity)
}

/** @type { (paramTypes: number[], resultTypes: number[]) => Numberz } */
export function functype(paramTypes, resultTypes) {
  return [0x60, vec(paramTypes), vec(resultTypes)]
}

/** @type { (functypes: Numberz) => Numberz } */
export function typesec(functypes) {
  return section(SECTION_ID_TYPE, vec(functypes))
}

const SECTION_ID_FUNCTION = 3

/** @type { (x: number) => number[] } */
export function typeidx(x) { return u32(x) }

/** @type { (typeidxs: Numberz) => Numberz } */
export function funcsec(typeidxs) {
  return section(SECTION_ID_FUNCTION, vec(typeidxs))
}

const SECTION_ID_CODE = 10

/** @type { (func: Numberz) => Numberz } */
export function code(func) {
  const sizeInBytes = flat(func).length
  return [u32(sizeInBytes), func]
}

/** @type { (locals: Numberz, body: Numberz) => Numberz } */
export function func(locals, body) {
  return [vec(locals), body]
}

/** @type { (codes: Numberz) => Numberz } */
export function codesec(codes) {
  return section(SECTION_ID_CODE, vec(codes))
}

const SECTION_ID_EXPORT = 7

/** @type { (s: string) => Numberz } */
export function name(s) {
  return vec(stringToBytes(s))
}

/** @type { (nm: string, exportdesc: Numberz) => Numberz } */
export function export_(nm, exportdesc) {
  return [name(nm), exportdesc]
}

/** @type { (exports: Numberz) => Numberz } */
export function exportsec(exports) {
  return section(SECTION_ID_EXPORT, vec(exports))
}

/** @type { (x: number) => number[] } */
export function funcidx(x) { return u32(x) }

export const exportdesc = {
  /** @type { (idx: number) => Numberz } */  
  func: (idx) => [0x00, funcidx(idx)],
}

//----------------------------------------------------------------------

/** @type { (sections: Numberz) => Numberz } */
export function module(sections) {
  return [magic(), version(), sections]
}

/** @type { (id: number, contents: Numberz) => Numberz } */
export function section(id, contents) {
  const sizeInBytes = flat(contents).length
  return [id, u32(sizeInBytes), contents]
}

/** @type { (elements: Numberz) => Numberz } */
export function vec(elements) {
  if (!Array.isArray(elements)) {
    elements = [elements]
  }
  return [u32(elements.length), elements]
}

/** @type { (s: string) => number[] } */
export function stringToBytes(s) {
  const bytes = new TextEncoder().encode(s)
  return Array.from(bytes)
}

// @ts-ignore
const SEVEN_BIT_MASK_BIG_INT = 0b01111111n
const CONTINUATION_BIT = 0b10000000

/** @type { (v: number) => number[] } */
export function u32(v) {
  if (v < 0) throw new Error(`Value is negative: ${v}`)

  let val = BigInt(v)
  let more = true
  const r = []

  while (more) {
    const b = Number(val & SEVEN_BIT_MASK_BIG_INT)
    // @ts-ignore
    val = val >> 7n
    // @ts-ignore
    more = val !== 0n
    if (more) {
      r.push(b | CONTINUATION_BIT)
    } else {
      r.push(b)
    }
  }

  return r
}

/** @type { (v: number) => number[] } */
export function i32(v) {
  let val = BigInt(v)
  const r = []

  let more = true
  while (more) {
    // @ts-ignore
    const b = Number(val & 0b01111111n)
    const signBitSet = !!(b & 0x40)

    // @ts-ignore
    val = val >> 7n

    // @ts-ignore
    if ((val === 0n && !signBitSet) || (val === -1n && signBitSet)) {
      more = false
      r.push(b)
    } else {
      r.push(b | CONTINUATION_BIT)
    }
  }

  return r
}

export const NopLangBytes = [
  magic(),
  version(),

  // ----- type section -----

  1, // Section identifier
  4, // Section size in bytes
  1, // Number of entries that follow

  // type section - entry 0
  0x60, // Type `function`
  0, // Empty vector of parameters
  0, // Empty vector of return values

  // ----- function section -----

  3, // Section identifier
  2, // Section size in bytes
  1, // Number of entries that follow

  // function section - entry 0
  0, // Index of the type section entry

  // ----- code section -----

  10, // Section identifier
  4, // Section size in bytes
  1, // Number of entries that follow

  // code section - entry 0
  2, // Entry size in bytes
  0, // Empty vector of local variables
  11, // `end` instruction
].flat(Infinity)