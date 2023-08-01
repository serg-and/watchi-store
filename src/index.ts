import onChange from 'on-change'
import { useEffect, useRef, useState } from 'react'

type OnError = (error: unknown) => boolean | void
type StoreOptions = { defaultOnError?: OnError }

const et = new EventTarget()
const storeNames: string[] = []
let idTracker = 0

export default class Store<Store extends {}> {
  id: number
  eventType: string
  event: Event
  store: Store
  options: StoreOptions
  /**
   * Initialize a Watchi store
   * @param initialValue initial store store
   * @param options additional options for the store
   * @returns created store
   */
  constructor(initialValue: Store, options: StoreOptions = {}) {
    this.options = options
    this.id = idTracker
    idTracker++

    this.eventType = `STORE_${this.id}_WATCHI_UPDATE`
    this.event = new Event(this.eventType)

    this.store = this.set(initialValue)

    this.useWatch = this.useWatch.bind(this)
    this.useRefWatch = this.useRefWatch.bind(this)
  }

  /**
   * Set a new root value for the store
   * 
   * @param value new root value
   * @param trigger whether or not to call trigger for store update
   * @returns new root of store
   */
  set(value: Store, trigger = true) {
    if (this.store) onChange.unsubscribe(this.store)
    this.store = onChange(value, () => this.trigger())
    if (trigger) this.trigger()

    return this.store
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
  async transaction(action: (store: Store) => unknown) {
    const uncommitableStore = onChange.target(this.store)

    revertableObject(uncommitableStore, async (transactionStore, revert) => {
      try {
        await action(transactionStore)
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
   *
   * @warning reverts to the previous state of the store, this includes changes made to the store outside of this action
   */
  async revertOnError(action: () => unknown, onError?: OnError) {
    const before = structuredClone(onChange.target(this.store))
    
    try {
      await action()
    } catch (err) {
      // revertt state if required
      if ((onError ? onError(err) : true) === true) this.set(before, true)
      
      if (!onError) {
        if (this.options.defaultOnError) this.options.defaultOnError(err)
        // throw error if not caught by `onError` option
        else throw err
      }
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
        let selectRes = select(this.store)

        if (typeof update === 'boolean' ? update : update(selectRes, stateRef.current)) {
          // clone object if update is forced to true and select has the same reference as current state
          if (selectRes === stateRef.current && typeof selectRes === 'object') {
            // @ts-expect-error
            if (Array.isArray(selectRes)) selectRes = selectRes.slice(0)
            else selectRes = Object.assign({}, selectRes)
          }
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
  if (last === null) return
  if (last === undefined) {
    // array methods on the root of the store do not have a path
    // we cannot reassign to object itself when changes are made to the root object
    // so add changes back to object
    if (Array.isArray(object) && Array.isArray(value)) {
      object.splice(0, object.length)
      for (const el of value) object.push(el)
    }

    return
  }

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
    console.log({ changes })
    for (const [path, value] of changes.reverse()) {
      setFromPath(object, path, value)
    }
  }

  action(watched, revert)
}
