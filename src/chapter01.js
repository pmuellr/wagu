/** @typedef { import('./types.ts').Numberz } Numberz */

import { module, typesec, functype, func, funcsec, typeidx, exportsec, export_, exportdesc, codesec, code } from './lib/lib.js'

/** @type { (code: string) => Uint8Array } */
export function compileVoidLang(source) {
  if (source !== '') {
    throw new Error(`Expected empty code, got: "${source}"`)
  }
  const instr = {
    end: 0x0b,
  }

  const mod = module([
    typesec([functype([], [])]),
    funcsec([typeidx(0)]),
    exportsec([export_('main', exportdesc.func(0))]),
    codesec([code(func([], [instr.end]))]),
  ]);

  // @ts-ignore
  return Uint8Array.from(mod.flat(Infinity))
}
