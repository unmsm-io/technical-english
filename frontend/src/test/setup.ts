import { afterEach } from "bun:test"
import { cleanup } from "@testing-library/react"
import { Window } from "happy-dom"

const windowInstance = new Window({
  url: "http://localhost/vocabulary",
})

Object.assign(globalThis, {
  DocumentFragment: windowInstance.DocumentFragment,
  window: windowInstance,
  document: windowInstance.document,
  navigator: windowInstance.navigator,
  Node: windowInstance.Node,
  Element: windowInstance.Element,
  HTMLElement: windowInstance.HTMLElement,
  HTMLInputElement: windowInstance.HTMLInputElement,
  HTMLButtonElement: windowInstance.HTMLButtonElement,
  MutationObserver: windowInstance.MutationObserver,
  Event: windowInstance.Event,
  CustomEvent: windowInstance.CustomEvent,
  MouseEvent: windowInstance.MouseEvent,
  getComputedStyle: windowInstance.getComputedStyle.bind(windowInstance),
  TypeError,
  SyntaxError,
})

Object.assign(windowInstance, {
  CustomEvent: windowInstance.CustomEvent,
  TypeError,
  SyntaxError,
})

afterEach(() => {
  cleanup()
})
