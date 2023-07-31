import { Ref, useEffect, useRef, useState } from 'react'

const globalStore: {[key: string]: {}} = {}
const et = new EventTarget()

/**
 * Create a watchi store
 * @param initialValue initial store value
 * @param name name of store
 * @returns created store
 */
export function createStore<T extends object>(initialValue: T, name: string) {
  if (name in globalStore) throw `Store "${name}" already exists`

  const store = initialValue
  globalStore[name] = store
  const eventType = `${name.toUpperCase()}_WATCHI_UPDATE`
  const event = new Event(eventType)

  /**
   * Add a listener to changes in the store
   */
  function addWatch(callback: () => unknown) {
    et.addEventListener(eventType, callback)
    return () => et.removeEventListener(eventType, callback)
  }

  /**
   * Trigger changes in the store, triggers all watches
   */
  function triggerWatch() {
    et.dispatchEvent(event)
  }

  /**
   * Watch for values in the store, rerenders when watch is triggered and value changed
   */
  function useWatch<SelectRes>(select: (store: T) => SelectRes): SelectRes {
    const [state, setState] = useState<SelectRes>(select(store))
    const stateRef = useRef(state)

    useEffect(() => {
      const removeWatch = addWatch(() => {
        const selectRes = select(store)

        if (!Object.is(selectRes, stateRef.current)) {
          setState(selectRes)
          stateRef.current = selectRes
        }
      })

      return removeWatch
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return state
  }

  /**
   * Watch for values in the store using ref, does not rerender on change
   */
  function useRefWatch<SelectRes>(select: (store: T) => SelectRes) {
    const ref = useRef<SelectRes>(select(store))

    useEffect(() => {
      const removeWatch = addWatch(() => {
        const selectRes = select(store)
        if (!Object.is(selectRes, ref.current)) ref.current = selectRes
      })

      return removeWatch
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return ref
  }

  /**
   * Perform a revertable action on the store, actions are reverted when an error is caught
   * @param action action which can be reverted
   * @param onError return a boolean indicate whether to revert or not
   */
  function revertOnError(action: () => unknown, onError?: (error: unknown) => boolean | void) {
    const before = structuredClone(store)
    try {
      action()
    } catch(error) {
      if ((onError ? onError(error) : true) === true) {
        Object.assign(store, before)
      }
    }
  }

  return { store, addWatch, triggerWatch, useWatch, useRefWatch, revertOnError }
}
