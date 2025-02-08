import { test } from 'node:test'
import assert from 'node:assert/strict'

import * as ohm from 'ohm-js'
import { extractExamples } from 'ohm-js/extras'
import { 
  NopLangGrammarDef,
  WaferGrammarDef,
  getMain,
  getWafer,
  getWaferSemantics,
} from './chapter02.js'

main()

async function main() {
  await test('chapter02', async (t) => {
    await test('ohm', async (t) => {
      await ohmTests()
    })
  })
}

/** @type { () => Promise<void> } */
async function ohmTests() {
  await test('NopLang', async (t) => {
    const grammar = ohm.grammar(NopLangGrammarDef)    
    const matchResult = grammar.match('')

    assert.strictEqual(matchResult.succeeded(), true)
    assert.strictEqual(grammar.match('3').succeeded(), false)
  })

  await test('Wafer', async (t) => {
    await waferTests()
  })
}

/** @type { () => Promise<void> } */
async function waferTests() {
  const wafer = getWafer()
  const semantics = getWaferSemantics(wafer)
  
  await test('extractExamples', async (t) => {
    for (const ex of extractExamples(WaferGrammarDef)) {
      const result = wafer.match(ex.example, ex.rule)
      assert.strictEqual(result.succeeded(), ex.shouldMatch, JSON.stringify(ex))
    }    
  })

  await test('jsValue', () => {
    /** @type { (input: string ) => any } */
    function getJsValue(input) {
      return semantics(wafer.match(input)).jsValue()
    }

    assert.equal(getJsValue('42'), 42)
    assert.equal(getJsValue('0'), 0)
    assert.equal(getJsValue('99'), 99)
  })  

  test('toWasm', async () => {
    assert.equal(getMain('42')(), 42)
    assert.equal(getMain('0')(), 0)
    assert.equal(getMain('31')(), 31)
  })
}

