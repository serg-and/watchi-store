import { useEffect, useRef, useState } from 'react'

const et = new EventTarget()

export function createStore<T>(initialValue: T, name: string) {
  const store = initialValue
  const eventType = `${name.toUpperCase()}_WATCHI_UPDATE`
  const event = new Event(eventType)

  function addWatch(callback: () => unknown) {
    et.addEventListener(eventType, callback)
    return () => et.removeEventListener(eventType, callback)
  }

  function triggerWatch() {
    et.dispatchEvent(event)
  }

  function useWatch<SelectRes>(select: (store: T) => SelectRes) {
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

  return { store, addWatch, triggerWatch, useWatch }
}
