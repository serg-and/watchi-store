var u=(o,t,e)=>new Promise((s,r)=>{var i=c=>{try{n(e.next(c))}catch(f){r(f)}},h=c=>{try{n(e.throw(c))}catch(f){r(f)}},n=c=>c.done?s(c.value):Promise.resolve(c.value).then(i,h);n((e=e.apply(o,t)).next())});import a from"on-change";import{useEffect as y,useRef as g,useState as w}from"react";var l=new EventTarget,S=[],v=class{constructor(t,e){if(S.includes(e.toUpperCase()))throw`Store "${e}" already exists`;this.eventType=`${e.toUpperCase()}_WATCHI_UPDATE`,this.event=new Event(this.eventType),this.store=this.set(t),S.push(e.toUpperCase()),this.useWatch=this.useWatch.bind(this),this.useRefWatch=this.useRefWatch.bind(this)}set(t){return this.store&&a.unsubscribe(this.store),this.store=a(t,()=>this.trigger()),this.store}trigger(){l.dispatchEvent(this.event)}watch(t){return l.addEventListener(this.eventType,t),()=>l.removeEventListener(this.eventType,t)}revertable(t){return p(this.store,t)}transaction(t){return u(this,null,function*(){let e=a.target(this.store);p(e,(s,r)=>u(this,null,function*(){try{yield t(s),this.trigger()}catch(i){throw r(),i}}))})}revertOnError(t,e){return u(this,null,function*(){let s=structuredClone(a.target(this.store));try{yield t()}catch(r){if((e?e(r):!0)===!0&&this.set(s),!e)throw r}})}useWatch(t,e=(s,r)=>!Object.is(s,r)){let[s,r]=w(t(this.store)),i=g(s);return y(()=>this.watch(()=>{let n=t(this.store);(typeof e=="boolean"?e:e(n,i.current))&&(n===i.current&&typeof n=="object"&&(Array.isArray(n)?n=n.slice(0):n=Object.assign({},n)),r(n),i.current=n)}),[]),s}useRefWatch(t){let e=g(t(this.store));return y(()=>this.watch(()=>{let r=t(this.store);Object.is(r,e.current)||(e.current=r)}),[]),e}};function R(o,t,e){let s=t.at(-1);if(s!==null){if(s===void 0){if(Array.isArray(o)&&Array.isArray(e)){o.splice(0,o.length);for(let r of e)o.push(r)}return}for(let r=0;r<t.length-1;r++)o=o[t[r]];o[s]=e}}function p(o,t){let e=[],s=a(o,(i,h,n)=>{e.push([i,n])},{pathAsArray:!0});function r(){console.log({changes:e});for(let[i,h]of e.reverse())R(o,i,h)}t(s,r)}export{v as default};
