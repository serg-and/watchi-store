import * as react from 'react';

declare class Store<Store extends {}> {
    eventType: string;
    event: Event;
    store: Store;
    /**
     * Initialize a Watchi store
     * @param initialValue initial store stote
     * @param name name of store (must be unique)
     * @returns created store
     */
    constructor(initialValue: Store, name: string);
    /**
     * Set a new root value for the store
     */
    set(value: Store): Store;
    /**
     * Trigger changes in the store, triggers all watches
     */
    trigger(): void;
    /**
     * Add a listener to changes in the store
     */
    watch(callback: () => unknown): () => void;
    /**
     * Perform a revertable action on the store,
     * the callback provides a revertable instance of the store,
     * changes made to the store itself will not be seen and thus not be reverted
     */
    revertable(action: (store: Store, revert: () => void) => unknown): void;
    /**
     * Perform a transaction on the store, changes to the store will only be applied when the transactions finishes successfully,
     * Changes made in a failed transaction will be reverted.
     * Use the store instance provided in the action callback!, changes will otherwise not be applied
     */
    transaction(action: (store: Store) => unknown): Promise<void>;
    /**
     * Perform a revertable action on the store, actions are reverted when an error is caught
     * @param action action which can be reverted
     * @param onError return a boolean indicate whether to revert or not
     *
     * @warning reverts to the previous state of the store, this includes changes made to the store outside of this action
     */
    revertOnError(action: () => unknown, onError?: (error: unknown) => boolean | void): Promise<void>;
    /**
     * Watch for values in the store, rerenders when watch is triggered and value changed,
     * optionally provide a function that determines wether to update the state
     * or simply pass `true` to always update even if the value didn't change
     */
    useWatch<SelectRes>(select: (store: Store) => SelectRes, update?: (a: SelectRes, b: SelectRes) => boolean | boolean): SelectRes;
    /**
     * Watch for values in the store using ref, does not rerender on change
     */
    useRefWatch<SelectRes>(select: (store: Store) => SelectRes): react.MutableRefObject<SelectRes>;
}

export { Store as default };
