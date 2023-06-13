import { createContext } from 'react'
import { configure } from 'mobx'
import Interface from './interface'
import Ceremony from './Ceremony'
import Queue from './Ceremony'

interface State {
  ui: Interface;
  ceremony: Queue;
}

configure({
  enforceActions: 'never',
})

export const buildState = (): State => {
  const state: State = { ui: new Interface(), ceremony: new Queue()};

  //const ui = new Interface()
  const ceremony: Queue = new Ceremony(state) as any

  Object.assign(state, {
    ceremony,
  })
  return state
}

export default createContext(buildState())
