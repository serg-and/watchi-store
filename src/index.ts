import onChange from 'on-change'
import { useEffect, useRef, useState } from 'react'

const et = new EventTarget()
const storeNames: string[] = []

export default class Store<Store extends {}> {
  eventType: string
  event: Event
  store: Store

  /**
   * Initialize a Watchi store
   * @param initialValue initial store stote
   * @param name name of store (must be unique)
   * @returns created store
   */
  constructor(initialValue: Store, name: string) {
    if (storeNames.includes(name.toUpperCase())) throw `Store "${name}" already exists`

    this.eventType = `${name.toUpperCase()}_WATCHI_UPDATE`
    this.event = new Event(this.eventType)

    this.store = onChange(initialValue, () => this.trigger())
    storeNames.push(name.toUpperCase())
  }

  /**
   * Trigger changes in the store, triggers all watches
   */
  trigger() {
    et.dispatchEvent(this.event)
  }

  /**
   * Add a listener to changes in the store
   */
  watch(callback: () => unknown) {
    et.addEventListener(this.eventType, callback)
    return () => et.removeEventListener(this.eventType, callback)
  }

  /**
   * Perform a revertable action on the store,
   * the callback provides a revertable instance of the store,
   * changes made to the store itself will not be seen and thus not be reverted
   */
  revertable(action: (store: Store, revert: () => void) => unknown) {
    return revertableObject(this.store, action)
  }

  /**
   * Perform a transaction on the store, changes to the store will only be applied when the transactions finishes successfully,
   * Changes made in a failed transaction will be reverted.
   * Use the store instance provided in the action callback!, changes will otherwise not be applied
   */
  transaction(action: (store: Store) => unknown) {
    const uncommitableStore = onChange.target(this.store)

    revertableObject(uncommitableStore, (transactionStore, revert) => {
      try {
        action(transactionStore)
        this.trigger()
      } catch (err) {
        revert()
        throw err
      }
    })
  }

  /**
   * Perform a revertable action on the store, actions are reverted when an error is caught
   * @param action action which can be reverted
   * @param onError return a boolean indicate whether to revert or not
   */
  revertOnError(action: () => unknown, onError?: (error: unknown) => boolean | void) {
    const before = structuredClone(this.store)
    try {
      action()
    } catch (err) {
      if ((onError ? onError(err) : true) === true) Object.assign(this.store, before)
      if (!onError) throw err
    }
  }

  /**
   * Watch for values in the store, rerenders when watch is triggered and value changed,
   * optionally provide a function that determines wether to update the state
   * or simply pass `true` to always update even if the value didn't change
   */
  useWatch<SelectRes>(
    select: (store: Store) => SelectRes,
    update: (a: SelectRes, b: SelectRes) => boolean | boolean = (a, b) => !Object.is(a, b)
  ): SelectRes {
    const [state, setState] = useState<SelectRes>(select(this.store))
    const stateRef = useRef(state)

    useEffect(() => {
      const removeWatch = this.watch(() => {
        const selectRes = select(this.store)

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
  useRefWatch<SelectRes>(select: (store: Store) => SelectRes) {
    const ref = useRef<SelectRes>(select(this.store))

    useEffect(() => {
      const removeWatch = this.watch(() => {
        const selectRes = select(this.store)
        if (!Object.is(selectRes, ref.current)) ref.current = selectRes
      })

      return removeWatch
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return ref
  }
}

function setFromPath(object: any, path: (string | symbol)[], value: unknown) {
  const last = path.at(-1)
  if (last === null || last === undefined) return

  for (let i = 0; i < path.length - 1; i++) object = object[path[i]]

  object[last] = value
}

function revertableObject<T extends {}>(object: T, action: (store: T, revert: () => void) => unknown) {
  // path, previousValue
  const changes: [(string | symbol)[], unknown][] = []

  const watched = onChange(
    object,
    (path, _value, previousValue) => {
      changes.push([path, previousValue])
    },
    { pathAsArray: true }
  )

  function revert() {
    for (const [path, value] of changes.reverse()) {
      setFromPath(object, path, value)
    }
  }

  action(watched, revert)
}
