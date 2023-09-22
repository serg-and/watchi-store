"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var u=(i,e,t)=>new Promise((n,r)=>{var s=c=>{try{h(t.next(c))}catch(o){r(o)}},a=c=>{try{h(t.throw(c))}catch(o){r(o)}},h=c=>c.done?n(c.value):Promise.resolve(c.value).then(s,a);h((t=t.apply(i,e)).next())});var _onchange = require('on-change'); var _onchange2 = _interopRequireDefault(_onchange);var _react = require('react');var f=new EventTarget,d=0,g= exports.default =class{constructor(e,t={}){this.onChangeListeners=[];this.options=t,this.id=d++,this.eventType=`STORE_${this.id}_WATCHI_UPDATE`,this.event=new Event(this.eventType),this.store=this.set(e),this.useWatch=this.useWatch.bind(this),this.useRefWatch=this.useRefWatch.bind(this)}set(e,t=!0){return this.store&&_onchange2.default.unsubscribe(this.store),this.store=_onchange2.default.call(void 0, e,(...n)=>{for(let r of this.onChangeListeners)r(...n);this.trigger()},{pathAsArray:!0,ignoreSymbols:!0,ignoreDetached:!0}),t&&this.trigger(),this.store}trigger(){f.dispatchEvent(this.event)}watch(e){return f.addEventListener(this.eventType,e),()=>f.removeEventListener(this.eventType,e)}withGlobalChanges(e,t){return u(this,null,function*(){let n=(r,s,a)=>e.push([r,a]);this.onChangeListeners.push(n);try{yield t()}finally{let r=this.onChangeListeners.indexOf(n);r!==-1&&this.onChangeListeners.splice(r,1)}})}revertStoreChanges(e){w(_onchange2.default.target(this.store),e),this.trigger()}revertable(e){return y(this.store,e)}revertableGlobal(e){return u(this,null,function*(){let t=[];yield this.withGlobalChanges(t,()=>e(()=>this.revertStoreChanges(t)))})}transaction(e){return u(this,null,function*(){let t=_onchange2.default.target(this.store);y(t,(n,r)=>u(this,null,function*(){try{yield e(n),this.trigger()}catch(s){throw r(),s}}))})}revertOnError(e,t){this.revertable((n,r)=>u(this,null,function*(){try{yield e(n)}catch(s){if((t?t(s):!0)===!0&&r(),!t)if(this.options.defaultOnError)this.options.defaultOnError(s);else throw s}}))}revertOnErrorGlobal(e,t){return u(this,null,function*(){yield this.revertableGlobal(n=>u(this,null,function*(){try{yield e()}catch(r){if((t?t(r):!0)===!0&&n(),!t)if(this.options.defaultOnError)this.options.defaultOnError(r);else throw r}}))})}useWatch(e,t=(n,r)=>!Object.is(n,r)){let[n,r]=_react.useState.call(void 0, e(this.store)),s=_react.useRef.call(void 0, n),a=_react.useRef.call(void 0, e),h=_react.useRef.call(void 0, t);return a.current=e,h.current=t,_react.useEffect.call(void 0, ()=>this.watch(()=>{let o=a.current(this.store);(typeof h.current=="boolean"?h.current:h.current(o,s.current))&&(o===s.current&&typeof o=="object"&&(Array.isArray(o)?o=o.slice(0):o=Object.assign({},o)),r(o),s.current=o)}),[]),n}useRefWatch(e){let t=_react.useRef.call(void 0, e(this.store)),n=_react.useRef.call(void 0, e);return n.current=e,_react.useEffect.call(void 0, ()=>this.watch(()=>{let s=n.current(this.store);Object.is(s,t.current)||(t.current=s)}),[]),t}target(e){return _onchange2.default.target(e)}};function S(i,e,t){let n=e.at(-1);if(n!==null){if(n===void 0){if(Array.isArray(i)&&Array.isArray(t)){i.splice(0,i.length);for(let r of t)i.push(r)}return}for(let r=0;r<e.length-1;r++)i=i[e[r]];i[n]=t}}function w(i,e){for(;e.length;){let t=e.pop();t&&S(i,t[0],t[1])}}function y(i,e){let t=[],n=_onchange2.default.call(void 0, i,(r,s,a)=>{t.push([r,a])},{pathAsArray:!0,ignoreSymbols:!0});try{e(n,()=>w(i,t))}finally{_onchange2.default.unsubscribe(n)}}exports.default = g;
