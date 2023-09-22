import onChange, { ApplyData } from 'on-change'
import { useEffect, useRef, useState } from 'react'

type OnError = (error: unknown) => boolean | void
type StoreOptions = { defaultOnError?: (error: unknown) => void }
type Changes = [string[], unknown][]

const et = new EventTarget()
let idTracker = 0

export default class Store<Store extends {}> {
  id: number
  eventType: string
  event: Event
  store: Store
  options: StoreOptions
  onChangeListeners: ((path: string[], value: unknown, previousValue: unknown, applyData: ApplyData) => void)[] = []

  /**
   * Initialize a Watchi store
   * @param initialValue initial store state
   * @param options additional options for the store
   * @returns created store
   */
  constructor(initialValue: Store, options: StoreOptions = {}) {
    this.options = options

    this.id = idTracker++
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
  public set(value: Store, trigger = true) {
    if (this.store) onChange.unsubscribe(this.store)

    this.store = onChange(
      value,
      (...args) => {
        for (const listener of this.onChangeListeners) listener(...args)
        this.trigger()
      },
      { pathAsArray: true, ignoreSymbols: true, ignoreDetached: true }
    )

    if (trigger) this.trigger()

    return this.store
  }

  /**
   * Trigger changes in the store, triggers all watches
   */
  public trigger() {
    et.dispatchEvent(this.event)
  }

  /**
   * Add a listener to changes in the store
   */
  public watch(callback: () => unknown) {
    et.addEventListener(this.eventType, callback)
    return () => et.removeEventListener(this.eventType, callback)
  }

  private async withGlobalChanges(changes: Changes, action: () => unknown) {
    const listener = (path: string[], _value: unknown, previousValue: unknown) => changes.push([path, previousValue])
    this.onChangeListeners.push(listener)

    try {
      await action()
    } finally {
      const i = this.onChangeListeners.indexOf(listener)
      if (i !== -1) this.onChangeListeners.splice(i, 1)
    }
  }

  // revert changes on store withou triggering listeners, trigger when finished
  private revertStoreChanges(changes: Changes) {
    revertChanges(onChange.target(this.store), changes)
    this.trigger()
  }

  /**
   * Perform a revertable action on the store,
   * the callback provides a revertable instance of the store,
   * changes made to the store itself will not be seen and thus not be reverted
   */
  public revertable(action: (store: Store, revert: () => void) => unknown) {
    return revertableObject(this.store, action)
  }

  /**
   * Perform a revertable action on the store,
   * any changes made during the action can be reverted, including changes outside of the action
   */
  public async revertableGlobal(action: (revert: () => void) => unknown) {
    const changes: Changes = []
    // this.withGlobalChanges(changes, () => action(() => revertChanges(this.store, changes)))
    await this.withGlobalChanges(changes, () => action(() => this.revertStoreChanges(changes)))
  }

  /**
   * Perform a transaction on the store, changes to the store will only be applied when the transactions finishes successfully,
   * Changes made in a failed transaction will be reverted.
   * Use the store instance provided in the action callback!, changes will otherwise not be applied
   */
  public async transaction(action: (store: Store) => unknown) {
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
   * Perform an action on the store that is reverted when an error is caught
   * @param action action with store instance for action
   * @param onError return a boolean indicate whether to revert or not
   *
   * @warning reverts any changes made in the action
   */
  public revertOnError(action: (store: Store) => unknown, onError?: OnError) {
    this.revertable(async (store, revert) => {
      try {
        await action(store)
      } catch (error) {
        // revert state if required
        if ((onError ? onError(error) : true) === true) revert()

        if (!onError) {
          if (this.options.defaultOnError) this.options.defaultOnError(error)
          // throw error if not caught by `onError` option
          else throw error
        }
      }
    })
  }

  /**
   * Perform a revertable action on the store, actions are reverted when an error is caught
   * @param action action
   * @param onError return a boolean indicate whether to revert or not
   *
   * @warning reverts to the previous state of the store, this includes changes made to the store outside of this action
   */
  public async revertOnErrorGlobal(action: () => unknown, onError?: OnError) {
    await this.revertableGlobal(async revert => {
      try {
        await action()
      } catch (error) {
        // revert state if required
        if ((onError ? onError(error) : true) === true) revert()

        if (!onError) {
          if (this.options.defaultOnError) this.options.defaultOnError(error)
          // throw error if not caught by `onError` option
          else throw error
        }
      }
    })
  }

  /**
   * Watch for values in the store, rerenders when watch is triggered and value changed,
   * optionally provide a function that determines wether to update the state
   * or simply pass `true` to always update even if the value didn't change
   */
  public useWatch<SelectRes>(
    select: (store: Store) => SelectRes,
    update: ((a: SelectRes, b: SelectRes) => boolean) | boolean = (a, b) => !Object.is(a, b)
  ): SelectRes {
    const [state, setState] = useState<SelectRes>(select(this.store))
    const stateRef = useRef(state)
    
    // store passed functions by reference so changes are visible in the created callback
    const selectRef = useRef(select)
    const updateRef = useRef(update)
    selectRef.current = select
    updateRef.current = update

    useEffect(() => {
      const removeWatch = this.watch(() => {
        let selectRes = selectRef.current(this.store)

        if (typeof updateRef.current === 'boolean' ? updateRef.current : updateRef.current(selectRes, stateRef.current)) {
          // clone object if update is forced to true and select has the same reference as current state
          if (selectRes === stateRef.current && typeof selectRes === 'object') {
            // @ts-expect-error type is known
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
  public useRefWatch<SelectRes>(select: (store: Store) => SelectRes) {
    const ref = useRef<SelectRes>(select(this.store))
    const selectRef = useRef(select)
    selectRef.current = select

    useEffect(() => {
      const removeWatch = this.watch(() => {
        const selectRes = selectRef.current(this.store)
        if (!Object.is(selectRes, ref.current)) ref.current = selectRes
      })

      return removeWatch
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return ref
  }

  /**
	@param object - Object that is already being watched for changes.
	@returns The original unwatched object.
	*/
  public target<T extends {}>(object: T): T {
    return onChange.target(object)
  }
}

function setFromPath(object: any, path: string[], value: unknown) {
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

// reverts changes in reverse and empties changes array
function revertChanges<T extends {}>(object: T, changes: Changes) {
  while (changes.length) {
    const el = changes.pop()
    if (el) setFromPath(object, el[0], el[1])
  }
}

function revertableObject<T extends {}>(object: T, action: (store: T, revert: () => void) => unknown) {
  // path, previousValue
  const changes: Changes = []

  const watched = onChange(
    object,
    (path, _value, previousValue) => {
      changes.push([path, previousValue])
    },
    { pathAsArray: true, ignoreSymbols: true }
  )

  try {
    action(watched, () => revertChanges(object, changes))
  } finally {
    onChange.unsubscribe(watched)
  }
}
