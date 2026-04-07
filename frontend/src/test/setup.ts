import { afterEach } from "bun:test"
import { cleanup } from "@testing-library/react"
import { Window } from "happy-dom"

const windowInstance = new Window({
  url: "http://localhost/vocabulary",
})

Object.assign(globalThis, {
  window: windowInstance,
  document: windowInstance.document,
  navigator: windowInstance.navigator,
  HTMLElement: windowInstance.HTMLElement,
  HTMLInputElement: windowInstance.HTMLInputElement,
  HTMLButtonElement: windowInstance.HTMLButtonElement,
  Event: windowInstance.Event,
  MouseEvent: windowInstance.MouseEvent,
  SyntaxError,
})

Object.assign(windowInstance, {
  SyntaxError,
})

afterEach(() => {
  cleanup()
})
