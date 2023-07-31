"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => Store
});
module.exports = __toCommonJS(src_exports);
var import_on_change = __toESM(require("on-change"), 1);
var import_react = require("react");
var et = new EventTarget();
var storeNames = [];
var Store = class {
  /**
   * Initialize a Watchi store
   * @param initialValue initial store stote
   * @param name name of store (must be unique)
   * @returns created store
   */
  constructor(initialValue, name) {
    if (storeNames.includes(name.toUpperCase()))
      throw `Store "${name}" already exists`;
    this.eventType = `${name.toUpperCase()}_WATCHI_UPDATE`;
    this.event = new Event(this.eventType);
    this.store = (0, import_on_change.default)(initialValue, () => this.trigger());
    storeNames.push(name.toUpperCase());
  }
  /**
   * Trigger changes in the store, triggers all watches
   */
  trigger() {
    et.dispatchEvent(this.event);
  }
  /**
   * Add a listener to changes in the store
   */
  watch(callback) {
    et.addEventListener(this.eventType, callback);
    return () => et.removeEventListener(this.eventType, callback);
  }
  /**
   * Perform a revertable action on the store,
   * the callback provides a revertable instance of the store,
   * changes made to the store itself will not be seen and thus not be reverted
   */
  revertable(action) {
    return revertableObject(this.store, action);
  }
  /**
   * Perform a transaction on the store, changes to the store will only be applied when the transactions finishes successfully,
   * Changes made in a failed transaction will be reverted.
   * Use the store instance provided in the action callback!, changes will otherwise not be applied
   */
  transaction(action) {
    const uncommitableStore = import_on_change.default.target(this.store);
    revertableObject(uncommitableStore, (transactionStore, revert) => {
      try {
        action(transactionStore);
        this.trigger();
      } catch (err) {
        revert();
        throw err;
      }
    });
  }
  /**
   * Perform a revertable action on the store, actions are reverted when an error is caught
   * @param action action which can be reverted
   * @param onError return a boolean indicate whether to revert or not
   */
  revertOnError(action, onError) {
    const before = structuredClone(this.store);
    try {
      action();
    } catch (err) {
      if ((onError ? onError(err) : true) === true)
        Object.assign(this.store, before);
      if (!onError)
        throw err;
    }
  }
  /**
   * Watch for values in the store, rerenders when watch is triggered and value changed,
   * optionally provide a function that determines wether to update the state
   * or simply pass `true` to always update even if the value didn't change
   */
  useWatch(select, update = (a, b) => !Object.is(a, b)) {
    const [state, setState] = (0, import_react.useState)(select(this.store));
    const stateRef = (0, import_react.useRef)(state);
    (0, import_react.useEffect)(() => {
      const removeWatch = this.watch(() => {
        const selectRes = select(this.store);
        if (typeof update === "boolean" ? update : update(selectRes, stateRef.current)) {
          setState(selectRes);
          stateRef.current = selectRes;
        }
      });
      return removeWatch;
    }, []);
    return state;
  }
  /**
   * Watch for values in the store using ref, does not rerender on change
   */
  useRefWatch(select) {
    const ref = (0, import_react.useRef)(select(this.store));
    (0, import_react.useEffect)(() => {
      const removeWatch = this.watch(() => {
        const selectRes = select(this.store);
        if (!Object.is(selectRes, ref.current))
          ref.current = selectRes;
      });
      return removeWatch;
    }, []);
    return ref;
  }
};
function setFromPath(object, path, value) {
  const last = path.at(-1);
  if (last === null || last === void 0)
    return;
  for (let i = 0; i < path.length - 1; i++)
    object = object[path[i]];
  object[last] = value;
}
function revertableObject(object, action) {
  const changes = [];
  const watched = (0, import_on_change.default)(
    object,
    (path, _value, previousValue) => {
      changes.push([path, previousValue]);
    },
    { pathAsArray: true }
  );
  function revert() {
    for (const [path, value] of changes.reverse()) {
      setFromPath(object, path, value);
    }
  }
  action(watched, revert);
}
