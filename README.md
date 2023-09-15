Watchi-store is a simple typescript compatible state management library for React, focused on controllability and performance.

## Features
* Tiny package (1.9kB minified)
* Highly controllable
* Easily create multiple stores
* Update store from anywhere, no dispatches, no reducers, just change values
* Automatically update your UI, simply watch for values in the store
* Use the props pattern with values from the store

It's inspired by libraries like `Redux`, `Zustand` and `MobX`. The main difference between these libraries and Watchi-store is that this library does not enforce immutability in the store, changes anywhere in the store will cause watchers (listeners) and corresponding UI to be automatically updated. This can be useful when working with a large amount of deeply nested state that you want to control outside of the individual UI components, for example from actions.

This library will most likely not offer any benefits if you are not working with large amounts of nested states or need improved state performance.

# Usage
Create a store
```typescript
import Store from 'watchi-store'

type MyStore = { a: { [key: string]: { name: string; n: number } } }
const myStore = new Store<MyStore>({
  a: {
    b1: {
      name: 'my name'
      n: 0,
    }, 
    b2: {
      name: 'my name'
      n: 1,
    }
  }
})
```

Watch store values
```tsx
function MyComponent() {
  const b2n = myStore.useWatch(store => store.a.b2.n)

  return <div onClick={() => myStore.store.a.b2.n++}>b2n: {b2n}</div>
}
```

Watch store values based on props (don't search through store)
```tsx
function A(){
  const a = useWatch(store => store.a)

  return <>
    <B b={a.b1} />
    <B b={a.b2} />
  </>
}

function B(props: { b: { n: number }, increment: () => void }) {
  // watch value from props, same reference as from store
  const n = useWatch(() => props.b.n)
  
  return <button onClick={() => props.b.n++}>{props.b.name}: {n}</button>
}
```

Update the store from anywhere
```tsx
const time = new Store({ passed: 0 })
setTimeout(() => time.store.passed++, 1000)

function Passed() {
    const passed = time.useWatch(store => store.passed)

    return <div>{passed} has passed</div>
}
```

## Additional utilities
`useRefWatch()`: Watch store without rerendering UI on changes<br>
`watch()`: Call callback whenever the store updates<br>
`revertable()`: Perform a revertable action on the store<br>
`revertableGlobal()`: Like `revertable` but any changes made during the action will can be reverted, including changes outside of the action<br>
`transaction()`: Perform a transaction on the store, changes to the store will only be applied when the transactions finishes successfully<br>
`revertOnError()`: Perform a revertable action on the store, actions are reverted when an error is caught<br>
`revertOnErrorGlobal()`: Like `revertOnError` but reverts all changes made during the action, including changes outside of the action<br>
