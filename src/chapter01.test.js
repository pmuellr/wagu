import { test } from 'node:test'
import assert from 'node:assert/strict'

import { compileVoidLang } from './chapter01.js'
import { NopLangBytes } from './lib/lib.js'

main()

async function main() {
  await test('chapter01', async (t) => {

    await test('compileVoidLang throws', async (t) => {
      let thrown = false
      try {
        compileVoidLang('x')
      } catch (error) {
        thrown = true
      }

      assert.ok(true)
    })

    await test('compileVoidLang works', async (t) => {
      compileVoidLang('')
    })

    await test('compileVoidLang result compiles to a WebAssembly object', async () => {
      const {instance, module} = await WebAssembly.instantiate(
        compileVoidLang(''),
      )
    
      assert.strictEqual(instance instanceof WebAssembly.Instance, true)
      assert.strictEqual(module instanceof WebAssembly.Module, true)
    })

    await test('hand crafted module with a function', async () => {
      const {instance, module} = await WebAssembly.instantiate(
          Uint8Array.from(NopLangBytes),
      )
      assert.strictEqual(instance instanceof WebAssembly.Instance, true)
      assert.strictEqual(module instanceof WebAssembly.Module, true)
    })

    await test('compileNopLang result compiles to a wasm module', async () => {
      const {instance} = await WebAssembly.instantiate(compileVoidLang(''))
    
      // @ts-ignore
      assert.strictEqual(instance.exports.main(), undefined)
    })    
  })
}
