(function(t){function e(e){for(var r,i,c=e[0],s=e[1],u=e[2],d=0,f=[];d<c.length;d++)i=c[d],Object.prototype.hasOwnProperty.call(o,i)&&o[i]&&f.push(o[i][0]),o[i]=0;for(r in s)Object.prototype.hasOwnProperty.call(s,r)&&(t[r]=s[r]);l&&l(e);while(f.length)f.shift()();return a.push.apply(a,u||[]),n()}function n(){for(var t,e=0;e<a.length;e++){for(var n=a[e],r=!0,c=1;c<n.length;c++){var s=n[c];0!==o[s]&&(r=!1)}r&&(a.splice(e--,1),t=i(i.s=n[0]))}return t}var r={},o={index:0},a=[];function i(e){if(r[e])return r[e].exports;var n=r[e]={i:e,l:!1,exports:{}};return t[e].call(n.exports,n,n.exports,i),n.l=!0,n.exports}i.m=t,i.c=r,i.d=function(t,e,n){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},i.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var r in t)i.d(n,r,function(e){return t[e]}.bind(null,r));return n},i.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="/en/";var c=window["webpackJsonp"]=window["webpackJsonp"]||[],s=c.push.bind(c);c.push=e,c=c.slice();for(var u=0;u<c.length;u++)e(c[u]);var l=s;a.push([0,"chunk-vendors","chunk-common"]),n()})({0:function(t,e,n){t.exports=n("6b7b")},"04f3":function(t,e,n){},1:function(t,e){},2:function(t,e){},"44d1":function(t,e,n){n("45fc"),n("dca8"),n("d3b7");var r=n("6374"),o=n("970b"),a=n("5bc3"),i={uint8:{getter:function(t,e,n){return t.getUint8(n,e.littleEndian)},byteSize:1},uint16:{getter:function(t,e,n){return t.getUint16(n,e.littleEndian)},byteSize:2},uint32:{getter:function(t,e,n){return t.getUint32(n,e.littleEndian)},byteSize:4},int8:{getter:function(t,e,n){return t.getInt8(n,e.littleEndian)},byteSize:1},int16:{getter:function(t,e,n){return t.getInt16(n,e.littleEndian)},byteSize:2},int32:{getter:function(t,e,n){return t.getInt32(n,e.littleEndian)},byteSize:4},float32:{getter:function(t,e,n){return t.getFloat32(n,e.littleEndian)},byteSize:4},float64:{getter:function(t,e,n){return t.getFloat64(n,e.littleEndian)},byteSize:8}},c=function(){"use strict";function t(e){o(this,t),this._totalBytes=0,this._props=[];var n,a=r(e);try{for(a.s();!(n=a.n()).done;){var i=n.value;this.addProp(i)}}catch(c){a.e(c)}finally{a.f()}}return a(t,[{key:"addProp",value:function(e){var n=e.key,r=e.type,o=e.length,a=void 0===o?1:o,c=e.littleEndian,s=void 0!==c&&c;if(this._props.some((function(t){return t.key===n})))throw new Error('Property with key name "'.concat(n,'" already defined'));var u,l=this._totalBytes;if(u=r instanceof t?{getter:function(t,e,n){return r.read(new DataView(t.buffer,t.byteOffset+n,e.byteSize))},byteSize:r._totalBytes}:i[r],!u)throw new Error('Type "'.concat(r,'" not valid.'));var d=u,f=d.getter,p=d.byteSize,h=p*a,g=Object.freeze({key:n,type:r,length:a,littleEndian:s,byteSize:p,totalBytes:h,read:function(t){for(var e=[],n=0;n<a;n++)e[n]=f(t,g,l+p*n);return e}});this._totalBytes+=h,this._props.push(g)}},{key:"read",value:function(t){var e={},n=t;t instanceof DataView||(n=new DataView(t));var o,a=r(this._props);try{for(a.s();!(o=a.n()).done;){var i=o.value,c=i.read(n);1===i.length&&(c=c[0]),e[i.key]=c}}catch(s){a.e(s)}finally{a.f()}return e}}]),t}();t.exports={StructSchema:c}},"6b7b":function(t,e,n){"use strict";n.r(e);n("4de4"),n("a15b"),n("b680"),n("e260"),n("e6cf"),n("cca6"),n("a79d");var r=n("2b0e"),o=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("tabNotification")},a=[],i=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"notification-tab"},[t.connected?n("device-info",{attrs:{info:t.deviceInfo},on:{disconnect:function(e){return t.controller.disconnect()}}}):t._e(),t.connected?n("div",[n("progress-status",{ref:"progress"}),"default"!==t.state?n("button",{on:{click:t.onCancel}},[t._v("Cancel")]):t._e(),"default"===t.state?n("button",{on:{click:t.onUpload}},[t._v("Upload")]):t._e(),"default"===t.state?n("button",{on:{click:t.onExposures}},[t._v("Check Exposures")]):t._e()],1):t._e(),t.connected&&t.gridData.length>0?n("simple-grid",{attrs:{data:t.gridData,columns:t.gridColumns,caption:"Exposures"}}):t._e(),t.connected?t._e():n("button",{attrs:{id:"connect"},on:{click:t.onConnect}},[t._v("Connect")])],1)},c=[],s=(n("b0c0"),n("96cf"),n("1da1")),u=n("b85c"),l=n("4e69"),d=n("e57f"),f=n("9433"),p=n("6196"),h=n("d92d"),g=n("d2be"),b=n("e640"),v=n("5a0c"),y=n.n(v),m=n("d772"),k=n.n(m);function S(t,e){var n=[];if(e.length>0){var r,o={},a={},i=Object(u["a"])(e);try{for(i.s();!(r=i.n()).done;){var c=r.value;o[c.encounterId]=c}}catch(S){i.e(S)}finally{i.f()}var s,l=[],d=Object(u["a"])(t);try{for(d.s();!(s=d.n()).done;){var f=s.value;!o[f.encounterId]||a[f.encounterId]&&a[f.encounterId][f.timestamp]||(void 0==a[f.encounterId]&&(a[f.encounterId]={}),a[f.encounterId][f.timestamp]=1,l.push(f))}}catch(S){d.e(S)}finally{d.f()}for(var p=void 0,h=0,g=l;h<g.length;h++){var b=g[h],v=y()(b.timestamp),m=!p;if(!m){var k=p.start.add(5+p.duration,"minutes");m=v.isAfter(k)}m?(p={start:v,duration:1,count:1},n.push(p)):(p.duration=v.diff(p.start,"minute"),p.count+=1)}}return n}y.a.extend(k.a);var O={components:{DeviceInfo:l["a"],SimpleGrid:d["a"],ProgressStatus:f["a"]},data:function(){return{controller:Object(p["a"])(),deviceInfo:void 0,connected:!1,gridColumns:[{title:"Start Time",name:"start",filter:"formatMoment"},{title:"Duration (minutes)",name:"duration"},{title:"Count",name:"count"}],gridData:[],state:"default",callbackOptions:{expected:void 0,last:0,interrupt:!1,onProgress:this.onProgress}}},created:function(){this.controller.on("connected",this.onConnected),this.controller.on("disconnected",this.onDisconnected)},beforeDestroy:function(){this.controller.off("disconnected",this.onDisconnected),this.controller.off("connected",this.onConnected)},methods:{onProgress:function(t,e){this.callbackOptions.expected||(this.callbackOptions.expected=e,this.$refs.progress.taskExtend(e)),this.$refs.progress.taskNextStep(void 0,t-this.callbackOptions.last),this.callbackOptions.last=t},onUpload:function(){var t=Object(s["a"])(regeneratorRuntime.mark((function t(){var e,n=this;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:e=this.$refs.progress,this.state="upload",this.callbackOptions.expected=void 0,this.callbackOptions.last=0,this.callbackOptions.interrupt=!1,e.taskBegin(4,"Retrieving Device Data"),this.controller.getLastAddress().then((function(t){console.log("lastAddress: "+t),e.taskNextStep()})).then((function(){return n.controller.fetchData(!1,!1,n.callbackOptions)})).then((function(t){return e.taskNextStep("Processing Data..."),Object(g["bytesToData"])(t)})).then((function(t){return t=t.filter((function(t){return"0000000000000000000000000000000000000000000000000000000000000000"!==t.encounterId})),e.taskNextStep("Uploading..."),Object(b["b"])("68.183.130.247","8000",t,"POSITIVE",{name:n.controller.getDeviceName()})})).then((function(t){e.taskEnd("Data Upload Complete - Added "+t)})).catch((function(t){t instanceof p["b"]?e.taskCancel("Upload Cancelled"):(e.taskError("Error during Upload: "+t.message),console.log(t))})).then((function(){e.taskReset(),n.state="default"}));case 7:case"end":return t.stop()}}),t,this)})));function e(){return t.apply(this,arguments)}return e}(),onCancel:function(){this.callbackOptions.interrupt=!0},onExposures:function(){var t=this,e=this.$refs.progress;this.state="exposures",this.callbackOptions.expected=void 0,this.callbackOptions.last=0;var n={};this.gridData=[],e.taskBegin(4,"Retrieving Device Data"),this.controller.fetchData(!0,!1,this.callbackOptions).then((function(t){return e.taskNextStep("Device Data Retrieved"),Object(g["bytesToData"])(t)})).then((function(t){return e.taskNextStep("Retrieving Server Data"),n.local=t,Object(b["a"])("68.183.130.247","8000")})).then((function(r){e.taskNextStep("Comparing"),t.gridData=S(n.local,r),e.taskEnd(t.gridData.length>0?"Complete":"No Encounters Found")})).catch((function(t){t instanceof p["b"]?e.taskCancel("Check Cancelled"):(e.taskError("Error While Looking for Encounters: "+t.message),console.log(t))})).then((function(){e.taskReset(),t.state="default"}))},onConnect:function(){this.controller.connect().catch((function(t){"NotFoundError"!==t.name&&console.log(t)}))},onConnected:function(){var t=this;this.controller.getVersion().then((function(t){return console.log(t)})).then((function(){return new h["a"](t.controller)})).then((function(e){return t.deviceInfo=e})).then((function(){t.connected=!0})).catch((function(t){console.log(t)}))},onDisconnected:function(){this.connected=!1}}},w=O,E=(n("d11e"),n("2877")),x=Object(E["a"])(w,i,c,!1,null,"e8090b7e",null),_=x.exports,D={name:"NISTET",components:{tabNotification:_},data:function(){return{}},computed:{},created:function(){}},C=D,j=(n("bdce"),Object(E["a"])(C,o,a,!1,null,null,null)),I=j.exports,P=n("ecee"),N=n("b702"),T=n("c074"),z=n("f2d1"),R=n("ad3d");P["c"].add(T["b"],T["e"],T["d"],T["f"],T["c"],N["b"],N["c"],N["a"],T["g"],T["h"],T["a"],z["a"]),r["a"].component("font-awesome-icon",R["a"]),r["a"].component("font-awesome-layers",R["b"]),r["a"].filter("formatMoment",(function(t){return t?t.format("MM/DD/YYYY HH:mm:ss.SSS ZZ"):"N/A"})),r["a"].filter("formatFloat",(function(t,e){if(t)return t.toFixed(e)})),r["a"].filter("formatUptime",(function(t){if(t){var e=function(t,e){var n=[0,0];return n[1]=t%e,n[0]=(t-n[1])/e,n},n=e(t,864e5),r=e(n[1],36e5),o=e(r[1],6e4),a=e(o[1],1e3),i=function(t){return t<10?"0"+t:t};return[i(n[0]),i(r[0]),i(o[0]),i(a[0])].join(":")+" (D:H:M:S)"}return"N/A"})),r["a"].config.productionTip=!1,new r["a"]({render:function(t){return t(I)}}).$mount("#app")},bdce:function(t,e,n){"use strict";n("c5ce")},c5ce:function(t,e,n){},d11e:function(t,e,n){"use strict";n("04f3")},d2be:function(t,e,n){n("a15b"),n("d81d"),n("fb6a"),n("d3b7"),n("25f0");var r=n("ded3"),o=n("44d1"),a=64,i=32,c=new o.StructSchema([{key:"n",type:"uint8",littleEndian:!0},{key:"left",type:"uint16",littleEndian:!0},{key:"left_iqr",type:"uint16",littleEndian:!0},{key:"right",type:"uint16",littleEndian:!0},{key:"right_iqr",type:"uint16",littleEndian:!0}]),s=new o.StructSchema([{key:"minute",type:"uint32",length:1,littleEndian:!0},{key:"mac",type:"uint8",length:6,littleEndian:!0},{key:"version",type:"uint8",length:1,littleEndian:!0},{key:"usound_data",type:c,length:1,littleEndian:!0},{key:"rssi_values",type:"int8",length:12},{key:"encounter_id",type:"uint8",length:32,littleEndian:!0}]);function u(t){return Array.prototype.map.call(t,(function(t){return("00"+t.toString(16)).slice(-2)})).join("")}function l(t){var e=s.read(t),n=new Date(60*e.minute*1e3),o=n.toISOString();e.encounter_id=u(e.encounter_id),e.mac=u(e.mac);var a=e.encounter_id;return delete e.encounter_id,r(r({},e),{},{timestamp:o,encounterId:a})}function d(t,e,n){for(var r=t[e],o=e;o<n;o++)if(r!==t[o])return!1;return!0}function f(t){var e=[],n=0;while(n+a<t.byteLength)if(d(t,n,n+i))n+=i;else{var r=new DataView(t.buffer,n,a),o=l(r);e.push(o),n+=a}return e}t.exports={bytesToData:f}},e640:function(t,e,n){"use strict";(function(t){n.d(e,"b",(function(){return f})),n.d(e,"a",(function(){return h}));n("99af"),n("d3b7"),n("25f0");var r=n("b85c"),o=n("5530"),a=(n("96cf"),n("1da1")),i=n("9490"),c=n.n(i),s=n("5a0c"),u=n.n(s),l=n("0ecf"),d=n.n(l);function f(t,e,n){return p.apply(this,arguments)}function p(){return p=Object(a["a"])(regeneratorRuntime.mark((function t(e,n,r){var a,i,c,s,u,l,d,f,p,h,g=arguments;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:a=g.length>3&&void 0!==g[3]?g[3]:"NONE",i=g.length>4&&void 0!==g[4]?g[4]:{},c=g.length>5&&void 0!==g[5]?g[5]:50,s=0,u=0;case 5:if(!(u<r.length)){t.next=24;break}for(l={encounters:[]};u<r.length&&l.encounters.length<c;u++)d=r[u],l.encounters.push({status:a,encounterId:d.encounterId,timestamp:d.timestamp,_meta:Object(o["a"])({mac:d.mac,rssi_values:d.rssi_values,usound_data:d.usound_data},i)});return f=JSON.stringify(l),p={hostname:e,port:n,path:"/api/encounters/debug",method:"POST",headers:{"Content-Type":"application/json","Content-Length":f.length}},t.prev=10,h=b(p,f),t.next=14,h;case 14:s+=l.encounters.length,t.next=22;break;case 17:throw t.prev=17,t.t0=t["catch"](10),console.log("error while sending data: ".concat(f)),console.log(t.t0),t.t0;case 22:t.next=5;break;case 24:return t.abrupt("return",s);case 25:case"end":return t.stop()}}),t,null,[[10,17]])}))),p.apply(this,arguments)}function h(t,e){return g.apply(this,arguments)}function g(){return g=Object(a["a"])(regeneratorRuntime.mark((function t(e,n){var o,a,i,c,s,l,d,f,p,h,g;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:o=0,a=1,i=[],c=u()().subtract(2,"week").utc().format();case 3:if(!(o<a)){t.next=16;break}return s={hostname:e,port:n,path:"/api/encounters/debug?page="+o+"&status=POSITIVE&timestamp[$gte]="+c,method:"GET",headers:{"Access-Control-Allow-Headers":"X-Pages","Access-Control-Expose-Headers":"X-Pages"}},l=b(s),t.next=8,l;case 8:d=t.sent,a=d.pages,f=JSON.parse(d.body),p=Object(r["a"])(f.data.encounters);try{for(p.s();!(h=p.n()).done;)g=h.value,i.push(g)}catch(v){p.e(v)}finally{p.f()}o++,t.next=3;break;case 16:return t.abrupt("return",i);case 17:case"end":return t.stop()}}),t)}))),g.apply(this,arguments)}function b(e,n){return new Promise((function(r,o){var a=c.a.request(e,(function(e){var n=[];e.on("data",(function(t){n.push(t)})),e.on("end",(function(){var a=t.concat(n);e.statusCode>=200&&e.statusCode<300?r({body:a.toString(),pages:e.headers["x-pages"]?e.headers["x-pages"]:1}):o(new Error(a.toString()))}))}));a.on("error",(function(t){"Failed to fetch"==t.message&&(t.message="Failed to fetch (Connection Error?)"),o(t)})),n&&a.write(n),a.end()}))}u.a.extend(d.a)}).call(this,n("b639").Buffer)}});
//# sourceMappingURL=index.4c9c4e7d.js.map