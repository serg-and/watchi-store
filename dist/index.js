var u=(o,e,t)=>new Promise((s,r)=>{var i=c=>{try{n(t.next(c))}catch(f){r(f)}},h=c=>{try{n(t.throw(c))}catch(f){r(f)}},n=c=>c.done?s(c.value):Promise.resolve(c.value).then(i,h);n((t=t.apply(o,e)).next())});import a from"on-change";import{useEffect as y,useRef as S,useState as g}from"react";var l=new EventTarget;var p=0,v=class{constructor(e,t={}){this.options=t,this.id=p,p++,this.eventType=`STORE_${this.id}_WATCHI_UPDATE`,this.event=new Event(this.eventType),this.store=this.set(e),this.useWatch=this.useWatch.bind(this),this.useRefWatch=this.useRefWatch.bind(this)}set(e){return this.store&&a.unsubscribe(this.store),this.store=a(e,()=>this.trigger()),this.store}trigger(){l.dispatchEvent(this.event)}watch(e){return l.addEventListener(this.eventType,e),()=>l.removeEventListener(this.eventType,e)}revertable(e){return d(this.store,e)}transaction(e){return u(this,null,function*(){let t=a.target(this.store);d(t,(s,r)=>u(this,null,function*(){try{yield e(s),this.trigger()}catch(i){throw r(),i}}))})}revertOnError(e,t){return u(this,null,function*(){!t&&this.options.defaultOnError&&(t=this.options.defaultOnError);let s=structuredClone(a.target(this.store));try{yield e()}catch(r){if((t?t(r):!0)===!0&&this.set(s),!t)throw r}})}useWatch(e,t=(s,r)=>!Object.is(s,r)){let[s,r]=g(e(this.store)),i=S(s);return y(()=>this.watch(()=>{let n=e(this.store);(typeof t=="boolean"?t:t(n,i.current))&&(n===i.current&&typeof n=="object"&&(Array.isArray(n)?n=n.slice(0):n=Object.assign({},n)),r(n),i.current=n)}),[]),s}useRefWatch(e){let t=S(e(this.store));return y(()=>this.watch(()=>{let r=e(this.store);Object.is(r,t.current)||(t.current=r)}),[]),t}};function w(o,e,t){let s=e.at(-1);if(s!==null){if(s===void 0){if(Array.isArray(o)&&Array.isArray(t)){o.splice(0,o.length);for(let r of t)o.push(r)}return}for(let r=0;r<e.length-1;r++)o=o[e[r]];o[s]=t}}function d(o,e){let t=[],s=a(o,(i,h,n)=>{t.push([i,n])},{pathAsArray:!0});function r(){console.log({changes:t});for(let[i,h]of t.reverse())w(o,i,h)}e(s,r)}export{v as default};
