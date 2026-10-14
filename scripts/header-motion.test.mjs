import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import vm from "node:vm"
import test from "node:test"

function fixture(banner = "0px") {
  const source = readFileSync(new URL("../node_modules/vocs/dist/react/useTopGutterOffset.js", import.meta.url), "utf8")
    .replace("import * as React from 'react';", "")
    .replaceAll("export function", "function")
  const events = new Map()
  const frames = []
  const properties = new Map()
  const window = { innerWidth: 390, scrollY: 0, addEventListener: (name, handler) => events.set(name, handler) }
  const context = vm.createContext({
    React: { useCallback: (callback) => callback }, window,
    document: { documentElement: { style: { setProperty: (name, value) => properties.set(name, value) } } },
    getComputedStyle: () => ({ getPropertyValue: () => banner }),
    requestAnimationFrame: (callback) => frames.push(callback),
  })
  vm.runInContext(`${source}\nthis.bind = useTopGutterRef();`, context)
  const navigation = { style: {} }
  const dispose = context.bind(navigation)
  const tick = () => {
    const callback = frames.shift()
    assert.ok(callback, "animation frame exists")
    callback()
    const offset = Number.parseFloat(properties.get("--assign-header-offset"))
    assert.equal(navigation.style.transform, `translate3d(0, -${offset}px, 0)`, "outline offset and navigation update together")
    assert.ok(offset >= 0 && offset <= 48)
    return offset
  }
  const settle = () => { let count = 0; while (frames.length) { tick(); assert.ok(++count < 30) } }
  return { window, events, frames, properties, navigation, dispose, tick, settle }
}

test("disappearing header and outline share every frame during exit and return", () => {
  const f = fixture()
  f.window.scrollY = 100
  f.events.get("scroll")()
  assert.equal(f.tick(), 24)
  assert.equal(f.navigation.style.opacity, "0.5", "original fade is preserved")
  f.settle()
  assert.equal(f.properties.get("--assign-header-offset"), "48px")
  assert.equal(f.navigation.style.visibility, "hidden")
  f.window.scrollY = 0
  f.events.get("scroll")()
  assert.equal(f.tick(), 24)
  f.settle()
  assert.equal(f.properties.get("--assign-header-offset"), "0px")
  assert.equal(f.navigation.style.opacity, "1")
  assert.equal(f.navigation.style.visibility, "visible")
  f.dispose()
})

test("widening resets a hidden header without another scroll, including a pending frame", () => {
  for (const pending of [false, true]) {
    const f = fixture()
    f.window.scrollY = 100
    f.events.get("scroll")()
    if (!pending) f.settle()
    f.window.innerWidth = 1024
    f.events.get("resize")()
    assert.equal(f.properties.get("--assign-header-offset"), "0px")
    assert.equal(f.navigation.style.visibility, "visible")
    f.settle()
    assert.equal(f.properties.get("--assign-header-offset"), "0px")
    f.dispose()
  }
})

test("banner and desktop preserve the original visible navigation policy", () => {
  for (const banner of ["0px", "32px"]) {
    const f = fixture(banner)
    if (banner === "0px") f.window.innerWidth = 1440
    f.window.scrollY = 100
    f.events.get("scroll")()
    assert.equal(f.frames.length, 0)
    assert.equal(f.navigation.style.opacity, "1")
    f.dispose()
  }
})
