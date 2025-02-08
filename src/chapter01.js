/** @typedef { import('./types.ts').Numberz } Numberz */

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
  instr,
  module,
  typesec,
  typeidx,
} from './lib/lib.js'

/** @type { (code: string) => Uint8Array } */
export function compileVoidLang(source) {
  if (source !== '') {
    throw new Error(`Expected empty code, got: "${source}"`)
  }

  const mod = module([
    typesec([functype([], [])]),
    funcsec([typeidx(0)]),
    exportsec([export_('main', exportdesc.func(0))]),
    codesec([code(func([], [instr.end]))]),
  ])

  return Uint8Array.from(flat(mod))
}
