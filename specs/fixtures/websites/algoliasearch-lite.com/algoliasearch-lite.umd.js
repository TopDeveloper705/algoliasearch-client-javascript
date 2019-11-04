!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e=e||self).main=t()}(this,(function(){"use strict";function e(){let e={};return{get(t,r,s){const a=JSON.stringify(t);if(a in e)return Promise.resolve(e[a]);const n=r(),o=s&&s.miss||(()=>Promise.resolve());return n.then(e=>o(e)).then(()=>n)},set:(t,r)=>(e[JSON.stringify(t)]=r,Promise.resolve(r)),delete:t=>(delete e[JSON.stringify(t)],Promise.resolve()),clear:()=>(e={},Promise.resolve())}}const t={WithinQueryParameters:0,WithinHeaders:1},r={Debug:1,Info:2,Error:3};function s(e,t){return void 0!==t&&void 0!==t.methods&&t.methods.forEach(t=>{Object.assign(e,t(e))}),e}function a(e,...t){let r=0;return e.replace(/%s/g,()=>encodeURIComponent(t[r++]))}function n(e){return`${Object.keys(e).map(t=>a("%s=%s",t,e[t])).join("&")}`}function o(e,t,r){const s=(n=r,`${Object.keys(n).map(e=>a("%s=%s",e,n[e])).join("&")}`);var n;let o=`https://${e.url}/${t}`;return s.length&&(o+=`?${s}`),o}function i(e,t){const r=Array.isArray(e.data)?e.data:{...e.data,...t.data};return r.constructor===Object&&0===Object.entries(r).length?"":JSON.stringify(r)}const u=(e,t,r)=>(e=>{const t=e.status;return e.isTimedOut||(({isTimedOut:e,status:t})=>!e&&0==~~t)(e)||2!=~~(t/100)&&4!=~~(t/100)})(t)?(t.isTimedOut||e.setAsDown(),r.retry()):(({status:e})=>2==~~(e/100))(t)?r.success():r.fail();function c(e,t,r,s){let a=0;return Promise.all(t.map(t=>e.hostsCache.get({url:t.url},()=>Promise.resolve(t)).then(e=>{t.downDate=e.downDate,t.up=e.up}))).then(()=>{t=t.filter(e=>e.isUp()).reverse();const n=c=>{if(void 0===c)throw{name:"RetryError",message:"Unreachable hosts - your application id may be incorrect. If the error persists, contact support@algolia.com."};return e.requester.send({data:i(r,s),headers:{...e.headers,...s.headers},method:r.method,url:o(c,r.path,{...e.queryParameters,...s.queryParameters,"x-algolia-agent":e.userAgent.value}),timeout:(a+1)*(s.timeout?s.timeout:0)}).then(s=>u(c,s,{success:()=>(function({content:e}){return JSON.parse(e)})(s),retry:()=>(e.logger.debug("Retryable failure",{request:r,response:s,host:c,triesLeft:t.length,timeoutRetries:a}),s.isTimedOut&&a++,e.hostsCache.set({url:c.url},c).then(()=>n(t.pop()))),fail:()=>{throw function({content:e,status:t}){let r=e;try{r=JSON.parse(e).message}catch(e){}return function(e,t){return{name:"ApiError",message:e,status:t}}(r,t)}(s)}}))};return n(t.pop())})}function l(e,t){const r=void 0===e?{}:e,s={};return Object.keys(r).forEach(e=>{["timeout","headers","queryParameters","data","cacheable"].includes(e)||(s[e]=r[e])}),{data:s,timeout:void 0===r.timeout?t:r.timeout,headers:void 0===r.headers?{}:r.headers,queryParameters:void 0===r.queryParameters?{}:r.queryParameters,cacheable:r.cacheable}}const h={Read:1,Write:2,Any:3};function d(e){return{...e,headers:{},queryParameters:{},hosts:[],addUserAgent(t,r){this.userAgent=e.userAgent.with({segment:t,version:r})},addHeaders(e){Object.assign(this.headers,e)},addQueryParameters(e){Object.assign(this.queryParameters,e)},setHosts(e){this.hosts=e.map(e=>(function(e,t){return{url:e,accept:t,downDate:0,up:!0,setAsDown(){this.downDate=Date.now(),this.up=!1},isUp(){return!this.up&&Date.now()-this.downDate>3e3&&(this.up=!0),this.up}}})(e.url,e.accept))},read(e,t){const r=l(t,this.timeouts.read),s={request:e,mappedRequestOptions:r},a=()=>c(this,this.hosts.filter(e=>0!=(e.accept&h.Read)),e,r);return!0!==(void 0!==r.cacheable?r.cacheable:e.cacheable)?a():this.responsesCache.get(s,()=>this.requestsCache.get(s,()=>this.requestsCache.set(s,a()).then(e=>this.requestsCache.delete(s).then(()=>e))),{miss:e=>this.responsesCache.set(s,e)})},write(e,t){return c(this,this.hosts.filter(e=>0!=(e.accept&h.Write)),e,l(t,this.timeouts.write))}}}const m=e=>{const r=e.appId,a=d(e);a.setHosts([{url:`${r}-dsn.algolia.net`,accept:h.Read},{url:`${r}.algolia.net`,accept:h.Write}].concat(function(e){let t=e.length-1;for(;t>0;t--){const r=Math.floor(Math.random()*(t+1)),s=e[t];e[t]=e[r],e[r]=s}return e}([{url:`${r}-1.algolianet.com`,accept:h.Any},{url:`${r}-2.algolianet.com`,accept:h.Any},{url:`${r}-3.algolianet.com`,accept:h.Any}])));const n=function(e,r,s){const a={"x-algolia-api-key":s,"x-algolia-application-id":r};return{headers:()=>e===t.WithinHeaders?a:{},queryParameters:()=>e===t.WithinQueryParameters?a:{}}}(void 0!==e.authMode?e.authMode:t.WithinHeaders,r,e.apiKey);return a.addHeaders({...n.headers(),"content-type":"application/x-www-form-urlencoded"}),a.addQueryParameters(n.queryParameters()),s({transporter:a,appId:r,addAlgoliaAgent(e,t){a.addUserAgent(e,t)}},e)},p=e=>({...e,initIndex(e,t){return s({transporter:this.transporter,indexName:e},t)}}),g="POST",f=e=>({...e,searchForFacetValues(e,t,r){return this.transporter.read({method:g,path:a("1/indexes/%s/facets/%s/query",this.indexName,e),data:{facetQuery:t},cacheable:!0},r)}}),y={searchClient:[e=>({...e,multipleQueries(e,t){const r=e.map(e=>({...e,params:n(e.params)}));return this.transporter.read({method:g,path:"1/indexes/*/queries",data:{requests:r},cacheable:!0},t)},search(e,t){return this.multipleQueries(e,t)}}),e=>({...e,multipleSearchForFacetValues(e,t){return Promise.all(e.map(e=>{const r=Object.assign({},e.params),s=r.facetName,a=r.facetQuery;return delete r.facetName,delete r.facetQuery,p(this).initIndex(e.indexName,{methods:[f]}).searchForFacetValues(s,a,{...t,...r})}))},searchForFacetValues(e,t){return this.multipleSearchForFacetValues(e,t)}})],searchIndex:[e=>({...e,search(e,t){return this.transporter.read({method:g,path:a("1/indexes/%s/query",this.indexName),data:{query:e},cacheable:!0},t)}}),f]},v=e=>{return{...m({...e,methods:y.searchClient}),initIndex(e){return p(this).initIndex(e,{methods:y.searchIndex})}}};function O(s,a,n={}){return v({appId:s,apiKey:a,requester:{send:e=>new Promise(t=>{const r=new XMLHttpRequest;r.open(e.method,e.url,!0),Object.keys(e.headers).forEach(t=>r.setRequestHeader(t,e.headers[t]));const s=setTimeout(()=>{r.abort(),t({status:0,content:"",isTimedOut:!0})},1e3*e.timeout);r.onerror=()=>{0===r.status&&(clearTimeout(s),t({content:r.responseText||"Network request failed",status:r.status,isTimedOut:!1}))},r.onload=()=>{clearTimeout(s),t({content:r.responseText,status:r.status,isTimedOut:!1})},r.send(e.data)})},timeouts:{read:1,write:30},logger:(i=void 0===n.logLevel?r.Error:n.logLevel,{debug(e,t){r.Debug>=i&&console.debug(e,t)},info(e,t){r.Info>=i&&console.info(e,t)},error(e,t){console.error(e,t)}}),responsesCache:e(),requestsCache:e(),hostsCache:{get(e,t,r){const s=JSON.stringify(e),a=localStorage.getItem(s);if(null!==a)return Promise.resolve(JSON.parse(a));const n=t(),o=r&&r.miss||(()=>Promise.resolve());return n.then(e=>o(e)).then(()=>n)},set:(e,t)=>(localStorage.setItem(JSON.stringify(e),JSON.stringify(t)),Promise.resolve(t)),delete:e=>(localStorage.removeItem(JSON.stringify(e)),Promise.resolve()),clear:()=>(localStorage.clear(),Promise.resolve())},userAgent:(o="4.0.0-alpha.0",{value:`Algolia for JavaScript (${o})`,with(e){return this.value=`${this.value}; ${e.segment}`,void 0!==e.version&&(this.value+=` (${e.version})`),Object.assign({},this)}}).with({segment:"Browser",version:"lite"}),authMode:t.WithinQueryParameters});var o,i}return window.algoliasearch=O,O}));
