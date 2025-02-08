import * as ohm from 'ohm-js'

import {
  code,
  codesec,
  export_,
  exportdesc,
  exportsec,
  flat,
  func,
  funcsec,
  functype,
  i32,
  instr,
  loadMod,
  module,
  typeidx,
  typesec,
  valtype
} from './lib/lib.js'

export const NopLangGrammarDef = `
  NopLang {
    Main = ""
  }
`
export const WaferGrammarDef = `
  Wafer {
    Main = number
    number = digit+

    // Examples:
    //+ "42", "1"
    //- "abc"
  }
`

/** @type { () => ohm.Grammar } */
export function getWafer() {
  return ohm.grammar(WaferGrammarDef)
}

/** @type { (wafer: ohm.Grammar) => ohm.Semantics } */
export function getWaferSemantics(wafer) {
    const semantics = wafer.createSemantics()

    semantics.addOperation('jsValue', {
      Main(num) {
        return num.jsValue()
      },
      number(digits) {
        return parseInt(this.sourceString, 10)
      },
    })

    semantics.addOperation('toWasm', {
      Main(num) {
        return [num.toWasm(), instr.end]
      },
      number(digits) {
        const value = this.jsValue()
        return [instr.i32.const, ...i32(value)]
      },
    })    
    
    return semantics
}

/** @type { (source: string) => Uint8Array } */
export function compileWafer(source) {
  const wafer = getWafer()
  const matchResult = wafer.match(source)
  if (!matchResult.succeeded()) {
    throw new Error(matchResult.message)
  }

  const semantics = getWaferSemantics(wafer)
  const mod = module([
    typesec([functype([], [valtype.i32])]),
    funcsec([typeidx(0)]),
    exportsec([export_('main', exportdesc.func(0))]),
    codesec([code(func([], semantics(matchResult).toWasm()))]),
  ])

  return Uint8Array.from(flat(mod))
}

/** @type { (source: string) => (() => number) } */
export function getMain(source) {
  const mod = loadMod(compileWafer(source))
  // @ts-ignore
  return mod.main
}
