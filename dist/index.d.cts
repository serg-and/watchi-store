import * as react from 'react';
import { ApplyData } from 'on-change';

type OnError = (error: unknown) => boolean | void;
type StoreOptions = {
    defaultOnError?: (error: unknown) => void;
};
declare class Store<Store extends {}> {
    id: number;
    eventType: string;
    event: Event;
    store: Store;
    options: StoreOptions;
    onChangeListeners: ((path: string[], value: unknown, previousValue: unknown, applyData: ApplyData) => void)[];
    /**
     * Initialize a Watchi store
     * @param initialValue initial store state
     * @param options additional options for the store
     * @returns created store
     */
    constructor(initialValue: Store, options?: StoreOptions);
    /**
     * Set a new root value for the store
     *
     * @param value new root value
     * @param trigger whether or not to call trigger for store update
     * @returns new root of store
     */
    set(value: Store, trigger?: boolean): Store;
    /**
     * Trigger changes in the store, triggers all watches
     */
    trigger(): void;
    /**
     * Add a listener to changes in the store
     */
    watch(callback: () => unknown): () => void;
    private withGlobalChanges;
    private revertStoreChanges;
    /**
     * Perform a revertable action on the store,
     * the callback provides a revertable instance of the store,
     * changes made to the store itself will not be seen and thus not be reverted
     */
    revertable(action: (store: Store, revert: () => void) => unknown): void;
    /**
     * Perform a revertable action on the store,
     * any changes made during the action can be reverted, including changes outside of the action
     */
    revertableGlobal(action: (revert: () => void) => unknown): Promise<void>;
    /**
     * Perform a transaction on the store, changes to the store will only be applied when the transactions finishes successfully,
     * Changes made in a failed transaction will be reverted.
     * Use the store instance provided in the action callback!, changes will otherwise not be applied
     */
    transaction(action: (store: Store) => unknown): Promise<void>;
    /**
     * Perform an action on the store that is reverted when an error is caught
     * @param action action with store instance for action
     * @param onError return a boolean indicate whether to revert or not
     *
     * @warning reverts any changes made in the action
     */
    revertOnError(action: (store: Store) => unknown, onError?: OnError): void;
    /**
     * Perform a revertable action on the store, actions are reverted when an error is caught
     * @param action action
     * @param onError return a boolean indicate whether to revert or not
     *
     * @warning reverts to the previous state of the store, this includes changes made to the store outside of this action
     */
    revertOnErrorGlobal(action: () => unknown, onError?: OnError): Promise<void>;
    /**
     * Watch for values in the store, rerenders when watch is triggered and value changed,
     * optionally provide a function that determines wether to update the state
     * or simply pass `true` to always update even if the value didn't change
     */
    useWatch<SelectRes>(select: (store: Store) => SelectRes, update?: ((a: SelectRes, b: SelectRes) => boolean) | boolean): SelectRes;
    /**
     * Watch for values in the store using ref, does not rerender on change
     */
    useRefWatch<SelectRes>(select: (store: Store) => SelectRes): react.MutableRefObject<SelectRes>;
    /**
      @param object - Object that is already being watched for changes.
      @returns The original unwatched object.
      */
    target<T extends {}>(object: T): T;
}

export { Store as default };
