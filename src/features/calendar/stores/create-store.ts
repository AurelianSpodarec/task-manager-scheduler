import { useSyncExternalStore } from 'react'

/**
 * Minimal external store factory — shared by all calendar sub-stores.
 * Keeps the same useSyncExternalStore contract without repeating the
 * listeners / emit / subscribe / useSelector plumbing in every file.
 */
export function createStore<T extends object>(initialState: T) {
  let state: T = initialState
  const listeners = new Set<() => void>()

  function emit() {
    listeners.forEach((l) => l())
  }

  function getState(): T {
    return state
  }

  function setState(partial: Partial<T>) {
    state = { ...state, ...partial }
    emit()
  }

  function subscribe(listener: () => void) {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  }

  function useSelector<R>(selector: (s: T) => R): R {
    return useSyncExternalStore(
      subscribe,
      () => selector(state),
      () => selector(state),
    )
  }

  return { getState, setState, subscribe, useSelector } as const
}
