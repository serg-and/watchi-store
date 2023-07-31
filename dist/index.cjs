"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _onchange = require('on-change'); var _onchange2 = _interopRequireDefault(_onchange);var _react = require('react');var u=new EventTarget,f=[],a= exports.default =class{constructor(e,t){if(f.includes(t.toUpperCase()))throw`Store "${t}" already exists`;this.eventType=`${t.toUpperCase()}_WATCHI_UPDATE`,this.event=new Event(this.eventType),this.store=this.set(e),f.push(t.toUpperCase())}set(e){return this.store&&_onchange2.default.unsubscribe(this.store),this.store=_onchange2.default.call(void 0, e,()=>this.trigger()),this.store}trigger(){u.dispatchEvent(this.event)}watch(e){return u.addEventListener(this.eventType,e),()=>u.removeEventListener(this.eventType,e)}revertable(e){return S(this.store,e)}transaction(e){let t=_onchange2.default.target(this.store);S(t,(s,r)=>{try{e(s),this.trigger()}catch(n){throw r(),n}})}revertOnError(e,t){let s=structuredClone(this.store);try{e()}catch(r){if((t?t(r):!0)===!0&&this.set(s),!t)throw r}}useWatch(e,t=(s,r)=>!Object.is(s,r)){let[s,r]=_react.useState.call(void 0, e(this.store)),n=_react.useRef.call(void 0, s);return _react.useEffect.call(void 0, ()=>this.watch(()=>{let i=e(this.store);(typeof t=="boolean"?t:t(i,n.current))&&(r(i),n.current=i)}),[]),s}useRefWatch(e){let t=_react.useRef.call(void 0, e(this.store));return _react.useEffect.call(void 0, ()=>this.watch(()=>{let r=e(this.store);Object.is(r,t.current)||(t.current=r)}),[]),t}};function g(o,e,t){let s=e.at(-1);if(s!=null){for(let r=0;r<e.length-1;r++)o=o[e[r]];o[s]=t}}function S(o,e){let t=[],s=_onchange2.default.call(void 0, o,(n,h,i)=>{t.push([n,i])},{pathAsArray:!0});function r(){for(let[n,h]of t.reverse())g(o,n,h)}e(s,r)}exports.default = a;
