import { createContext } from 'react'
import { configure } from 'mobx'
import Interface from './interface'
import Ceremony from './Ceremony'
import { Queue } from '../types/ceremony'

interface State {
  ui: Interface | null;
  ceremony: Queue | null;
}

configure({
  enforceActions: 'never',
})

export const buildState = (): State => {
  const state: State = { ui: null, ceremony: null};

  const ui = new Interface()
  const ceremony: Queue = new Ceremony(state) as any

  Object.assign(state, {
    ui,
    ceremony,
  })
  return state
}

export default createContext(buildState())
