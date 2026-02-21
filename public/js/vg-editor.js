/**
 * Tagify (v 4.9.8) - tags input component
 * By Yair Even-Or
 * Don't sell this code. (c)
 * https://github.com/yairEO/tagify
 */

!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t="undefined"!=typeof globalThis?globalThis:t||self).Tagify=e()}(this,(function(){"use strict";function t(t,e){var i=Object.keys(t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(t);e&&(s=s.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),i.push.apply(i,s)}return i}function e(e){for(var s=1;s<arguments.length;s++){var a=null!=arguments[s]?arguments[s]:{};s%2?t(Object(a),!0).forEach((function(t){i(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):t(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function i(t,e,i){return e in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}const s=(t,e,i,s)=>(t=""+t,e=""+e,s&&(t=t.trim(),e=e.trim()),i?t==e:t.toLowerCase()==e.toLowerCase());function a(t,e){var i,s={};for(i in t)e.indexOf(i)<0&&(s[i]=t[i]);return s}function n(t){var e=document.createElement("div");return t.replace(/\&#?[0-9a-z]+;/gi,(function(t){return e.innerHTML=t,e.innerText}))}function o(t,e){for(e=e||"previous";t=t[e+"Sibling"];)if(3==t.nodeType)return t}function r(t){return"string"==typeof t?t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/`|'/g,"&#039;"):t}function l(t){var e=Object.prototype.toString.call(t).split(" ")[1].slice(0,-1);return t===Object(t)&&"Array"!=e&&"Function"!=e&&"RegExp"!=e&&"HTMLUnknownElement"!=e}function d(t,e,i){function s(t,e){for(var i in e)if(e.hasOwnProperty(i)){if(l(e[i])){l(t[i])?s(t[i],e[i]):t[i]=Object.assign({},e[i]);continue}if(Array.isArray(e[i])){t[i]=Object.assign([],e[i]);continue}t[i]=e[i]}}return t instanceof Object||(t={}),s(t,e),i&&s(t,i),t}function h(t){return String.prototype.normalize?"string"==typeof t?t.normalize("NFD").replace(/[\u0300-\u036f]/g,""):void 0:t}var g=()=>/(?=.*chrome)(?=.*android)/i.test(navigator.userAgent);function c(t){return t&&t.classList&&t.classList.contains(this.settings.classNames.tag)}var p={delimiters:",",pattern:null,tagTextProp:"value",maxTags:1/0,callbacks:{},addTagOnBlur:!0,duplicates:!1,whitelist:[],blacklist:[],enforceWhitelist:!1,userInput:!0,keepInvalidTags:!1,mixTagsAllowedAfter:/,|\.|\:|\s/,mixTagsInterpolator:["[[","]]"],backspace:!0,skipInvalid:!1,pasteAsTags:!0,editTags:{clicks:2,keepInvalid:!0},transformTag:()=>{},trim:!0,a11y:{focusableTags:!1},mixMode:{insertAfterTag:" "},autoComplete:{enabled:!0,rightKey:!1},classNames:{namespace:"tagify",mixMode:"tagify--mix",selectMode:"tagify--select",input:"tagify__input",focus:"tagify--focus",tagNoAnimation:"tagify--noAnim",tagInvalid:"tagify--invalid",tagNotAllowed:"tagify--notAllowed",scopeLoading:"tagify--loading",hasMaxTags:"tagify--hasMaxTags",hasNoTags:"tagify--noTags",empty:"tagify--empty",inputInvalid:"tagify__input--invalid",dropdown:"tagify__dropdown",dropdownWrapper:"tagify__dropdown__wrapper",dropdownItem:"tagify__dropdown__item",dropdownItemActive:"tagify__dropdown__item--active",dropdownInital:"tagify__dropdown--initial",tag:"tagify__tag",tagText:"tagify__tag-text",tagX:"tagify__tag__removeBtn",tagLoading:"tagify__tag--loading",tagEditing:"tagify__tag--editable",tagFlash:"tagify__tag--flash",tagHide:"tagify__tag--hide"},dropdown:{classname:"",enabled:2,maxItems:10,searchKeys:["value","searchBy"],fuzzySearch:!0,caseSensitive:!1,accentedSearch:!0,highlightFirst:!1,closeOnSelect:!0,clearOnSelect:!0,position:"all",appendTarget:null},hooks:{beforeRemoveTag:()=>Promise.resolve(),beforePaste:()=>Promise.resolve(),suggestionClick:()=>Promise.resolve()}};function u(){this.dropdown={};for(let t in this._dropdown)this.dropdown[t]="function"==typeof this._dropdown[t]?this._dropdown[t].bind(this):this._dropdown[t];this.dropdown.refs()}var m={refs(){this.DOM.dropdown=this.parseTemplate("dropdown",[this.settings]),this.DOM.dropdown.content=this.DOM.dropdown.querySelector(this.settings.classNames.dropdownWrapperSelector)},show(t){var e,i,a,n=this.settings,o="mix"==n.mode&&!n.enforceWhitelist,r=!n.whitelist||!n.whitelist.length,d="manual"==n.dropdown.position;if(t=void 0===t?this.state.inputText:t,(!r||o||n.templates.dropdownItemNoMatch)&&!1!==n.dropdown.enable&&!this.state.isLoading){if(clearTimeout(this.dropdownHide__bindEventsTimeout),this.suggestedListItems=this.dropdown.filterListItems(t),t&&!this.suggestedListItems.length&&(this.trigger("dropdown:noMatch",t),n.templates.dropdownItemNoMatch&&(a=n.templates.dropdownItemNoMatch.call(this,{value:t}))),!a){if(this.suggestedListItems.length)t&&o&&!this.state.editing.scope&&!s(this.suggestedListItems[0].value,t)&&this.suggestedListItems.unshift({value:t});else{if(!t||!o||this.state.editing.scope)return this.input.autocomplete.suggest.call(this),void this.dropdown.hide();this.suggestedListItems=[{value:t}]}i=""+(l(e=this.suggestedListItems[0])?e.value:e),n.autoComplete&&i&&0==i.indexOf(t)&&this.input.autocomplete.suggest.call(this,e)}this.dropdown.fill(a),n.dropdown.highlightFirst&&this.dropdown.highlightOption(this.DOM.dropdown.content.children[0]),this.state.dropdown.visible||setTimeout(this.dropdown.events.binding.bind(this)),this.state.dropdown.visible=t||!0,this.state.dropdown.query=t,this.setStateSelection(),d||setTimeout((()=>{this.dropdown.position(),this.dropdown.render()})),setTimeout((()=>{this.trigger("dropdown:show",this.DOM.dropdown)}))}},hide(t){var e=this.DOM,i=e.scope,s=e.dropdown,a="manual"==this.settings.dropdown.position&&!t;if(s&&document.body.contains(s)&&!a)return window.removeEventListener("resize",this.dropdown.position),this.dropdown.events.binding.call(this,!1),i.setAttribute("aria-expanded",!1),s.parentNode.removeChild(s),setTimeout((()=>{this.state.dropdown.visible=!1}),100),this.state.dropdown.query=this.state.ddItemData=this.state.ddItemElm=this.state.selection=null,this.state.tag&&this.state.tag.value.length&&(this.state.flaggedTags[this.state.tag.baseOffset]=this.state.tag),this.trigger("dropdown:hide",s),this},toggle(t){this.dropdown[this.state.dropdown.visible&&!t?"hide":"show"]()},render(){var t,e,i,s=(t=this.DOM.dropdown,(i=t.cloneNode(!0)).style.cssText="position:fixed; top:-9999px; opacity:0",document.body.appendChild(i),e=i.clientHeight,i.parentNode.removeChild(i),e),a=this.settings;return"number"==typeof a.dropdown.enabled&&a.dropdown.enabled>=0?(this.DOM.scope.setAttribute("aria-expanded",!0),document.body.contains(this.DOM.dropdown)||(this.DOM.dropdown.classList.add(a.classNames.dropdownInital),this.dropdown.position(s),a.dropdown.appendTarget.appendChild(this.DOM.dropdown),setTimeout((()=>this.DOM.dropdown.classList.remove(a.classNames.dropdownInital)))),this):this},fill(t){var e;t="string"==typeof t?t:this.dropdown.createListHTML(t||this.suggestedListItems),this.DOM.dropdown.content.innerHTML=(e=t)?e.replace(/\>[\r\n ]+\</g,"><").replace(/(<.*?>)|\s+/g,((t,e)=>e||" ")):""},refilter(t){t=t||this.state.dropdown.query||"",this.suggestedListItems=this.dropdown.filterListItems(t),this.dropdown.fill(),this.suggestedListItems.length||this.dropdown.hide(),this.trigger("dropdown:updated",this.DOM.dropdown)},position(t){var e=this.settings.dropdown;if("manual"!=e.position){var i,s,a,n,o,r,l=this.DOM.dropdown,d=e.placeAbove,h=document.documentElement.clientHeight,g=Math.max(document.documentElement.clientWidth||0,window.innerWidth||0)>480?e.position:"all",c=this.DOM["input"==g?"input":"scope"];t=t||l.clientHeight,this.state.dropdown.visible&&("text"==g?(a=(i=this.getCaretGlobalPosition()).bottom,s=i.top,n=i.left,o="auto"):(r=function(t){for(var e=0,i=0;t;)e+=t.offsetLeft||0,i+=t.offsetTop||0,t=t.parentNode;return{left:e,top:i}}(this.settings.dropdown.appendTarget),s=(i=c.getBoundingClientRect()).top-r.top,a=i.bottom-1-r.top,n=i.left-r.left,o=i.width+"px"),s=Math.floor(s),a=Math.ceil(a),d=void 0===d?h-i.bottom<t:d,l.style.cssText="left:"+(n+window.pageXOffset)+"px; width:"+o+";"+(d?"top: "+(s+window.pageYOffset)+"px":"top: "+(a+window.pageYOffset)+"px"),l.setAttribute("placement",d?"top":"bottom"),l.setAttribute("position",g))}},events:{binding(t=!0){var e=this.dropdown.events.callbacks,i=this.listeners.dropdown=this.listeners.dropdown||{position:this.dropdown.position.bind(this),onKeyDown:e.onKeyDown.bind(this),onMouseOver:e.onMouseOver.bind(this),onMouseLeave:e.onMouseLeave.bind(this),onClick:e.onClick.bind(this),onScroll:e.onScroll.bind(this)},s=t?"addEventListener":"removeEventListener";"manual"!=this.settings.dropdown.position&&(window[s]("resize",i.position),window[s]("keydown",i.onKeyDown)),this.DOM.dropdown[s]("mouseover",i.onMouseOver),this.DOM.dropdown[s]("mouseleave",i.onMouseLeave),this.DOM.dropdown[s]("mousedown",i.onClick),this.DOM.dropdown.content[s]("scroll",i.onScroll)},callbacks:{onKeyDown(t){var e=this.DOM.dropdown.querySelector(this.settings.classNames.dropdownItemActiveSelector),i=this.dropdown.getSuggestionDataByNode(e);switch(t.key){case"ArrowDown":case"ArrowUp":case"Down":case"Up":var s;t.preventDefault(),e&&(e=e[("ArrowUp"==t.key||"Up"==t.key?"previous":"next")+"ElementSibling"]),e||(s=this.DOM.dropdown.content.children,e=s["ArrowUp"==t.key||"Up"==t.key?s.length-1:0]),i=this.dropdown.getSuggestionDataByNode(e),this.dropdown.highlightOption(e,!0);break;case"Escape":case"Esc":this.dropdown.hide();break;case"ArrowRight":if(this.state.actions.ArrowLeft)return;case"Tab":if("mix"!=this.settings.mode&&e&&!this.settings.autoComplete.rightKey&&!this.state.editing){t.preventDefault();var a=this.dropdown.getMappedValue(i);return this.input.autocomplete.set.call(this,a),!1}return!0;case"Enter":t.preventDefault(),this.settings.hooks.suggestionClick(t,{tagify:this,tagData:i,suggestionElm:e}).then((()=>{if(e)return this.dropdown.selectOption(e);this.dropdown.hide(),"mix"!=this.settings.mode&&this.addTags(this.state.inputText.trim(),!0)})).catch((t=>t));break;case"Backspace":{if("mix"==this.settings.mode||this.state.editing.scope)return;const t=this.input.raw.call(this);""!=t&&8203!=t.charCodeAt(0)||(!0===this.settings.backspace?this.removeTags():"edit"==this.settings.backspace&&setTimeout(this.editTag.bind(this),0))}}},onMouseOver(t){var e=t.target.closest(this.settings.classNames.dropdownItemSelector);e&&this.dropdown.highlightOption(e)},onMouseLeave(t){this.dropdown.highlightOption()},onClick(t){if(0==t.button&&t.target!=this.DOM.dropdown&&t.target!=this.DOM.dropdown.content){var e=t.target.closest(this.settings.classNames.dropdownItemSelector),i=this.dropdown.getSuggestionDataByNode(e);this.state.actions.selectOption=!0,setTimeout((()=>this.state.actions.selectOption=!1),50),this.settings.hooks.suggestionClick(t,{tagify:this,tagData:i,suggestionElm:e}).then((()=>{e?this.dropdown.selectOption(e):this.dropdown.hide()})).catch((t=>console.warn(t)))}},onScroll(t){var e=t.target,i=e.scrollTop/(e.scrollHeight-e.parentNode.clientHeight)*100;this.trigger("dropdown:scroll",{percentage:Math.round(i)})}}},getSuggestionDataByNode(t){var e=t?+t.getAttribute("tagifySuggestionIdx"):-1;return this.suggestedListItems[e]||null},highlightOption(t,e){var i,s=this.settings.classNames.dropdownItemActive;if(this.state.ddItemElm&&(this.state.ddItemElm.classList.remove(s),this.state.ddItemElm.removeAttribute("aria-selected")),!t)return this.state.ddItemData=null,this.state.ddItemElm=null,void this.input.autocomplete.suggest.call(this);i=this.suggestedListItems[this.getNodeIndex(t)],this.state.ddItemData=i,this.state.ddItemElm=t,t.classList.add(s),t.setAttribute("aria-selected",!0),e&&(t.parentNode.scrollTop=t.clientHeight+t.offsetTop-t.parentNode.clientHeight),this.settings.autoComplete&&(this.input.autocomplete.suggest.call(this,i),this.dropdown.position())},selectOption(t){var e=this.settings.dropdown,i=e.clearOnSelect,s=e.closeOnSelect;if(!t)return this.addTags(this.state.inputText,!0),void(s&&this.dropdown.hide());var a=t.getAttribute("tagifySuggestionIdx"),n=this.suggestedListItems[+a];this.trigger("dropdown:select",{data:n,elm:t}),a&&n?(this.state.editing?this.onEditTagDone(null,d({__isValid:!0},this.normalizeTags([n])[0])):this["mix"==this.settings.mode?"addMixTags":"addTags"]([n],i),this.DOM.input.parentNode&&(setTimeout((()=>{this.DOM.input.focus(),this.toggleFocusClass(!0)})),s?setTimeout(this.dropdown.hide.bind(this)):this.dropdown.refilter())):this.dropdown.hide()},selectAll(){return this.suggestedListItems.length=0,this.dropdown.hide(),this.addTags(this.dropdown.filterListItems(""),!0),this},filterListItems(t,e){var i,s,a,n,o,r=this.settings,d=r.dropdown,g=(e=e||{},t="select"==r.mode&&this.value.length&&this.value[0][r.tagTextProp]==t?"":t,[]),c=[],p=r.whitelist,u=d.maxItems||1/0,m=d.searchKeys,v=0;if(!t||!m.length)return(r.duplicates?p:p.filter((t=>!this.isTagDuplicate(l(t)?t.value:t)))).slice(0,u);function f(t,e){return e.toLowerCase().split(" ").every((e=>t.includes(e.toLowerCase())))}for(o=d.caseSensitive?""+t:(""+t).toLowerCase();v<p.length;v++){let t,u;i=p[v]instanceof Object?p[v]:{value:p[v]};let T=!Object.keys(i).some((t=>m.includes(t)))?["value"]:m;d.fuzzySearch&&!e.exact?(a=T.reduce(((t,e)=>t+" "+(i[e]||"")),"").toLowerCase().trim(),d.accentedSearch&&(a=h(a),o=h(o)),t=0==a.indexOf(o),u=a===o,s=f(a,o)):(t=!0,s=T.some((t=>{var s=""+(i[t]||"");return d.accentedSearch&&(s=h(s),o=h(o)),d.caseSensitive||(s=s.toLowerCase()),u=s===o,e.exact?s===o:0==s.indexOf(o)}))),n=!r.duplicates&&this.isTagDuplicate(l(i)?i.value:i),s&&!n&&(u&&t?c.push(i):"startsWith"==d.sortby&&t?g.unshift(i):g.push(i))}return"function"==typeof d.sortby?d.sortby(c.concat(g),o):c.concat(g).slice(0,u)},getMappedValue(t){var e=this.settings.dropdown.mapValueTo;return e?"function"==typeof e?e(t):t[e]||t.value:t.value},createListHTML(t){return d([],t).map(((t,e)=>{"string"!=typeof t&&"number"!=typeof t||(t={value:t});var i=this.dropdown.getMappedValue(t);t.value=i&&"string"==typeof i?r(i):i;var s=this.settings.templates.dropdownItem.apply(this,[t,this]);return s=s.replace(/\s*tagifySuggestionIdx=(["'])(.*?)\1/gim,"").replace(">",` tagifySuggestionIdx="${e}">`)})).join("")}};const v="@yaireo/tagify/";var f,T={empty:"empty",exceed:"number of tags exceeded",pattern:"pattern mismatch",duplicate:"already exists",notAllowed:"not allowed"},w={wrapper:(t,e)=>`<tags class="${e.classNames.namespace} ${e.mode?`${e.classNames[e.mode+"Mode"]}`:""} ${t.className}"\n                    ${e.readonly?"readonly":""}\n                    ${e.disabled?"disabled":""}\n                    ${e.required?"required":""}\n                    tabIndex="-1">\n            <span ${!e.readonly&&e.userInput?"contenteditable":""} tabIndex="0" data-placeholder="${e.placeholder||"&#8203;"}" aria-placeholder="${e.placeholder||""}"\n                class="${e.classNames.input}"\n                role="textbox"\n                aria-autocomplete="both"\n                aria-multiline="${"mix"==e.mode}"></span>\n                &#8203;\n        </tags>`,tag(t,e){var i=this.settings;return`<tag title="${t.title||t.value}"\n                    contenteditable='false'\n                    spellcheck='false'\n                    tabIndex="${i.a11y.focusableTags?0:-1}"\n                    class="${i.classNames.tag} ${t.class||""}"\n                    ${this.getAttributes(t)}>\n            <x title='' class="${i.classNames.tagX}" role='button' aria-label='remove tag'></x>\n            <div>\n                <span class="${i.classNames.tagText}">${t[i.tagTextProp]||t.value}</span>\n            </div>\n        </tag>`},dropdown(t){var e=t.dropdown,i="manual"==e.position,s=`${t.classNames.dropdown}`;return`<div class="${i?"":s} ${e.classname}" role="listbox" aria-labelledby="dropdown">\n                    <div class="${t.classNames.dropdownWrapper}"></div>\n                </div>`},dropdownItem(t,e){return`<div ${this.getAttributes(t)}\n                    class='${this.settings.classNames.dropdownItem} ${t.class?t.class:""}'\n                    tabindex="0"\n                    role="option">${t.value}</div>`},dropdownItemNoMatch:null};var b={customBinding(){this.customEventsList.forEach((t=>{this.on(t,this.settings.callbacks[t])}))},binding(t=!0){var e,i=this.events.callbacks,s=t?"addEventListener":"removeEventListener";if(!this.state.mainEvents||!t){for(var a in this.state.mainEvents=t,t&&!this.listeners.main&&(this.events.bindGlobal.call(this),this.settings.isJQueryPlugin&&jQuery(this.DOM.originalInput).on("tagify.removeAllTags",this.removeAllTags.bind(this))),e=this.listeners.main=this.listeners.main||{focus:["input",i.onFocusBlur.bind(this)],keydown:["input",i.onKeydown.bind(this)],click:["scope",i.onClickScope.bind(this)],dblclick:["scope",i.onDoubleClickScope.bind(this)],paste:["input",i.onPaste.bind(this)],drop:["input",i.onDrop.bind(this)]})this.DOM[e[a][0]][s](a,e[a][1]);clearInterval(this.listeners.main.originalInputValueObserverInterval),this.listeners.main.originalInputValueObserverInterval=setInterval(i.observeOriginalInputValue.bind(this),500);var n=this.listeners.main.inputMutationObserver||new MutationObserver(i.onInputDOMChange.bind(this));n&&n.disconnect(),"mix"==this.settings.mode&&n.observe(this.DOM.input,{childList:!0})}},bindGlobal(t){var e,i=this.events.callbacks,s=t?"removeEventListener":"addEventListener";if(t||!this.listeners.global)for(e of(this.listeners.global=this.listeners&&this.listeners.global||[{type:this.isIE?"keydown":"input",target:this.DOM.input,cb:i[this.isIE?"onInputIE":"onInput"].bind(this)},{type:"keydown",target:window,cb:i.onWindowKeyDown.bind(this)},{type:"blur",target:this.DOM.input,cb:i.onFocusBlur.bind(this)}],this.listeners.global))e.target[s](e.type,e.cb)},unbindGlobal(){this.events.bindGlobal.call(this,!0)},callbacks:{onFocusBlur(t){var e=t.target?this.trim(t.target.textContent):"",i=this.settings,s=t.type,a=i.dropdown.enabled>=0,n={relatedTarget:t.relatedTarget},o=this.state.actions.selectOption&&(a||!i.dropdown.closeOnSelect),r=this.state.actions.addNew&&a,l=t.relatedTarget&&c.call(this,t.relatedTarget)&&this.DOM.scope.contains(t.relatedTarget);if("blur"==s){if(t.relatedTarget===this.DOM.scope)return this.dropdown.hide(),void this.DOM.input.focus();this.postUpdate(),this.triggerChangeEvent()}if(!o&&!r)if(this.state.hasFocus="focus"==s&&+new Date,this.toggleFocusClass(this.state.hasFocus),"mix"!=i.mode){if("focus"==s)return this.trigger("focus",n),void(0!==i.dropdown.enabled&&i.userInput||this.dropdown.show(this.value.length?"":void 0));"blur"==s&&(this.trigger("blur",n),this.loading(!1),"select"==this.settings.mode&&l&&(e=""),("select"==this.settings.mode&&e?!this.value.length||this.value[0].value!=e:e&&!this.state.actions.selectOption&&i.addTagOnBlur)&&this.addTags(e,!0),"select"!=this.settings.mode||e||this.removeTags()),this.DOM.input.removeAttribute("style"),this.dropdown.hide()}else"focus"==s?this.trigger("focus",n):"blur"==t.type&&(this.trigger("blur",n),this.loading(!1),this.dropdown.hide(),this.state.dropdown.visible=void 0,this.setStateSelection())},onWindowKeyDown(t){var e,i=document.activeElement;if(c.call(this,i)&&this.DOM.scope.contains(document.activeElement))switch(e=i.nextElementSibling,t.key){case"Backspace":this.settings.readonly||(this.removeTags(i),(e||this.DOM.input).focus());break;case"Enter":setTimeout(this.editTag.bind(this),0,i)}},onKeydown(t){var e=this.settings;"select"==e.mode&&e.enforceWhitelist&&this.value.length&&"Tab"!=t.key&&t.preventDefault();var i=this.trim(t.target.textContent);if(this.trigger("keydown",{originalEvent:this.cloneEvent(t)}),"mix"==e.mode){switch(t.key){case"Left":case"ArrowLeft":this.state.actions.ArrowLeft=!0;break;case"Delete":case"Backspace":if(this.state.editing)return;var s,a,r,l=document.getSelection(),d="Delete"==t.key&&l.anchorOffset==(l.anchorNode.length||0),h=l.anchorNode.previousSibling,p=1==l.anchorNode.nodeType||!l.anchorOffset&&h&&1==h.nodeType&&l.anchorNode.previousSibling,u=n(this.DOM.input.innerHTML),m=this.getTagElms();if("edit"==e.backspace&&p)return s=1==l.anchorNode.nodeType?null:l.anchorNode.previousElementSibling,setTimeout(this.editTag.bind(this),0,s),void t.preventDefault();if(g()&&p)return r=o(p),p.hasAttribute("readonly")||p.remove(),this.DOM.input.focus(),void setTimeout((()=>{this.placeCaretAfterNode(r),this.DOM.input.click()}));if("BR"==l.anchorNode.nodeName)return;if((d||p)&&1==l.anchorNode.nodeType?a=0==l.anchorOffset?d?m[0]:null:m[l.anchorOffset-1]:d?a=l.anchorNode.nextElementSibling:p&&(a=p),3==l.anchorNode.nodeType&&!l.anchorNode.nodeValue&&l.anchorNode.previousElementSibling&&t.preventDefault(),(p||d)&&!e.backspace)return void t.preventDefault();if("Range"!=l.type&&!l.anchorOffset&&l.anchorNode==this.DOM.input&&"Delete"!=t.key)return void t.preventDefault();if("Range"!=l.type&&a&&a.hasAttribute("readonly"))return void this.placeCaretAfterNode(o(a));clearTimeout(f),f=setTimeout((()=>{var t=document.getSelection(),e=n(this.DOM.input.innerHTML),i=!d&&t.anchorNode.previousSibling;if(e.length>=u.length&&i)if(c.call(this,i)&&!i.hasAttribute("readonly")){if(this.removeTags(i),this.fixFirefoxLastTagNoCaret(),2==this.DOM.input.children.length&&"BR"==this.DOM.input.children[1].tagName)return this.DOM.input.innerHTML="",this.value.length=0,!0}else i.remove();this.value=[].map.call(m,((t,e)=>{var i=this.tagData(t);if(t.parentNode||i.readonly)return i;this.trigger("remove",{tag:t,index:e,data:i})})).filter((t=>t))}),20)}return!0}switch(t.key){case"Backspace":"select"==e.mode&&e.enforceWhitelist&&this.value.length?this.removeTags():this.state.dropdown.visible&&"manual"!=e.dropdown.position||""!=t.target.textContent&&8203!=i.charCodeAt(0)||(!0===e.backspace?this.removeTags():"edit"==e.backspace&&setTimeout(this.editTag.bind(this),0));break;case"Esc":case"Escape":if(this.state.dropdown.visible)return;t.target.blur();break;case"Down":case"ArrowDown":this.state.dropdown.visible||this.dropdown.show();break;case"ArrowRight":{let t=this.state.inputSuggestion||this.state.ddItemData;if(t&&e.autoComplete.rightKey)return void this.addTags([t],!0);break}case"Tab":{let s="select"==e.mode;if(!i||s)return!0;t.preventDefault()}case"Enter":if(this.state.dropdown.visible||229==t.keyCode)return;t.preventDefault(),setTimeout((()=>{this.state.actions.selectOption||this.addTags(i,!0)}))}},onInput(t){if(this.postUpdate(),"mix"==this.settings.mode)return this.events.callbacks.onMixTagsInput.call(this,t);var e=this.input.normalize.call(this),i=e.length>=this.settings.dropdown.enabled,s={value:e,inputElm:this.DOM.input};s.isValid=this.validateTag({value:e}),this.state.inputText!=e&&(this.input.set.call(this,e,!1),-1!=e.search(this.settings.delimiters)?this.addTags(e)&&this.input.set.call(this):this.settings.dropdown.enabled>=0&&this.dropdown[i?"show":"hide"](e),this.trigger("input",s))},onMixTagsInput(t){var e,i,s,a,n,o,r,l,h=this.settings,c=this.value.length,p=this.getTagElms(),u=document.createDocumentFragment(),m=window.getSelection().getRangeAt(0),v=[].map.call(p,(t=>this.tagData(t).value));if("deleteContentBackward"==t.inputType&&g()&&this.events.callbacks.onKeydown.call(this,{target:t.target,key:"Backspace"}),this.value.slice().forEach((t=>{t.readonly&&!v.includes(t.value)&&u.appendChild(this.createTagElem(t))})),u.childNodes.length&&(m.insertNode(u),this.setRangeAtStartEnd(!1,u.lastChild)),p.length!=c)return this.value=[].map.call(this.getTagElms(),(t=>this.tagData(t))),void this.update({withoutChangeEvent:!0});if(this.hasMaxTags())return!0;if(window.getSelection&&(o=window.getSelection()).rangeCount>0&&3==o.anchorNode.nodeType){if((m=o.getRangeAt(0).cloneRange()).collapse(!0),m.setStart(o.focusNode,0),s=(e=m.toString().slice(0,m.endOffset)).split(h.pattern).length-1,(i=e.match(h.pattern))&&(a=e.slice(e.lastIndexOf(i[i.length-1]))),a){if(this.state.actions.ArrowLeft=!1,this.state.tag={prefix:a.match(h.pattern)[0],value:a.replace(h.pattern,"")},this.state.tag.baseOffset=o.baseOffset-this.state.tag.value.length,l=this.state.tag.value.match(h.delimiters))return this.state.tag.value=this.state.tag.value.replace(h.delimiters,""),this.state.tag.delimiters=l[0],this.addTags(this.state.tag.value,h.dropdown.clearOnSelect),void this.dropdown.hide();n=this.state.tag.value.length>=h.dropdown.enabled;try{r=(r=this.state.flaggedTags[this.state.tag.baseOffset]).prefix==this.state.tag.prefix&&r.value[0]==this.state.tag.value[0],this.state.flaggedTags[this.state.tag.baseOffset]&&!this.state.tag.value&&delete this.state.flaggedTags[this.state.tag.baseOffset]}catch(t){}(r||s<this.state.mixMode.matchedPatternCount)&&(n=!1)}else this.state.flaggedTags={};this.state.mixMode.matchedPatternCount=s}setTimeout((()=>{this.update({withoutChangeEvent:!0}),this.trigger("input",d({},this.state.tag,{textContent:this.DOM.input.textContent})),this.state.tag&&this.dropdown[n?"show":"hide"](this.state.tag.value)}),10)},onInputIE(t){var e=this;setTimeout((function(){e.events.callbacks.onInput.call(e,t)}))},observeOriginalInputValue(){this.DOM.originalInput.value!=this.DOM.originalInput.tagifyValue&&this.loadOriginalValues()},onClickScope(t){var e=this.settings,i=t.target.closest("."+e.classNames.tag),s=+new Date-this.state.hasFocus;if(t.target!=this.DOM.scope){if(!t.target.classList.contains(e.classNames.tagX))return i?(this.trigger("click",{tag:i,index:this.getNodeIndex(i),data:this.tagData(i),originalEvent:this.cloneEvent(t)}),void(1!==e.editTags&&1!==e.editTags.clicks||this.events.callbacks.onDoubleClickScope.call(this,t))):void(t.target==this.DOM.input&&("mix"==e.mode&&this.fixFirefoxLastTagNoCaret(),s>500)?this.state.dropdown.visible?this.dropdown.hide():0===e.dropdown.enabled&&"mix"!=e.mode&&this.dropdown.show(this.value.length?"":void 0):"select"==e.mode&&!this.state.dropdown.visible&&this.dropdown.show());this.removeTags(t.target.parentNode)}else this.state.hasFocus||this.DOM.input.focus()},onPaste(t){t.preventDefault();var e,i,s=this.settings;if("select"==s.mode&&s.enforceWhitelist||!s.userInput)return!1;s.readonly||(e=t.clipboardData||window.clipboardData,i=e.getData("Text"),s.hooks.beforePaste(t,{tagify:this,pastedText:i,clipboardData:e}).then((e=>{void 0===e&&(e=i),e&&(this.injectAtCaret(e,window.getSelection().getRangeAt(0)),"mix"==this.settings.mode?this.events.callbacks.onMixTagsInput.call(this,t):this.settings.pasteAsTags?this.addTags(this.state.inputText+e,!0):this.state.inputText=e)})).catch((t=>t)))},onDrop(t){t.preventDefault()},onEditTagInput(t,e){var i=t.closest("."+this.settings.classNames.tag),s=this.getNodeIndex(i),a=this.tagData(i),n=this.input.normalize.call(this,t),o=i.innerHTML!=i.__tagifyTagData.__originalHTML,r=this.validateTag({[this.settings.tagTextProp]:n});o||!0!==t.originalIsValid||(r=!0),i.classList.toggle(this.settings.classNames.tagInvalid,!0!==r),a.__isValid=r,i.title=!0===r?a.title||a.value:r,n.length>=this.settings.dropdown.enabled&&(this.state.editing&&(this.state.editing.value=n),this.dropdown.show(n)),this.trigger("edit:input",{tag:i,index:s,data:d({},this.value[s],{newValue:n}),originalEvent:this.cloneEvent(e)})},onEditTagFocus(t){this.state.editing={scope:t,input:t.querySelector("[contenteditable]")}},onEditTagBlur(t){if(this.state.hasFocus||this.toggleFocusClass(),this.DOM.scope.contains(t)){var e,i,s=this.settings,a=t.closest("."+s.classNames.tag),n=this.input.normalize.call(this,t),o=this.tagData(a).__originalData,r=a.innerHTML!=a.__tagifyTagData.__originalHTML,l=this.validateTag({[s.tagTextProp]:n});if(n)if(r){if(e=this.hasMaxTags(),i=this.getWhitelistItem(n)||d({},o,{[s.tagTextProp]:n,value:n,__isValid:l}),s.transformTag.call(this,i,o),!0!==(l=(!e||!0===o.__isValid)&&this.validateTag({[s.tagTextProp]:i[s.tagTextProp]}))){if(this.trigger("invalid",{data:i,tag:a,message:l}),s.editTags.keepInvalid)return;s.keepInvalidTags?i.__isValid=l:i=o}else s.keepInvalidTags&&(delete i.title,delete i["aria-invalid"],delete i.class);this.onEditTagDone(a,i)}else this.onEditTagDone(a,o);else this.onEditTagDone(a)}},onEditTagkeydown(t,e){switch(this.trigger("edit:keydown",{originalEvent:this.cloneEvent(t)}),t.key){case"Esc":case"Escape":e.innerHTML=e.__tagifyTagData.__originalHTML;case"Enter":case"Tab":t.preventDefault(),t.target.blur()}},onDoubleClickScope(t){var e,i,s=t.target.closest("."+this.settings.classNames.tag),a=this.settings;s&&a.userInput&&(e=s.classList.contains(this.settings.classNames.tagEditing),i=s.hasAttribute("readonly"),"select"==a.mode||a.readonly||e||i||!this.settings.editTags||this.editTag(s),this.toggleFocusClass(!0),this.trigger("dblclick",{tag:s,index:this.getNodeIndex(s),data:this.tagData(s)}))},onInputDOMChange(t){t.forEach((t=>{t.addedNodes.forEach((t=>{if(t)if("<div><br></div>"==t.outerHTML)t.replaceWith(document.createElement("br"));else if(1==t.nodeType&&t.querySelector(this.settings.classNames.tagSelector)){let e=document.createTextNode("");3==t.childNodes[0].nodeType&&"BR"!=t.previousSibling.nodeName&&(e=document.createTextNode("\n")),t.replaceWith(e,...[...t.childNodes].slice(0,-1)),this.placeCaretAfterNode(e.previousSibling)}else c.call(this,t)&&t.previousSibling&&"BR"==t.previousSibling.nodeName&&(t.previousSibling.replaceWith("\n​"),this.placeCaretAfterNode(t.previousSibling.previousSibling))})),t.removedNodes.forEach((t=>{t&&"BR"==t.nodeName&&c.call(this,e)&&(this.removeTags(e),this.fixFirefoxLastTagNoCaret())}))}));var e=this.DOM.input.lastChild;e&&""==e.nodeValue&&e.remove(),e&&"BR"==e.nodeName||this.DOM.input.appendChild(document.createElement("br"))}}};function y(t,e){if(!t){console.warn("Tagify:","input element not found",t);const e=new Proxy(this,{get:()=>()=>e});return e}if(t.previousElementSibling&&t.previousElementSibling.classList.contains("tagify"))return console.warn("Tagify: ","input element is already Tagified",t),this;var i;d(this,function(t){var e=document.createTextNode("");function i(t,i,s){s&&i.split(/\s+/g).forEach((i=>e[t+"EventListener"].call(e,i,s)))}return{off(t,e){return i("remove",t,e),this},on(t,e){return e&&"function"==typeof e&&i("add",t,e),this},trigger(i,s,a){var n;if(a=a||{cloneData:!0},i)if(t.settings.isJQueryPlugin)"remove"==i&&(i="removeTag"),jQuery(t.DOM.originalInput).triggerHandler(i,[s]);else{try{var o="object"==typeof s?s:{value:s};if((o=a.cloneData?d({},o):o).tagify=this,s instanceof Object)for(var r in s)s[r]instanceof HTMLElement&&(o[r]=s[r]);n=new CustomEvent(i,{detail:o})}catch(t){console.warn(t)}e.dispatchEvent(n)}}}}(this)),this.isFirefox="undefined"!=typeof InstallTrigger,this.isIE=window.document.documentMode,e=e||{},this.getPersistedData=(i=e.id,t=>{let e,s="/"+t;if(1==localStorage.getItem(v+i+"/v",1))try{e=JSON.parse(localStorage[v+i+s])}catch(t){}return e}),this.setPersistedData=(t=>t?(localStorage.setItem(v+t+"/v",1),(e,i)=>{let s="/"+i,a=JSON.stringify(e);e&&i&&(localStorage.setItem(v+t+s,a),dispatchEvent(new Event("storage")))}):()=>{})(e.id),this.clearPersistedData=(t=>e=>{const i=v+"/"+t+"/";if(e)localStorage.removeItem(i+e);else for(let t in localStorage)t.includes(i)&&localStorage.removeItem(t)})(e.id),this.applySettings(t,e),this.state={inputText:"",editing:!1,actions:{},mixMode:{},dropdown:{},flaggedTags:{}},this.value=[],this.listeners={},this.DOM={},this.build(t),u.call(this),this.getCSSVars(),this.loadOriginalValues(),this.events.customBinding.call(this),this.events.binding.call(this),t.autofocus&&this.DOM.input.focus()}return y.prototype={_dropdown:m,customEventsList:["change","add","remove","invalid","input","click","keydown","focus","blur","edit:input","edit:beforeUpdate","edit:updated","edit:start","edit:keydown","dropdown:show","dropdown:hide","dropdown:select","dropdown:updated","dropdown:noMatch","dropdown:scroll"],dataProps:["__isValid","__removed","__originalData","__originalHTML","__tagId"],trim(t){return this.settings.trim&&t&&"string"==typeof t?t.trim():t},parseHTML:function(t){return(new DOMParser).parseFromString(t.trim(),"text/html").body.firstElementChild},templates:w,parseTemplate(t,e){return t=this.settings.templates[t]||t,this.parseHTML(t.apply(this,e))},set whitelist(t){const e=t&&Array.isArray(t);this.settings.whitelist=e?t:[],this.setPersistedData(e?t:[],"whitelist")},get whitelist(){return this.settings.whitelist},applySettings(t,i){p.templates=this.templates;var s=this.settings=d({},p,i);s.disabled=t.hasAttribute("disabled"),s.readonly=s.readonly||t.hasAttribute("readonly"),s.placeholder=r(t.getAttribute("placeholder")||s.placeholder||""),s.required=t.hasAttribute("required");for(let t in s.classNames)Object.defineProperty(s.classNames,t+"Selector",{get(){return"."+this[t].split(" ")[0]}});if(this.isIE&&(s.autoComplete=!1),["whitelist","blacklist"].forEach((e=>{var i=t.getAttribute("data-"+e);i&&(i=i.split(s.delimiters))instanceof Array&&(s[e]=i)})),"autoComplete"in i&&!l(i.autoComplete)&&(s.autoComplete=p.autoComplete,s.autoComplete.enabled=i.autoComplete),"mix"==s.mode&&(s.autoComplete.rightKey=!0,s.delimiters=i.delimiters||null,s.tagTextProp&&!s.dropdown.searchKeys.includes(s.tagTextProp)&&s.dropdown.searchKeys.push(s.tagTextProp)),t.pattern)try{s.pattern=new RegExp(t.pattern)}catch(t){}if(this.settings.delimiters)try{s.delimiters=new RegExp(this.settings.delimiters,"g")}catch(t){}s.disabled&&(s.userInput=!1),this.TEXTS=e(e({},T),s.texts||{}),"select"!=s.mode&&s.userInput||(s.dropdown.enabled=0),s.dropdown.appendTarget=i.dropdown&&i.dropdown.appendTarget?i.dropdown.appendTarget:document.body;let a=this.getPersistedData("whitelist");Array.isArray(a)&&(this.whitelist=Array.isArray(s.whitelist)?function(){const t=[],e={};for(let i of arguments)for(let s of i)l(s)?e[s.value]||(t.push(s),e[s.value]=1):t.includes(s)||t.push(s);return t}(s.whitelist,a):a)},getAttributes(t){var e,i=this.getCustomAttributes(t),s="";for(e in i)s+=" "+e+(void 0!==t[e]?`="${i[e]}"`:"");return s},getCustomAttributes(t){if(!l(t))return"";var e,i={};for(e in t)"__"!=e.slice(0,2)&&"class"!=e&&t.hasOwnProperty(e)&&void 0!==t[e]&&(i[e]=r(t[e]));return i},setStateSelection(){var t=window.getSelection(),e={anchorOffset:t.anchorOffset,anchorNode:t.anchorNode,range:t.getRangeAt&&t.rangeCount&&t.getRangeAt(0)};return this.state.selection=e,e},getCaretGlobalPosition(){const t=document.getSelection();if(t.rangeCount){const e=t.getRangeAt(0),i=e.startContainer,s=e.startOffset;let a,n;if(s>0)return n=document.createRange(),n.setStart(i,s-1),n.setEnd(i,s),a=n.getBoundingClientRect(),{left:a.right,top:a.top,bottom:a.bottom};if(i.getBoundingClientRect)return i.getBoundingClientRect()}return{left:-9999,top:-9999}},getCSSVars(){var t=getComputedStyle(this.DOM.scope,null);var e;this.CSSVars={tagHideTransition:(({value:t,unit:e})=>"s"==e?1e3*t:t)(function(t){if(!t)return{};var e=(t=t.trim().split(" ")[0]).split(/\d+/g).filter((t=>t)).pop().trim();return{value:+t.split(e).filter((t=>t))[0].trim(),unit:e}}((e="tag-hide-transition",t.getPropertyValue("--"+e))))}},build(t){var e=this.DOM;this.settings.mixMode.integrated?(e.originalInput=null,e.scope=t,e.input=t):(e.originalInput=t,e.scope=this.parseTemplate("wrapper",[t,this.settings]),e.input=e.scope.querySelector(this.settings.classNames.inputSelector),t.parentNode.insertBefore(e.scope,t))},destroy(){this.events.unbindGlobal.call(this),this.DOM.scope.parentNode.removeChild(this.DOM.scope),this.dropdown.hide(!0),clearTimeout(this.dropdownHide__bindEventsTimeout)},loadOriginalValues(t){var e,i=this.settings;if(this.state.blockChangeEvent=!0,void 0===t){const e=this.getPersistedData("value");t=e&&!this.DOM.originalInput.value?e:i.mixMode.integrated?this.DOM.input.textContent:this.DOM.originalInput.value}if(this.removeAllTags(),t)if("mix"==i.mode)this.parseMixTags(this.trim(t)),(e=this.DOM.input.lastChild)&&"BR"==e.tagName||this.DOM.input.insertAdjacentHTML("beforeend","<br>");else{try{JSON.parse(t)instanceof Array&&(t=JSON.parse(t))}catch(t){}this.addTags(t).forEach((t=>t&&t.classList.add(i.classNames.tagNoAnimation)))}else this.postUpdate();this.state.lastOriginalValueReported=i.mixMode.integrated?"":this.DOM.originalInput.value,this.state.blockChangeEvent=!1},cloneEvent(t){var e={};for(var i in t)e[i]=t[i];return e},loading(t){return this.state.isLoading=t,this.DOM.scope.classList[t?"add":"remove"](this.settings.classNames.scopeLoading),this},tagLoading(t,e){return t&&t.classList[e?"add":"remove"](this.settings.classNames.tagLoading),this},toggleClass(t,e){"string"==typeof t&&this.DOM.scope.classList.toggle(t,e)},toggleFocusClass(t){this.toggleClass(this.settings.classNames.focus,!!t)},triggerChangeEvent:function(){if(!this.settings.mixMode.integrated){var t=this.DOM.originalInput,e=this.state.lastOriginalValueReported!==t.value,i=new CustomEvent("change",{bubbles:!0});e&&(this.state.lastOriginalValueReported=t.value,i.simulated=!0,t._valueTracker&&t._valueTracker.setValue(Math.random()),t.dispatchEvent(i),this.trigger("change",this.state.lastOriginalValueReported),t.value=this.state.lastOriginalValueReported)}},events:b,fixFirefoxLastTagNoCaret(){},placeCaretAfterNode(t){if(t&&t.parentNode){var e=t.nextSibling,i=window.getSelection(),s=i.getRangeAt(0);i.rangeCount&&(s.setStartAfter(e||t),s.collapse(!0),i.removeAllRanges(),i.addRange(s))}},insertAfterTag(t,e){if(e=e||this.settings.mixMode.insertAfterTag,t&&t.parentNode&&e)return e="string"==typeof e?document.createTextNode(e):e,t.parentNode.insertBefore(e,t.nextSibling),e},editTag(t,e){t=t||this.getLastTag(),e=e||{},this.dropdown.hide();var i=this.settings;function s(){return t.querySelector(i.classNames.tagTextSelector)}var a=s(),n=this.getNodeIndex(t),o=this.tagData(t),r=this.events.callbacks,l=this,h=!0;if(a){if(!(o instanceof Object&&"editable"in o)||o.editable)return a.setAttribute("contenteditable",!0),t.classList.add(i.classNames.tagEditing),this.tagData(t,{__originalData:d({},o),__originalHTML:t.innerHTML}),a.addEventListener("focus",r.onEditTagFocus.bind(this,t)),a.addEventListener("blur",(function(){setTimeout((()=>r.onEditTagBlur.call(l,s())))})),a.addEventListener("input",r.onEditTagInput.bind(this,a)),a.addEventListener("keydown",(e=>r.onEditTagkeydown.call(this,e,t))),a.focus(),this.setRangeAtStartEnd(!1,a),e.skipValidation||(h=this.editTagToggleValidity(t)),a.originalIsValid=h,this.trigger("edit:start",{tag:t,index:n,data:o,isValid:h}),this}else console.warn("Cannot find element in Tag template: .",i.classNames.tagTextSelector)},editTagToggleValidity(t,e){var i;if(e=e||this.tagData(t))return(i=!("__isValid"in e)||!0===e.__isValid)||this.removeTagsFromValue(t),this.update(),t.classList.toggle(this.settings.classNames.tagNotAllowed,!i),e.__isValid;console.warn("tag has no data: ",t,e)},onEditTagDone(t,e){e=e||{};var i={tag:t=t||this.state.editing.scope,index:this.getNodeIndex(t),previousData:this.tagData(t),data:e};this.trigger("edit:beforeUpdate",i,{cloneData:!1}),this.state.editing=!1,delete e.__originalData,delete e.__originalHTML,t&&e[this.settings.tagTextProp]?(t=this.replaceTag(t,e),this.editTagToggleValidity(t,e),this.settings.a11y.focusableTags?t.focus():this.placeCaretAfterNode(t.previousSibling)):t&&this.removeTags(t),this.trigger("edit:updated",i),this.dropdown.hide(),this.settings.keepInvalidTags&&this.reCheckInvalidTags()},replaceTag(t,e){e&&e.value||(e=t.__tagifyTagData),e.__isValid&&1!=e.__isValid&&d(e,this.getInvalidTagAttrs(e,e.__isValid));var i=this.createTagElem(e);return t.parentNode.replaceChild(i,t),this.updateValueByDOMTags(),i},updateValueByDOMTags(){this.value.length=0,[].forEach.call(this.getTagElms(),(t=>{t.classList.contains(this.settings.classNames.tagNotAllowed.split(" ")[0])||this.value.push(this.tagData(t))})),this.update()},setRangeAtStartEnd(t,e){t="number"==typeof t?t:!!t,e=(e=e||this.DOM.input).lastChild||e;var i=document.getSelection();try{i.rangeCount>=1&&["Start","End"].forEach((s=>i.getRangeAt(0)["set"+s](e,t||e.length)))}catch(t){}},injectAtCaret(t,e){if(e=e||this.state.selection.range)return"string"==typeof t&&(t=document.createTextNode(t)),e.deleteContents(),e.insertNode(t),this.setRangeAtStartEnd(!1,t),this.updateValueByDOMTags(),this.update(),this},input:{set(t="",e=!0){var i=this.settings.dropdown.closeOnSelect;this.state.inputText=t,e&&(this.DOM.input.innerHTML=r(""+t)),!t&&i&&this.dropdown.hide.bind(this),this.input.autocomplete.suggest.call(this),this.input.validate.call(this)},raw(){return this.DOM.input.textContent},validate(){var t=!this.state.inputText||!0===this.validateTag({value:this.state.inputText});return this.DOM.input.classList.toggle(this.settings.classNames.inputInvalid,!t),t},normalize(t){var e=t||this.DOM.input,i=[];e.childNodes.forEach((t=>3==t.nodeType&&i.push(t.nodeValue))),i=i.join("\n");try{i=i.replace(/(?:\r\n|\r|\n)/g,this.settings.delimiters.source.charAt(0))}catch(t){}return i=i.replace(/\s/g," "),this.settings.trim&&(i=i.replace(/^\s+/,"")),i},autocomplete:{suggest(t){if(this.settings.autoComplete.enabled){"string"==typeof(t=t||{})&&(t={value:t});var e=t.value?""+t.value:"",i=e.substr(0,this.state.inputText.length).toLowerCase(),s=e.substring(this.state.inputText.length);e&&this.state.inputText&&i==this.state.inputText.toLowerCase()?(this.DOM.input.setAttribute("data-suggest",s),this.state.inputSuggestion=t):(this.DOM.input.removeAttribute("data-suggest"),delete this.state.inputSuggestion)}},set(t){var e=this.DOM.input.getAttribute("data-suggest"),i=t||(e?this.state.inputText+e:null);return!!i&&("mix"==this.settings.mode?this.replaceTextWithNode(document.createTextNode(this.state.tag.prefix+i)):(this.input.set.call(this,i),this.setRangeAtStartEnd()),this.input.autocomplete.suggest.call(this),this.dropdown.hide(),!0)}}},getTagIdx(t){return this.value.findIndex((e=>e.__tagId==(t||{}).__tagId))},getNodeIndex(t){var e=0;if(t)for(;t=t.previousElementSibling;)e++;return e},getTagElms(...t){var e="."+[...this.settings.classNames.tag.split(" "),...t].join(".");return[].slice.call(this.DOM.scope.querySelectorAll(e))},getLastTag(){var t=this.DOM.scope.querySelectorAll(`${this.settings.classNames.tagSelector}:not(.${this.settings.classNames.tagHide}):not([readonly])`);return t[t.length-1]},tagData:(t,e,i)=>t?(e&&(t.__tagifyTagData=i?e:d({},t.__tagifyTagData||{},e)),t.__tagifyTagData):(console.warn("tag element doesn't exist",t,e),e),isTagDuplicate(t,e){var i=this.settings;return"select"!=i.mode&&this.value.reduce(((a,n)=>s(this.trim(""+t),n.value,e||i.dropdown.caseSensitive)?a+1:a),0)},getTagIndexByValue(t){var e=[];return this.getTagElms().forEach(((i,a)=>{s(this.trim(i.textContent),t,this.settings.dropdown.caseSensitive)&&e.push(a)})),e},getTagElmByValue(t){var e=this.getTagIndexByValue(t)[0];return this.getTagElms()[e]},flashTag(t){t&&(t.classList.add(this.settings.classNames.tagFlash),setTimeout((()=>{t.classList.remove(this.settings.classNames.tagFlash)}),100))},isTagBlacklisted(t){return t=this.trim(t.toLowerCase()),this.settings.blacklist.filter((e=>(""+e).toLowerCase()==t)).length},isTagWhitelisted(t){return!!this.getWhitelistItem(t)},getWhitelistItem(t,e,i){e=e||"value";var a,n=this.settings;return(i=i||n.whitelist).some((i=>{var o="string"==typeof i?i:i[e]||i.value;if(s(o,t,n.dropdown.caseSensitive,n.trim))return a="string"==typeof i?{value:i}:i,!0})),a||"value"!=e||"value"==n.tagTextProp||(a=this.getWhitelistItem(t,n.tagTextProp,i)),a},validateTag(t){var e=this.settings,i="value"in t?"value":e.tagTextProp,s=this.trim(t[i]+"");return(t[i]+"").trim()?e.pattern&&e.pattern instanceof RegExp&&!e.pattern.test(s)?this.TEXTS.pattern:!e.duplicates&&this.isTagDuplicate(s,this.state.editing)?this.TEXTS.duplicate:this.isTagBlacklisted(s)||e.enforceWhitelist&&!this.isTagWhitelisted(s)?this.TEXTS.notAllowed:!e.validate||e.validate(t):this.TEXTS.empty},getInvalidTagAttrs(t,e){return{"aria-invalid":!0,class:`${t.class||""} ${this.settings.classNames.tagNotAllowed}`.trim(),title:e}},hasMaxTags(){return this.value.length>=this.settings.maxTags&&this.TEXTS.exceed},setReadonly(t,e){var i=this.settings;document.activeElement.blur(),i[e||"readonly"]=t,this.DOM.scope[(t?"set":"remove")+"Attribute"](e||"readonly",!0),"mix"==i.mode&&this.setContentEditable(!t)},setContentEditable(t){!this.settings.readonly&&this.settings.userInput&&(this.DOM.input.contentEditable=t)},setDisabled(t){this.setReadonly(t,"disabled")},normalizeTags(t){var e=this.settings,i=e.whitelist,s=e.delimiters,a=e.mode,n=e.tagTextProp;e.enforceWhitelist;var o=[],r=!!i&&i[0]instanceof Object,l=t instanceof Array,d=t=>(t+"").split(s).filter((t=>t)).map((t=>({[n]:this.trim(t),value:this.trim(t)})));if("number"==typeof t&&(t=t.toString()),"string"==typeof t){if(!t.trim())return[];t=d(t)}else l&&(t=[].concat(...t.map((t=>t.value?t:d(t)))));return r&&(t.forEach((t=>{var e=o.map((t=>t.value)),i=this.dropdown.filterListItems.call(this,t[n],{exact:!0});this.settings.duplicates||(i=i.filter((t=>!e.includes(t.value))));var s=i.length>1?this.getWhitelistItem(t[n],n,i):i[0];s&&s instanceof Object?o.push(s):"mix"!=a&&(null==t.value&&(t.value=t[n]),o.push(t))})),o.length&&(t=o)),t},parseMixTags(t){var e=this.settings,i=e.mixTagsInterpolator,s=e.duplicates,a=e.transformTag,n=e.enforceWhitelist,o=e.maxTags,r=e.tagTextProp,l=[];return t=t.split(i[0]).map(((t,e)=>{var d,h,g,c=t.split(i[1]),p=c[0],u=l.length==o;try{if(p==+p)throw Error;h=JSON.parse(p)}catch(t){h=this.normalizeTags(p)[0]||{value:p}}if(a.call(this,h),u||!(c.length>1)||n&&!this.isTagWhitelisted(h.value)||!s&&this.isTagDuplicate(h.value)){if(t)return e?i[0]+t:t}else h[d=h[r]?r:"value"]=this.trim(h[d]),g=this.createTagElem(h),l.push(h),g.classList.add(this.settings.classNames.tagNoAnimation),c[0]=g.outerHTML,this.value.push(h);return c.join("")})).join(""),this.DOM.input.innerHTML=t,this.DOM.input.appendChild(document.createTextNode("")),this.DOM.input.normalize(),this.getTagElms().forEach(((t,e)=>this.tagData(t,l[e]))),this.update({withoutChangeEvent:!0}),t},replaceTextWithNode(t,e){if(this.state.tag||e){e=e||this.state.tag.prefix+this.state.tag.value;var i,s,a=window.getSelection(),n=a.anchorNode,o=this.state.tag.delimiters?this.state.tag.delimiters.length:0;return n.splitText(a.anchorOffset-o),-1==(i=n.nodeValue.lastIndexOf(e))?!0:(s=n.splitText(i),t&&n.parentNode.replaceChild(t,s),!0)}},selectTag(t,e){var i=this.settings;if(!i.enforceWhitelist||this.isTagWhitelisted(e.value)){this.input.set.call(this,e[i.tagTextProp]||e.value,!0),this.state.actions.selectOption&&setTimeout(this.setRangeAtStartEnd.bind(this));var s=this.getLastTag();return s?this.replaceTag(s,e):this.appendTag(t),i.enforceWhitelist&&this.setContentEditable(!1),this.value[0]=e,this.update(),this.trigger("add",{tag:t,data:e}),[t]}},addEmptyTag(t){var e=d({value:""},t||{}),i=this.createTagElem(e);this.tagData(i,e),this.appendTag(i),this.editTag(i,{skipValidation:!0})},addTags(t,e,i){var s=[],a=this.settings,n=document.createDocumentFragment();return i=i||a.skipInvalid,t&&0!=t.length?(t=this.normalizeTags(t),"mix"==a.mode?this.addMixTags(t):("select"==a.mode&&(e=!1),this.DOM.input.removeAttribute("style"),t.forEach((t=>{var e,o={},r=Object.assign({},t,{value:t.value+""});if(t=Object.assign({},r),a.transformTag.call(this,t),t.__isValid=this.hasMaxTags()||this.validateTag(t),!0!==t.__isValid){if(i)return;d(o,this.getInvalidTagAttrs(t,t.__isValid),{__preInvalidData:r}),t.__isValid==this.TEXTS.duplicate&&this.flashTag(this.getTagElmByValue(t.value))}if("readonly"in t&&(t.readonly?o["aria-readonly"]=!0:delete t.readonly),e=this.createTagElem(t,o),s.push(e),"select"==a.mode)return this.selectTag(e,t);n.appendChild(e),t.__isValid&&!0===t.__isValid?(this.value.push(t),this.trigger("add",{tag:e,index:this.value.length-1,data:t})):(this.trigger("invalid",{data:t,index:this.value.length,tag:e,message:t.__isValid}),a.keepInvalidTags||setTimeout((()=>this.removeTags(e,!0)),1e3)),this.dropdown.position()})),this.appendTag(n),this.update(),t.length&&e&&this.input.set.call(this),this.dropdown.refilter(),s)):("select"==a.mode&&this.removeAllTags(),s)},addMixTags(t){if((t=this.normalizeTags(t))[0].prefix||this.state.tag)return this.prefixedTextToTag(t[0]);"string"==typeof t&&(t=[{value:t}]);var e=!!this.state.selection,i=document.createDocumentFragment();return t.forEach((t=>{var e=this.createTagElem(t);i.appendChild(e),this.insertAfterTag(e)})),e?this.injectAtCaret(i):(this.DOM.input.focus(),(e=this.setStateSelection()).range.setStart(this.DOM.input,e.range.endOffset),e.range.setEnd(this.DOM.input,e.range.endOffset),this.DOM.input.appendChild(i),this.updateValueByDOMTags(),this.update()),i},prefixedTextToTag(t){var e,i=this.settings,s=this.state.tag.delimiters;if(i.transformTag.call(this,t),t.prefix=t.prefix||this.state.tag?this.state.tag.prefix:(i.pattern.source||i.pattern)[0],e=this.createTagElem(t),this.replaceTextWithNode(e)||this.DOM.input.appendChild(e),setTimeout((()=>e.classList.add(this.settings.classNames.tagNoAnimation)),300),this.value.push(t),this.update(),!s){var a=this.insertAfterTag(e)||e;this.placeCaretAfterNode(a)}return this.state.tag=null,this.trigger("add",d({},{tag:e},{data:t})),e},appendTag(t){var e=this.DOM,i=e.scope.lastElementChild;i===e.input?e.scope.insertBefore(t,i):e.scope.appendChild(t)},createTagElem(t,i){t.__tagId=([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,(t=>(t^crypto.getRandomValues(new Uint8Array(1))[0]&15>>t/4).toString(16)));var s,a=d({},t,e({value:r(t.value+"")},i));return function(t){for(var e,i=document.createNodeIterator(t,NodeFilter.SHOW_TEXT,null,!1);e=i.nextNode();)e.textContent.trim()||e.parentNode.removeChild(e)}(s=this.parseTemplate("tag",[a])),this.tagData(s,t),s},reCheckInvalidTags(){var t=this.settings;this.getTagElms(t.classNames.tagNotAllowed).forEach(((t,e)=>{var i=this.tagData(t),s=this.hasMaxTags(),a=this.validateTag(i);if(!0===a&&!s)return i=i.__preInvalidData?i.__preInvalidData:{value:i.value},this.replaceTag(t,i);t.title=s||a}))},removeTags(t,e,i){var s;if(t=t&&t instanceof HTMLElement?[t]:t instanceof Array?t:t?[t]:[this.getLastTag()],s=t.reduce(((t,e)=>{e&&"string"==typeof e&&(e=this.getTagElmByValue(e));var i=this.tagData(e);return e&&i&&!i.readonly&&t.push({node:e,idx:this.getTagIdx(i),data:this.tagData(e,{__removed:!0})}),t}),[]),i="number"==typeof i?i:this.CSSVars.tagHideTransition,"select"==this.settings.mode&&(i=0,this.input.set.call(this)),1==s.length&&s[0].node.classList.contains(this.settings.classNames.tagNotAllowed)&&(e=!0),s.length)return this.settings.hooks.beforeRemoveTag(s,{tagify:this}).then((()=>{function t(t){t.node.parentNode&&(t.node.parentNode.removeChild(t.node),e?this.settings.keepInvalidTags&&this.trigger("remove",{tag:t.node,index:t.idx}):(this.trigger("remove",{tag:t.node,index:t.idx,data:t.data}),this.dropdown.refilter(),this.dropdown.position(),this.DOM.input.normalize(),this.settings.keepInvalidTags&&this.reCheckInvalidTags()))}i&&i>10&&1==s.length?function(e){e.node.style.width=parseFloat(window.getComputedStyle(e.node).width)+"px",document.body.clientTop,e.node.classList.add(this.settings.classNames.tagHide),setTimeout(t.bind(this),i,e)}.call(this,s[0]):s.forEach(t.bind(this)),e||(this.removeTagsFromValue(s.map((t=>t.node))),this.update(),"select"==this.settings.mode&&this.setContentEditable(!0))})).catch((t=>{}))},removeTagsFromDOM(){[].slice.call(this.getTagElms()).forEach((t=>t.parentNode.removeChild(t)))},removeTagsFromValue(t){(t=Array.isArray(t)?t:[t]).forEach((t=>{var e=this.tagData(t),i=this.getTagIdx(e);i>-1&&this.value.splice(i,1)}))},removeAllTags(t){t=t||{},this.value=[],"mix"==this.settings.mode?this.DOM.input.innerHTML="":this.removeTagsFromDOM(),this.dropdown.position(),"select"==this.settings.mode&&(this.input.set.call(this),this.setContentEditable(!0)),this.update(t)},postUpdate(){var t=this.settings.classNames,e="mix"==this.settings.mode?this.settings.mixMode.integrated?this.DOM.input.textContent:this.DOM.originalInput.value.trim():this.value.length+this.input.raw.call(this).length;this.toggleClass(t.hasMaxTags,this.value.length>=this.settings.maxTags),this.toggleClass(t.hasNoTags,!this.value.length),this.toggleClass(t.empty,!e)},setOriginalInputValue(t){var e=this.DOM.originalInput;this.settings.mixMode.integrated||(e.value=t,e.tagifyValue=e.value,this.setPersistedData(t,"value"))},update(t){var e=this.getInputValue();this.setOriginalInputValue(e),this.postUpdate(),(t||{}).withoutChangeEvent||this.state.blockChangeEvent||this.triggerChangeEvent()},getInputValue(){var t=this.getCleanValue();return"mix"==this.settings.mode?this.getMixedTagsAsString(t):t.length?this.settings.originalInputValueFormat?this.settings.originalInputValueFormat(t):JSON.stringify(t):""},getCleanValue(t){return e=t||this.value,i=this.dataProps,e&&Array.isArray(e)&&e.map((t=>a(t,i)));var e,i},getMixedTagsAsString(){var t="",e=this,i=this.settings.mixTagsInterpolator;return function s(n){n.childNodes.forEach((n=>{if(1==n.nodeType){const o=e.tagData(n);if("BR"==n.tagName&&(t+="\r\n"),"DIV"==n.tagName||"P"==n.tagName)t+="\r\n",s(n);else if(c.call(e,n)&&o){if(o.__removed)return;t+=i[0]+JSON.stringify(a(o,e.dataProps))+i[1]}}else t+=n.textContent}))}(this.DOM.input),t}},y.prototype.removeTag=y.prototype.removeTags,y}));

function orderKeys(obj) {

  var keys = Object.keys(obj).sort(function keyOrder(k1, k2) {
      if (k1 < k2) return -1;
      else if (k1 > k2) return +1;
      else return 0;
  });

  var i, after = {};
  for (i = 0; i < keys.length; i++) {
    after[keys[i]] = obj[keys[i]];
    delete obj[keys[i]];
  }

  for (i = 0; i < keys.length; i++) {
    obj[keys[i]] = after[keys[i]];
    //recurse
    if (obj[keys[i]] instanceof Object) {
             obj[keys[i]] = orderKeys(obj[keys[i]]);
    }
  }
  return obj;
}

function cloneJSON(obj) {
    // basic type deep copy
    if (obj === null || obj === undefined || typeof obj !== 'object' || obj === "")  {
        return obj
    }
    // array deep copy
    if (obj instanceof Array) {
        var cloneA = [];
        for (var i = 0; i < obj.length; ++i) {
            cloneA[i] = cloneJSON(obj[i]);
        }
        if(cloneA.length > 0) {   
            return cloneA;
        } else {
            return null;
        }
    }        
    // object deep copy
    var cloneO = {};   
    for (var i in obj) {
        var c = cloneJSON(obj[i]);
        if(c !== null && c !== "") {
            cloneO[i] = c;
        }
    }
    return cloneO;
};

var textUtil = {
jsonView: function(obj) {
    if (obj instanceof Array) {
        var ret = '<table>'; 
        for(var k in obj) {
            ret = ret + '<tr><td>' + this.jsonView(obj)+ '</td></tr>';
        }
        return(ret + '</table>');
    } else if (obj instanceof Object) {
        var ret = '<div>';
        for (var k in obj){
            if (obj.hasOwnProperty(k)){
                ret = ret + '<div><b>' + k + '</b>: ' + this.jsonView(obj[k]) + '</div>';
            }
        }
        return ret + '</div>'
    } else {
        return obj;
    };
},
reduceJSON: function (cve) {
    //todo: this is to create a duplcate object
    // needs cleaner implementation
    var c = cloneJSON(cve);
    delete c.CNA_private;
    if (c.description && c.description.description_data) {
        var merged = {};
        var d;
        for (d of c.description.description_data) {
            if (d && d.lang) {
                if (!merged[d.lang]) {
                    merged[d.lang] = [];
                }
                merged[d.lang].push(d.value);
            }
        }
        var new_d = [];
        for (var m in merged) {
            new_d.push({
                lang: m,
                value: merged[m].join("\n")
            });
        }
        c.description.description_data = new_d;
    }
    if(c.impact && c.impact.cvss && c.impact.cvss.baseScore === 0) {
        delete c.impact;    
    }
    return(orderKeys(c));
},

getMITREJSON: function(cve) {
    return JSON.stringify(cve, null, "  ");
},
getPR: function(cve) {
    var matches = [];
    var re = /PRs?[ \t]+((or|and|[0-9\t\ \,])+)/igm;
    var m;
    while((m = re.exec(cve.solution)) !== null) {
        var prs = m[1].trim().split(/[ \t,andor]{1,}/).filter(x => x);
        matches = matches.concat(prs);
    }
    return matches;
},

getAffectedProductString: function (cve) {
    var status={};
    var lines = [];
    for (var vendor of cve.affects.vendor.vendor_data) {
        var vendor_name = vendor.vendor_name;
        for(var product of vendor.product.product_data) {
            for(var version of product.version.version_data) {
                var vv = version.version_value;
                var cat = "affected";
                if(version.version_affected) {
                    if(version.version_affected.startsWith('?')) {
                        cat = "unknown";
                    } else if (version.version_affected.startsWith('!')) {
                        cat = "unaffected";
                    }
                    var prefix = product.product_name  + " ";
                    if(version.version_name && version.version_name != "") {
                        prefix += version.version_name + " ";
                    }
                    switch (version.version_affected) {
                        case "!":
                        case "?":
                        case "=":
                            vv = version.version_value;
                            break;
                        case "<":
                        case "!<":
                        case "?<":
                            vv = prefix + "versions earlier than " + version.version_value;
                            break;
                        case ">":
                        case "?>":
                            vv = prefix + "versions later than " + version.version_value;
                            break;
                        case "<=":
                        case "!<=":
                        case "?<=":
                            vv = product.product_name  + " " + version.version_value + " and earlier versions";
                            break;
                        case ">=":
                        case "!>=":
                        case "?>=":
                            vv = product.product_name  + " " + version.version_value + " and later versions";
                            break;
                        default:
                            vv = version.version_value;
                    }
                }
                if (version.platform) {
                    vv = vv + " on " + version.platform;
                }
                
                if (!status[cat]) {
                    status[cat] = {};
                }
                if(!status[cat][vendor_name + ' ' + product.product_name]) {
                    status[cat][vendor_name + ' ' + product.product_name] = [];
                }
                status[cat][vendor_name + ' ' + product.product_name].push(vv);
            }
        }
    }
    var stringifyArray = function(ob) {
        var ret = [];
        for(var p in ob) {
            ret.push(p + "\n" + ob[p].join(';\n') + ".");
        }
        return ret.join('\n');
    }
    var ret = [];
    if (status.affected) {
        ret.push('This issue affects:\n' + stringifyArray(status.affected));
    }
    if (status.unaffected) {
        ret.push('This issue does not affect:\n' + stringifyArray(status.unaffected));
    }
    if (status.unknown) {
        ret.push('It is not known whether this issue affects:\n' + stringifyArray(status.unknown));
    }
    return ret.join('\n\n');
},
affectedTable: function (cve) {
    var status={};
    for (var vendor of cve.affects.vendor.vendor_data) {
        var vendor_name = vendor.vendor_name;
        if(!status[vendor_name]) {
            status[vendor_name] = {};
        }
        for(var product of vendor.product.product_data) {
            var product_name = product.product_name;
            if(!status[vendor_name][product_name]) {
                status[vendor_name][product_name] = {};
            }
            for(var version of product.version.version_data) {
                var vv = version.version_value;
                var cat = "affected";
                var prefix = vn = "";
                if(version.version_name && version.version_name != "") {
                    vn = version.version_name;
                }
                if(version.version_affected) {
                    if(version.version_affected.startsWith('?')) {
                        cat = "unknown";
                    } else if (version.version_affected.startsWith('!')) {
                        cat = "unaffected";
                    }
                    switch (version.version_affected) {
                        case "!":
                        case "?":
                        case "=":
                            vv = version.version_value;
                            break;
                        case "<":
                        case "!<":
                        case "?<":
                            vv = "< " + version.version_value;
                            break;
                        case ">":
                        case "?>":
                            vv = "> " + version.version_value;
                            break;
                        case "<=":
                        case "!<=":
                        case "?<=":
                            vv = "<= " + version.version_value;
                            break;
                        case ">=":
                        case "!>=":
                        case "?>=":
                            vv = ">= " + version.version_value;
                            break;
                        default:
                            vv = version.version_value;
                    }
                }
                if(version.platform && version.platform != "") {
                    vv += ' on ' + version.platform;
                }
                if(!status[vendor_name][product_name][vn]) {
                    status[vendor_name][product_name][vn] = {};
                }
                
                if (!status[vendor_name][product_name][vn][cat]) {
                    status[vendor_name][product_name][vn][cat] = [];
                }
                status[vendor_name][product_name][vn][cat].push(vv);
            }
        }
    }
    return status;
},
appliesTo: function(affects){
    var ret = [];
    for (var vendor of affects.vendor.vendor_data) {
        var vendor_name = vendor.vendor_name;
        for(var product of vendor.product.product_data) {
            var product_name = product.product_name;
            for(var version of product.version.version_data) {
                var vv = version.version_value;
                var prefix = vn = "";
                if(version.version_name && version.version_name != "") {
                    vn = version.version_name;
                }
                if(version.version_affected) {
                    if(version.version_affected.startsWith('?')) {
                        cat = "unknown";
                    } else if (version.version_affected.startsWith('!')) {
                        cat = "no";
                    }
                    switch (version.version_affected) {
                        case "=":
                        case "<":
                        case ">":
                        case "<=":
                        case ">=":
                            ret.push(product_name + ' ' + vn);
                            break;
                    }
                }
            }
        }
    }
    return ret;
},
affectedYesNo: function(affects){
    var status={yes:[],no:[],unknown:[]};
    for (var vendor of affects.vendor.vendor_data) {
        var vendor_name = vendor.vendor_name;
        for(var product of vendor.product.product_data) {
            var product_name = product.product_name;
            for(var version of product.version.version_data) {
                var vv = version.version_value;
                var cat = "yes";
                var prefix = vn = "";
                if(version.version_name && version.version_name != "") {
                    vn = version.version_name;
                }
                if(version.version_affected) {
                    if(version.version_affected.startsWith('?')) {
                        cat = "unknown";
                    } else if (version.version_affected.startsWith('!')) {
                        cat = "no";
                    }
                    switch (version.version_affected) {
                        case "!":
                        case "?":
                        case "=":
                            vv = version.version_value;
                            break;
                        case "<":
                        case "!<":
                        case "?<":
                            vv = "< " + version.version_value;
                            break;
                        case ">":
                        case "?>":
                            vv = "> " + version.version_value;
                            break;
                        case "<=":
                        case "!<=":
                        case "?<=":
                            vv = "<= " + version.version_value;
                            break;
                        case ">=":
                        case "!>=":
                        case "?>=":
                            vv = ">= " + version.version_value;
                            break;
                        default:
                            vv = version.version_value;
                    }
                    if(version.platform && version.platform != "") {
                            vv += ' on ' + version.platform;
                    }
                }
                var ph = status[cat][product_name];
                if(ph == undefined) {
                    ph = status[cat][product_name] = {};
                }
                vns = ph.version_names;
                if(vns == undefined) {
                    vns = ph.version_names = []
                }
                if(vns.indexOf(vn)<0) {
                    vns.push(vn);
                }
                vvs = ph.version_values;
                if(vvs == undefined) {
                    vvs = ph.version_values = []
                }
                if(vvs.indexOf(vv)<0) {
                    vvs.push(vv);
                }
            }
        }
    }
    var rstatus = {yes:[],no:[],unknown:[]};
    for (var cat of ['yes','no','unknown']){
        for(var p in status[cat]) {
           rstatus[cat].push({product:p, version_names:status[cat][p].version_names, version_values: status[cat][p].version_values})
        }
    }
    return rstatus;
},

mergeJSON : function (target, add) {
    function isObject(obj) {
        if (typeof obj == "object") {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    return true; 
                }
            }
        }
        return false;
    }
    for (var key in add) {
        if (key === "__proto__" || key === "constructor") continue;
        if (add.hasOwnProperty(key)) {
            if (target[key] && isObject(target[key]) && isObject(add[key])) {
                this.mergeJSON(target[key], add[key]);
            } else {
                target[key] = add[key];
            }
        }
    }
    return target;
},
timeSince: function(date) {

  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = Math.floor(seconds / 31536000);

  if (interval > 1) {
    return interval + " years";
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return interval + " months";
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return interval + " days";
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return interval + " hours";
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return interval + " minutes";
  }
  return Math.floor(seconds) + " seconds";
},
/**
 * Takes an ISO date-time string and renders it in a user-friendly format
 * based on its recency.
 *
 * - If the date is today, shows the local time (e.g., "12:43 PM").
 * - If the date is this year (but not today), shows "MMM DD" (e.g., "Nov 14").
 * - If the date is a previous year, shows "YYYY MMM DD" (e.g., "2024 Nov 14").
 *
 * @param {string} isoString A string representing a date in ISO format.
 * @returns {string} A formatted, user-friendly date string.
 */
formatFriendlyDate: function (isoString) {
  const date = new Date(isoString);
  const now = new Date();

  // Create date objects for comparison, stripping out the time part.
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const inputDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Case 1: The date is today
  if (inputDateOnly.getTime() === today.getTime()) {
    return date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }).toLocaleLowerCase();
  }

  // Case 2: The date is this year (but not today)
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  }

  // Case 3: The date is from a previous year
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
},
//determine next bundle date
nextPatchDay : function (dateString, weekday) {
  const n = 2; //2nd Wednesday
  var date = new Date(dateString);
  var monthstogo = (12-date.getMonth()) % 3;

  var count = 0,
  idate = new Date(date.getFullYear(), date.getMonth()+ monthstogo, 1);

  while (true) {
    if (idate.getDay() === weekday) {
      if (++count == n) {
        break;
      }
    }
    idate.setDate(idate.getDate() + 1);
  }
  if (idate < date) {
      return this.nextPatchDay(date.setMonth(date.getMonth()+1), weekday);
  } else {
    return idate;
  }
},
deep_value: function(obj, path) {
    var ret = obj;
    for (var i=0, path=path.split('.'), len=path.length; i<len; i++){
        ret = ret[path[i]];
        if (ret === undefined) {
            break;
        }
    };
    return ret;
},
getDocuments: async function(schemaName, ids, paths) {
    const res = await fetch('/' + schemaName + '/json/', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            redirect: 'error',
            body: JSON.stringify({ids:ids,fields:paths})
    });
    const docs = await res.json();
    return docs;
},
    
    diffline: function(line1, line2) {
        var ret1 = [];
        var ret2 = [];
        var s = 0;
        var m = line1.length - 1;
        var n = line2.length - 1;
        while (s <= m && s <= n && (line1.charAt(s) == line2.charAt(s))) {
            s++;
        }

        while (s <= m && s <= n && (line1.charAt(m) == line2.charAt(n))) {
            m--;
            n--;
        }

        // deleted
        if (s <= m) {
            ret1.push({t:0, str: line1.substring(0, s)});
            //StringBuilder sb = new StringBuilder();
            //sb.append(Util.htmlize(line1.substring(0, s)));
            ret1.push({t:1, str: line1.substring(s, m + 1)});
            ret1.push({t:0, str: line1.substring(m+1, line1.length)}); 
            //sb.append(Util.htmlize(line1.substring(m + 1, line1.length())));
            //ret1.push({t:0, str: line1.substring(0, s)}) 
            //    = sb.toString();
        } else {
            ret1.push({t:0, str: line1});
            //ret[0] = Util.htmlize(line1.toString()); // no change
        }

        // added
        if (s <= n) {
            ret2.push({t:0,str:line2.substring(0, s)});
            ret2.push({t:1,str:line2.substring(s, n + 1)});
            ret2.push({t:0,str:line2.substring(n + 1, line2.length)});
            //StringBuilder sb = new StringBuilder();
            //sb.append(Util.htmlize(line2.substring(0, s)));
            //sb.append(HtmlConsts.SPAN_A);
            //sb.append(Util.htmlize(line2.substring(s, n + 1)));
            //sb.append(HtmlConsts.ZSPAN);
            //sb.append(Util.htmlize(line2.substring(n + 1, line2.length())));
            //ret[1] = sb.toString();
        } else {
            ret2.push({t:0,str: line2});
            //ret[1] = Util.htmlize(line2.toString()); // no change
        }

        return {lhs: ret1, rhs: ret2};
    },
    fileSize : function(a,b,c,d,e){
        return (b=Math,c=b.log,d=1024,e=c(a)/c(d)|0,a/b.pow(d,e)).toFixed(2)
            +' '+(e?'KMGTPEZY'[--e]+'B':'Bytes')
    }
};
if(typeof module !== 'undefined') {
    module.exports = textUtil;
}
var cvssjs = {
    vectorMap4: {
        "attackVector": "AV",
        "attackComplexity": "AC",
        "attackRequirements": "AT",
        "privilegesRequired": "PR",
        "userInteraction": "UI",
        "vulnConfidentialityImpact": "VC",
        "vulnIntegrityImpact": "VI",
        "vulnAvailabilityImpact": "VA",
        "subConfidentialityImpact": "SC",
        "subIntegrityImpact": "SI",
        "subAvailabilityImpact": "SA",
        "exploitMaturity": "E",
        "Safety": "S",
        "Automatable": "AU",
        "Recovery": "R",
        "valueDensity": "V",
        "vulnerabilityResponseEffort": "RE",
        "providerUrgency": "U"
    },
    metricMap4: {
        "AV": "attackVector",
        "AC": "attackComplexity",
        "AT": "attackRequirements",
        "PR": "privilegesRequired",
        "UI": "userInteraction",
        "VC": "vulnConfidentialityImpact",
        "VI": "vulnIntegrityImpact",
        "VA": "vulnAvailabilityImpact",
        "SC": "subConfidentialityImpact",
        "SI": "subIntegrityImpact",
        "SA": "subAvailabilityImpact",
        "E": "exploitMaturity",
        "S": "Safety",
        "AU": "Automatable",
        "R": "Recovery",
        "V": "valueDensity",
        "RE": "vulnerabilityResponseEffort",
        "U": "providerUrgency",
    },
    vectorMap3: {
        "attackVector": "AV",
        "attackComplexity": "AC",
        "privilegesRequired": "PR",
        "userInteraction": "UI",
        "scope": "S",
        "confidentialityImpact": "C",
        "integrityImpact": "I",
        "availabilityImpact": "A"
    },
    vectorMap2: {
        "accessVector": "AV",
        "accessComplexity": "AC",
        "authentication": "Au",
        "confidentialityImpact": "C",
        "integrityImpact": "I",
        "availabilityImpact": "A"
    },

    // Define associative arrays mapping each metric value to the constant used in the CVSS scoring formula.
    Weight: {
        attackVector: {
            NETWORK: 0.85,
            ADJACENT_NETWORK: 0.62,
            LOCAL: 0.55,
            PHYSICAL: 0.2
        },
        attackComplexity: {
            HIGH: 0.44,
            LOW: 0.77
        },
        privilegesRequired: {
            UNCHANGED: {
                NONE: 0.85,
                LOW: 0.62,
                HIGH: 0.27
            },
            // These values are used if Scope is Unchanged
            CHANGED: {
                NONE: 0.85,
                LOW: 0.68,
                HIGH: 0.5
            }
        },
        // These values are used if Scope is Changed
        userInteraction: {
            NONE: 0.85,
            REQUIRED: 0.62
        },
        scope: {
            UNCHANGED: 6.42,
            CHANGED: 7.52
        },
        confidentialityImpact: {
            NONE: 0,
            LOW: 0.22,
            HIGH: 0.56
        },
        integrityImpact: {
            NONE: 0,
            LOW: 0.22,
            HIGH: 0.56
        },
        availabilityImpact: {
            NONE: 0,
            LOW: 0.22,
            HIGH: 0.56
        }
        // C, I and A have the same weights
    },
    valueMap: {
        "GREEN": "Green",
        "RED": "Red",
        "CLEAR": "Clear",
        "AMBER": "Amber"
    },
    cvss: {},
    m: function(m) {
        var metric = this.metricMap4[m];
        if (metric && this.cvss[metric]) {
            console.log(["M:", m, this.valueMap[this.cvss[metric]] || this.cvss[metric].charAt(0)]);
           return (this.valueMap[this.cvss[metric]] || this.cvss[metric].charAt(0));
        } else { 
            console.log("M:", m, "X!");
            return "X";
        }
    },
    vector4: function (cvss) {
        var sep = "/";
        var r = "CVSS:4.0";
        for (var m in this.vectorMap4) {
            if (this.vectorMap4[m] && cvss[m] && cvss[m] != 'NOT_DEFINED') {
                r += sep + this.vectorMap4[m] + ':' + (this.valueMap[cvss[m]] || cvss[m].charAt(0));
            }
        }
        return r;
    },
    vector3: function (cvss) {
        var sep = "/";
        var r = "CVSS:3.1";
        for (var m in cvss) {
            if (this.vectorMap3[m] && cvss[m]) {
                r += sep + this.vectorMap3[m] + ':' + cvss[m].charAt(0);
            }
        }
        return r;

    },
    vector2: function (cvss) {
        var sep = "/";
        var r = [];
        for (var m in cvss) {
            if (this.vectorMap2[m] && cvss[m]) {
                r.push(this.vectorMap2[m] + ':' + cvss[m].charAt(0));
            }
        }
        return r.join('/');
    },
    CVSSseveritys: [{
        name: "NONE",
        bottom: 0.0,
        top: 0.0
   }, {
        name: "LOW",
        bottom: 0.1,
        top: 3.9
   }, {
        name: "MEDIUM",
        bottom: 4.0,
        top: 6.9
   }, {
        name: "HIGH",
        bottom: 7.0,
        top: 8.9
   }, {
        name: "CRITICAL",
        bottom: 9.0,
        top: 10.0
   }],
    severityLevel: function (score) {
        if (score == 0) {
            return 'NONE'
        } else if (score <= 3.9) {
            return 'LOW'
        } else if (score <= 6.9) {
            return 'MEDIUM'
        } else if (score <= 8.9) {
            return 'HIGH'
        } else {
            return 'CRITICAL'
        }
    },
    severity: function (score) {
        var i;
        var severityRatingLength = this.CVSSseveritys.length;
        for (i = 0; i < severityRatingLength; i++) {
            if (score >= this.CVSSseveritys[i].bottom && score <= this.CVSSseveritys[i].top) {
                return this.CVSSseveritys[i];
            }
        }
        return {
            name: "?",
            bottom: 'Not',
            top: 'defined'
        };
    },
    roundUp1: function Roundup(input) {
        var int_input = Math.round(input * 100000);
        if (int_input % 10000 === 0) {
            return int_input / 100000
        } else {
            return (Math.floor(int_input / 10000) + 1) / 10
        }
    },
    calculate3: function (cvss) {
        var cvssVersion = "3.1";
        var exploitabilityCoefficient = 8.22;
        var scopeCoefficient = 1.08;
        var p;
        var val = {},
            metricWeight = {};
        try {
            for (p in this.Weight) {
                val[p] = cvss[p];
                if (typeof val[p] === "undefined" || val[p] === '' || val[p] == null) {
                    return "?";
                }
                metricWeight[p] = this.Weight[p][val[p]];
            }
        } catch (err) {
            return err; // TODO: need to catch and return sensible error value & do a better job of specifying *which* parm is at fault.
        }
        metricWeight.privilegesRequired = this.Weight.privilegesRequired[val.scope][val.privilegesRequired];
        //
        // CALCULATE THE CVSS BASE SCORE
        //
        try {
            var baseScore, impactSubScore, impact, exploitability;
            var impactSubScoreMultiplier = (1 - ((1 - metricWeight.confidentialityImpact) * (1 - metricWeight.integrityImpact) * (1 - metricWeight.availabilityImpact)));
            if (val.scope === 'UNCHANGED') {
                impactSubScore = metricWeight.scope * impactSubScoreMultiplier;
            } else {
                impactSubScore = metricWeight.scope * (impactSubScoreMultiplier - 0.029) - 3.25 * Math.pow(impactSubScoreMultiplier - 0.02, 15);
            }
            exploitability = exploitabilityCoefficient * metricWeight.attackVector * metricWeight.attackComplexity * metricWeight.privilegesRequired * metricWeight.userInteraction;
            if (impactSubScore <= 0) {
                baseScore = 0;
            } else {
                if (val.scope === 'UNCHANGED') {
                    baseScore = this.roundUp1(Math.min((exploitability + impactSubScore), 10));
                } else {
                    baseScore = this.roundUp1(Math.min((exploitability + impactSubScore) * scopeCoefficient, 10));
                }
            }
            return baseScore.toFixed(1);
        } catch (err) {
            return err;
        }
    },
    w2: {
        accessComplexity: {
            HIGH: 0.35,
            MEDIUM: 0.61,
            LOW: 0.71
        },
        authentication: {
            NONE: 0.704,
            SINGLE: 0.56,
            MULTIPLE: 0.45
        },
        accessVector: {
            LOCAL: 0.395, ADJACENT_NETWORK: 0.646,
            NETWORK: 1
        },
        confidentialityImpact: {
            NONE: 0,
            PARTIAL: 0.275,
            COMPLETE: 0.660
        },
        integrityImpact: {
            NONE: 0,
            PARTIAL: 0.275,
            COMPLETE: 0.660
        },
        availabilityImpact: {
            NONE: 0,
            PARTIAL: 0.275,
            COMPLETE: 0.660
        }
    },
    calculate2: function(cvss) {
        var w2 = this.w2;
        var impact = 10.41 * (1 -
             (1-w2.confidentialityImpact[cvss.confidentialityImpact])
             *(1-w2.integrityImpact[cvss.integrityImpact])
             *(1-w2.availabilityImpact[cvss.availabilityImpact]));
        if (impact == 0) {
            return 0;
        }
        var exploitability = 20.0
            * w2.accessComplexity[cvss.accessComplexity]
            * w2.authentication[cvss.authentication]
            * w2.accessVector[cvss.accessVector];

        return ((0.6*impact + 0.4*exploitability - 1.5)*1.176).toFixed(1);
    }
}

function copyToClipboard(text){
        navigator.clipboard.writeText(text).catch(err => {
        console.error('Failed to copy text: ', err);
    });
    return false;
}

/**
 * SimpleHtml Editor
 * A minimal, modular, secure rich text editor.
 */
class SimpleHtml {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        if (!this.container) throw new Error('SimpleHtml: Container element not found.');

        this.options = Object.assign({
            content: '',
            placeholder: 'Start typing...',
            toolbar: [
                'bold', 'italic', 'underline', '|',
                'h1', 'h2', 'h3', 'p', 'blockquote', 'code', 'removeFormat','|',
                'insertUnorderedList', 'insertOrderedList', '|',
                'link', 'unlink', 'image', 'table', '|',
                'table_row_plus', 'table_row_minus', 'table_col_plus', 'table_col_minus', '|',
                'undo', 'redo', '|',
                'source'
            ],
            buttonClass: {
                blockquote: 'quote',
                insertUnorderedList:'bullet',
                insertOrderedList:'numbered',
                code:'console',
                image: 'pic',
                source:'markup',
                'table_row_plus':'add-row-down',
                'table_row_minus':'row-red',
                'table_col_plus':'add-col-right',
                'table_col_minus':'col-red',
                removeFormat: 'noformat'
            }
        }, options);

        // Undo/Redo Stacks
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;

        this.allowedTags = {
            'b': [], 'strong': [], 'i': [], 'em': [], 'u': [],
            'p': [], 'div': [],
            'h1': [], 'h2': [], 'h3': [],
            'blockquote': [],
            'ul': [], 'ol': [], 'li': [],
            'a': ['href', 'target', 'title','rel'],
            'img': ['src', 'alt', 'width', 'height'],
            'table': [],
            'thead': [], 'tbody': [], 'tfoot': [],
            'tr': [], 'td': ['colspan', 'rowspan'], 'th': ['colspan', 'rowspan'],
            'code': [], 'pre': [], 'br': [], 'span':[], 'dd':[]
        };

        // Block `javascript:` protocols
        this.disallowedProtocols = ['javascript:', 'vbscript:', 'data:'];
        // Note: data: might be needed for pasted images, but user asked for secure. 
        // We will allow data:image specifically if needed, but let's default to blocking scripts.

        this.init();
    }

    init() {
        // Clear container and setup structure
        this.container.innerHTML = '';
        this.container.classList.add('rnd');

        // Create Toolbar
        this.toolbar = document.createElement('div');
        this.toolbar.className = 'vgh-toolbar';
        this.container.appendChild(this.toolbar);
        this.renderToolbar();
        this.initUrlForm();

        // Create Content Area
        this.contentArea = document.createElement('div');
        this.contentArea.className = 'vgh-content';
        this.contentArea.contentEditable = true;
        // Initial set (will trigger history save)
        this.contentArea.innerHTML = this.sanitize(this.options.content);
        this.container.appendChild(this.contentArea);

        // Create Source View Textarea
        this.sourceArea = document.createElement('textarea');
        this.sourceArea.className = 'vgh-markup';
        this.container.appendChild(this.sourceArea);

        this.initTablePicker();

        // Initialize History
        this.saveHistory();

        // Bind Events
        this.bindEvents();
    }

    renderToolbar() {
        this.toolbar.innerHTML = '';
        this.options.toolbar.forEach(tool => {
            if (tool === '|') {
                const separator = document.createElement('span');
                Object.assign(separator.style, { width: '1px', background: '#ddd', margin: '0 5px' });
                this.toolbar.appendChild(separator);
                return;
            }

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.dataset.command = tool;
            //btn.textContent = this.getButtonLabel(tool);
            btn.title = tool; // Tooltip helper
            btn.className = 'sbn vgi-' + (this.options.buttonClass[tool] || tool);

            // Initial state for table buttons - might be disabled
            if (tool.startsWith('table_')) {
                // We'll manage visibility in updateToolbarState
                btn.style.display = 'none';
            }

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.execCommand(tool, btn);
            });

            this.toolbar.appendChild(btn);
        });
    }

    getButtonLabel(tool) {
        const labels = {
            'bold': 'B', 'italic': 'I', 'underline': 'U',
            'h1': 'H1', 'h2': 'H2', 'h3': 'H3',
            'p': 'P', 'blockquote': '""', 'code': '{}',
            'removeFormat':'Clear',
            'insertUnorderedList': '•', 'insertOrderedList': '1.',
            'link': '🔗', 'unlink': '⛓️',
            'image': '🖼️', 'table': '▦',
            'table_row_plus': '+Row', 'table_row_minus': '-Row',
            'table_col_plus': '+Col', 'table_col_minus': '-Col',
            'undo': '↩', 'redo': '↪',
            'source': '</>'
        };
        return labels[tool] || tool;
    }

    bindEvents() {
        // Debounce history save
        let timer;
        const updateToolbar = () => this.updateToolbarState();
        const handleInput = () => {
            clearTimeout(timer);
            timer = setTimeout(() => this.saveHistory(), 500);
            updateToolbar();
        };

        this.contentArea.addEventListener('input', handleInput);
        ['keyup', 'mouseup', 'click'].forEach((event) => {
            this.contentArea.addEventListener(event, updateToolbar);
        });

        // Handle Paste
        this.contentArea.addEventListener('paste', (e) => this.handlePaste(e));

        document.addEventListener('mousedown', (e) => {
            if (!this.tablePicker || this.tablePicker.style.display !== 'block') return;
            if (this.tablePicker.contains(e.target)) return;
            const tableBtn = this.toolbar.querySelector('button[data-command="table"]');
            if (tableBtn && (tableBtn === e.target || tableBtn.contains(e.target))) return;
            this.hideTablePicker();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideTablePicker();
                this.hideUrlForm({ restoreSelection: true });
            }
        });
    }

    initUrlForm() {
        if (this.urlForm) return;
        this.urlForm = document.createElement('form');
        Object.assign(this.urlForm, { className: 'simplehtml-url-form', noValidate: true });
        this.urlForm.style.display = 'none';
        this.urlForm.setAttribute('aria-hidden', 'true');

        this.urlInput = document.createElement('input');
        Object.assign(this.urlInput, { type: 'url', className: 'txt simplehtml-url-input', placeholder: 'Enter URL' });
        this.urlInput.setAttribute('aria-label', 'URL');

        this.urlUploadButton = document.createElement('span');
        var b = document.createElement('button');
        Object.assign(b, { type: 'button', className: 'btn vgi-folder', textContent: 'Import File' });
        //b.style.display = 'none';
        this.urlUploadButton.append(document.createTextNode(' or '), b);

        this.urlFileInput = document.createElement('input');
        Object.assign(this.urlFileInput, { type: 'file', accept: 'image/*', className: 'simplehtml-url-file' });
        this.urlFileInput.setAttribute('aria-hidden', 'true');

        this.urlOkButton = document.createElement('button');
        Object.assign(this.urlOkButton, { type: 'submit', className: 'btn sfe simplehtml-url-ok', textContent: 'OK' });

        this.urlCancelButton = document.createElement('button');
        Object.assign(this.urlCancelButton, { type: 'button', className: 'btn simplehtml-url-cancel', textContent: 'Cancel' });

        this.urlForm.append(this.urlInput, this.urlUploadButton, this.urlOkButton, this.urlCancelButton, this.urlFileInput);
        this.container.appendChild(this.urlForm);

        const resetFileInput = () => { this.urlFileInput.value = ''; };
        const closeUrlForm = () => {
            this.hideUrlForm({ restoreSelection: true });
            this.contentArea.focus();
        };

        this.urlForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.applyUrl();
        });

        this.urlUploadButton.addEventListener('click', (e) => {
            e.preventDefault();
            resetFileInput();
            this.urlFileInput.click();
        });

        this.urlFileInput.addEventListener('change', () => {
            const file = this.urlFileInput.files && this.urlFileInput.files[0];
            if (!file || this.urlFormMode !== 'image') return resetFileInput();
            if (file.type && !file.type.startsWith('image/')) return resetFileInput();
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = typeof reader.result === 'string' ? reader.result : '';
                if (!dataUrl) return resetFileInput();
                this.urlInput.value = dataUrl;
                this.applyUrl();
                resetFileInput();
                closeUrlForm();
            };
            reader.onerror = resetFileInput;
            reader.readAsDataURL(file);
        });

        this.urlCancelButton.addEventListener('click', closeUrlForm);

        this.urlForm.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            e.preventDefault();
            closeUrlForm();
        });

        this.urlFormPinned = false;
        this.urlFormTarget = this.urlFormRange = this.urlFormMode = null;
    }

    setUrlFormMode(mode) {
        this.urlFormMode = mode;
        if (!this.urlInput) return;
        const isImage = mode === 'image';
        const label = isImage ? 'Image URL' : mode === 'link' ? 'Link URL' : 'URL';
        this.urlInput.setAttribute('aria-label', label);
        if (this.urlUploadButton) this.urlUploadButton.style.display = isImage ? 'inline-block' : 'none';
    }

    showUrlForm({ value = '', pin = false, focus = false } = {}) {
        if (!this.urlForm) this.initUrlForm();
        this.urlFormPinned = pin;
        this.urlForm.style.display = 'flex';
        this.urlForm.setAttribute('aria-hidden', 'false');
        this.urlInput.value = value;
        if (focus) {
            this.urlInput.focus();
            this.urlInput.select();
        }
    }

    hideUrlForm({ restoreSelection = false } = {}) {
        if (!this.urlForm) return;
        this.urlForm.style.display = 'none';
        this.urlForm.setAttribute('aria-hidden', 'true');
        if (restoreSelection) this.restoreSelection(this.urlFormRange);
        this.urlFormPinned = false;
        this.urlFormTarget = this.urlFormRange = null;
        this.setUrlFormMode(null);
    }

    openUrlForm({ auto = false, target = null, mode, defaultValue = '' } = {}) {
        const resolved = target || (mode === 'image' ? this.getImageAtSelection() : this.getLinkAtSelection());
        if (auto && !resolved) {
            this.hideUrlForm();
            return;
        }
        this.urlFormRange = this.saveSelection();
        this.urlFormTarget = resolved;
        this.setUrlFormMode(mode);
        const attr = mode === 'image' ? 'src' : 'href';
        const value = resolved ? resolved.getAttribute(attr) || '' : defaultValue;
        this.showUrlForm({ value, pin: !auto, focus: !auto });
    }

    openImageForm({ auto = false, image = null } = {}) {
        this.openUrlForm({ auto, target: image, mode: 'image' });
    }

    openLinkForm({ auto = false, link = null } = {}) {
        this.openUrlForm({ auto, target: link, mode: 'link', defaultValue: 'https://' });
    }

    applyUrl() {
        const url = this.urlInput.value.trim();
        if (!url) {
            this.hideUrlForm({ restoreSelection: true });
            this.contentArea.focus();
            return;
        }

        const target = this.urlFormTarget;
        const isImage = this.urlFormMode === 'image';
        const isLink = this.urlFormMode === 'link';
        if (!isImage && !isLink) {
            this.hideUrlForm({ restoreSelection: true });
            this.contentArea.focus();
            return;
        }

        const tagName = isImage ? 'IMG' : 'A';
        const attr = isImage ? 'src' : 'href';
        const command = isImage ? 'insertImage' : 'createLink';
        if (target && target.tagName === tagName && this.contentArea.contains(target)) {
            target.setAttribute(attr, url);
        } else {
            this.contentArea.focus();
            this.restoreSelection(this.urlFormRange);
            document.execCommand(command, false, url);
        }

        this.saveHistory();
        this.hideUrlForm();
        this.updateToolbarState();
        this.contentArea.focus();
    }

    syncUrlFormWithSelection() {
        if (!this.urlForm || this.urlFormPinned) return;
        if (this.sourceArea && this.sourceArea.style.display === 'block') {
            this.hideUrlForm();
            return;
        }
        const link = this.getLinkAtSelection();
        if (link) {
            const currentValue = link.getAttribute('href') || '';
            if (this.urlFormTarget !== link || this.urlFormMode !== 'link' || this.urlForm.style.display === 'none') {
                this.openLinkForm({ auto: true, link });
            } else if (this.urlInput.value !== currentValue) {
                this.urlInput.value = currentValue;
            }
            return;
        }
        const image = this.getImageAtSelection();
        if (image) {
            const currentValue = image.getAttribute('src') || '';
            if (this.urlFormTarget !== image || this.urlFormMode !== 'image' || this.urlForm.style.display === 'none') {
                this.openImageForm({ auto: true, image });
            } else if (this.urlInput.value !== currentValue) {
                this.urlInput.value = currentValue;
            }
        } else {
            this.hideUrlForm();
        }
    }

    getImageAtSelection() {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return null;
        const range = selection.getRangeAt(0);
        if (!this.contentArea.contains(range.commonAncestorContainer)) return null;

        let node = range.commonAncestorContainer;
        node = node.nodeType === 1 ? node : node.parentNode;
        if (!node) return null;

        if (node.tagName === 'IMG') return node;
        const img = node.closest && node.closest('img');
        if (img && this.contentArea.contains(img)) return img;

        if (range.startContainer.nodeType === 1) {
            const child = range.startContainer.childNodes[range.startOffset];
            if (child && child.nodeType === 1 && child.tagName === 'IMG') return child;
        }

        if (range.endContainer.nodeType === 1) {
            const index = Math.max(0, range.endOffset - 1);
            const child = range.endContainer.childNodes[index];
            if (child && child.nodeType === 1 && child.tagName === 'IMG') return child;
        }

        return null;
    }

    getLinkAtSelection() {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return null;
        const range = selection.getRangeAt(0);
        if (!this.contentArea.contains(range.commonAncestorContainer)) return null;

        let node = range.commonAncestorContainer;
        node = node.nodeType === 1 ? node : node.parentNode;
        if (!node) return null;

        if (node.tagName === 'A') return node;
        const anchor = node.closest && node.closest('a');
        return anchor && this.contentArea.contains(anchor) ? anchor : null;
    }

    updateToolbarState() {
        const selection = window.getSelection();
        let node = null;
        if (selection.rangeCount > 0) {
            node = selection.getRangeAt(0).commonAncestorContainer;
            node = node.nodeType === 3 ? node.parentNode : node;
        }

        // 1. Native Commands
        this.options.toolbar.forEach((tool) => {
            if (tool === '|') return;
            const btn = this.toolbar.querySelector(`button[data-command="${tool}"]`);
            if (!btn) return;

            // Handle Table Context Buttons
            if (tool.startsWith('table_')) {
                btn.style.display = node && node.closest('div.vgh-content table') ? 'inline-block' : 'none';
                return;
            }
            if (document.queryCommandState && !['source', 'undo', 'redo'].includes(tool)) {
                try {
                    const active = document.queryCommandState(tool) ||
                        (node && ['blockquote', 'code'].includes(tool) && node.closest(`div.vgh-content ${tool}`));
                    btn.classList.toggle('active', active);
                } catch (e) { }
            }
        });

        // 2. Undo/Redo State
        const btnUndo = this.toolbar.querySelector('button[data-command="undo"]');
        if (btnUndo) btnUndo.disabled = this.historyIndex <= 0;

        const btnRedo = this.toolbar.querySelector('button[data-command="redo"]');
        if (btnRedo) btnRedo.disabled = this.historyIndex >= this.history.length - 1;

        this.syncUrlFormWithSelection();
    }

    handlePaste(e) {
        e.preventDefault();
        const data = e.clipboardData || window.clipboardData;
        const html = data.getData('text/html');
        const text = data.getData('text');

        // Favor HTML, but strictly sanitize it
        const content = html ? this.sanitize(html) : text.replace(/\n/g, '<br>');

        document.execCommand('insertHTML', false, content);
    }

    execCommand(command, btn) {
        this.contentArea.focus();

        // Snapshot for undo - normally handled by input, but some commands might use modal/etc
        // For simple execCommands, the input event fires.

        switch (command) {
            case 'h1': case 'h2': case 'h3': case 'p': case 'blockquote':
                document.execCommand('formatBlock', false, command);
                break;
            case 'code':
                const selection = window.getSelection();
                if (!selection.isCollapsed) {
                    const range = selection.getRangeAt(0);
                    const code = document.createElement('code');
                    code.textContent = selection.toString();
                    document.execCommand('insertHTML', false, code.outerHTML);
                }
                break;
            case 'source':
                this.toggleSourceView(btn);
                break;
            case 'link':
                this.openLinkForm();
                break;
            case 'image':
                this.openImageForm();
                break;
            case 'table':
                this.insertTable(btn);
                break;
            case 'table_row_plus': this.modifyTable('row', 'add'); break;
            case 'table_row_minus': this.modifyTable('row', 'delete'); break;
            case 'table_col_plus': this.modifyTable('col', 'add'); break;
            case 'table_col_minus': this.modifyTable('col', 'delete'); break;
            case 'unlink':
                this.unlinkAtCaret();
                break;
            case 'removeFormat':
                this.removeAllFormatting();
                break;
            case 'undo':
                this.performUndo();
                break;
            case 'redo':
                this.performRedo();
                break;
            default:
                document.execCommand(command, false, null);
                break;
        }
        this.updateToolbarState();
    }

    removeAllFormatting() {
        const lines = (this.contentArea.innerText || '').replace(/\r\n/g, '\n').split('\n');
        const fragment = document.createDocumentFragment();
        lines.forEach((line, index) => {
            if (index > 0) fragment.appendChild(document.createElement('br'));
            fragment.appendChild(document.createTextNode(line));
        });
        this.contentArea.innerHTML = '';
        this.contentArea.appendChild(fragment);
        this.saveHistory();
    }

    saveHistory() {
        const currentHtml = this.contentArea.innerHTML;
        // If identical to last save, skip
        if (this.history[this.historyIndex] === currentHtml) return;

        // Truncate future if we were in middle
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(currentHtml);
        if (this.history.length > this.maxHistory) this.history.shift();
        else this.historyIndex++;

        this.updateToolbarState();
    }

    performUndo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.contentArea.innerHTML = this.history[this.historyIndex];
            this.updateToolbarState();
        }
    }

    performRedo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.contentArea.innerHTML = this.history[this.historyIndex];
            this.updateToolbarState();
        }
    }

    saveSelection() {
        const selection = window.getSelection();
        return selection.rangeCount ? selection.getRangeAt(0).cloneRange() : null;
    }

    restoreSelection(range) {
        if (!range) return;
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }

    unlinkAtCaret() {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        if (!selection.isCollapsed) {
            document.execCommand('unlink', false, null);
            return;
        }

        const range = selection.getRangeAt(0);
        let node = range.commonAncestorContainer;
        if (node.nodeType === 3) node = node.parentNode;
        const anchor = node && node.closest ? node.closest('a') : null;
        if (!anchor) {
            document.execCommand('unlink', false, null);
            return;
        }

        const marker = document.createElement('span');
        marker.setAttribute('data-sh-caret', '1');
        range.insertNode(marker);

        const parent = anchor.parentNode;
        while (anchor.firstChild) {
            parent.insertBefore(anchor.firstChild, anchor);
        }
        parent.removeChild(anchor);

        const newRange = document.createRange();
        newRange.setStartAfter(marker);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
        marker.parentNode.removeChild(marker);

        this.saveHistory();
    }

    initTablePicker() {
        if (this.tablePicker) return;
        const containerStyle = window.getComputedStyle(this.container);
        if (containerStyle.position === 'static') {
            this.container.style.position = 'relative';
        }

        this.tablePicker = document.createElement('div');
        this.tablePicker.className = 'simplehtml-table-picker';
        this.tablePicker.style.display = 'none';
        this.tablePicker.setAttribute('aria-hidden', 'true');

        this.tablePickerLabel = document.createElement('div');
        this.tablePickerLabel.className = 'simplehtml-table-picker-label';
        this.tablePickerLabel.textContent = '0 x 0';

        this.tablePickerGrid = document.createElement('div');
        this.tablePickerGrid.className = 'simplehtml-table-picker-grid';

        this.tablePickerCells = [];
        const max = 12;
        for (let r = 1; r <= max; r++) {
            for (let c = 1; c <= max; c++) {
                const cell = document.createElement('div');
                cell.className = 'simplehtml-table-picker-cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                this.tablePickerGrid.appendChild(cell);
                this.tablePickerCells.push(cell);
            }
        }

        this.tablePicker.appendChild(this.tablePickerLabel);
        this.tablePicker.appendChild(this.tablePickerGrid);
        this.container.appendChild(this.tablePicker);

        this.tablePickerGrid.addEventListener('mouseover', (e) => {
            const cell = e.target.closest('.simplehtml-table-picker-cell');
            if (!cell) return;
            const rows = parseInt(cell.dataset.row, 10);
            const cols = parseInt(cell.dataset.col, 10);
            this.updateTablePickerSelection(rows, cols);
        });

        this.tablePickerGrid.addEventListener('click', (e) => {
            const cell = e.target.closest('.simplehtml-table-picker-cell');
            if (!cell) return;
            const rows = parseInt(cell.dataset.row, 10);
            const cols = parseInt(cell.dataset.col, 10);
            this.insertTableWithSize(rows, cols);
            this.hideTablePicker();
        });
    }

    showTablePicker(btn) {
        this.updateTablePickerSelection(0, 0);
        this.tablePicker.style.display = 'block';
        this.tablePicker.setAttribute('aria-hidden', 'false');

        const containerRect = this.container.getBoundingClientRect();
        const pickerRect = this.tablePicker.getBoundingClientRect();
        let left = 8;
        let top = this.toolbar ? this.toolbar.offsetHeight + 8 : 8;

        if (btn) {
            const btnRect = btn.getBoundingClientRect();
            left = btnRect.left - containerRect.left;
            top = btnRect.bottom - containerRect.top + 6;
        }

        if (left + pickerRect.width > containerRect.width) {
            left = containerRect.width - pickerRect.width - 6;
        }
        if (left < 0) left = 0;
        if (top < 0) top = 0;

        this.tablePicker.style.left = `${left}px`;
        this.tablePicker.style.top = `${top}px`;
    }

    hideTablePicker() {
        if (!this.tablePicker) return;
        this.tablePicker.style.display = 'none';
        this.tablePicker.setAttribute('aria-hidden', 'true');
        this.tablePickerSelectionRange = null;
    }

    updateTablePickerSelection(rows, cols) {
        const label = rows && cols ? `${rows} x ${cols}` : '0 x 0';
        this.tablePickerLabel.textContent = label;
        this.tablePickerCells.forEach((cell) => {
            const cellRow = parseInt(cell.dataset.row, 10);
            const cellCol = parseInt(cell.dataset.col, 10);
            if (cellRow <= rows && cellCol <= cols) {
                cell.classList.add('active');
            } else {
                cell.classList.remove('active');
            }
        });
    }

    insertTable(btn) {
        if (!this.tablePicker) this.initTablePicker();
        if (this.tablePicker.style.display === 'block') {
            this.hideTablePicker();
            return;
        }
        this.tablePickerSelectionRange = this.saveSelection();
        this.showTablePicker(btn);
    }

    insertTableWithSize(rows, cols) {
        if (!rows || !cols) return;
        this.contentArea.focus();
        this.restoreSelection(this.tablePickerSelectionRange);

        let html = '<table><tbody>';
        const cells = '<td></td>'.repeat(cols);
        for (let r = 0; r < rows; r++) html += `<tr>${cells}</tr>`;
        html += '</tbody></table><p><br></p>';
        document.execCommand('insertHTML', false, html);
    }

    modifyTable(type, action) {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;
        let node = selection.getRangeAt(0).commonAncestorContainer;
        node = node.nodeType === 3 ? node.parentNode : node;
        const td = node.closest('div.vgh-content td') || node.closest('div.vgh-content th');
        if (!td) return;
        const tr = td.parentNode;
        const table = tr.closest('div.vgh-content table');
        const rowIndex = tr.rowIndex;
        const colIndex = Array.from(tr.children).indexOf(td);

        if (type === 'row') {
            if (action === 'add') {
                const newRow = table.insertRow(rowIndex + 1);
                for (let i = 0; i < tr.children.length; i++) {
                    newRow.insertCell(i).innerHTML = '<br>';
                }
            } else if (action === 'delete') {
                table.deleteRow(rowIndex);
            }
        } else if (type === 'col') {
            // Iterate all rows
            for (let i = 0; i < table.rows.length; i++) {
                if (action === 'add') {
                    table.rows[i].insertCell(colIndex + 1).innerHTML = '<br>';
                } else if (action === 'delete') {
                    if (table.rows[i].cells.length > 1) {
                        table.rows[i].deleteCell(colIndex);
                    }
                }
            }
        }
        this.saveHistory();
    }

    toggleSourceView(btn) {
        this.hideUrlForm();
        const isSource = this.sourceArea.style.display === 'block';
        if (isSource) {
            this.setValue(this.sourceArea.value);
            this.sourceArea.style.display = 'none';
            this.contentArea.style.display = 'block';
        } else {
            this.sourceArea.value = this.getValue();
            this.contentArea.style.display = 'none';
            this.sourceArea.style.display = 'block';
        }
        if (btn) btn.classList.toggle('active', !isSource);
    }

    getValue() {
        return this.sanitize(this.sourceArea.style.display === 'block' ? this.sourceArea.value : this.contentArea.innerHTML);
    }

    setValue(html) {
        const clean = this.sanitize(html);
        this.contentArea.innerHTML = this.sourceArea.value = clean;
        this.saveHistory(); // Record state change
    }

    sanitize(html) {
        if (!html) return '';
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const cleanNode = (node) => {
            if (node.nodeType === 3) return node.cloneNode(true);
            if (node.nodeType !== 1) return null;
            const tag = node.tagName.toLowerCase();
            if (!this.allowedTags.hasOwnProperty(tag)) {
                if (['script', 'style', 'iframe', 'object', 'embed'].includes(tag)) return null;
                const fragment = document.createDocumentFragment();
                for (let i = 0; i < node.childNodes.length; i++) {
                    const child = cleanNode(node.childNodes[i]);
                    if (child) fragment.appendChild(child);
                }
                return fragment;
            }

            const el = document.createElement(tag);
            const allowedAttrs = this.allowedTags[tag];
            for (let i = 0; i < node.attributes.length; i++) {
                const attr = node.attributes[i];
                if (!allowedAttrs.includes(attr.name)) continue;
                if (attr.name === 'href' || attr.name === 'src') {
                    const val = attr.value.toLowerCase().trim();
                    if (this.disallowedProtocols.some(p => val.startsWith(p)) &&
                        !(attr.name === 'src' && val.startsWith('data:image/'))) {
                        continue;
                    }
                }
                el.setAttribute(attr.name, attr.value);
            }

            for (let i = 0; i < node.childNodes.length; i++) {
                const child = cleanNode(node.childNodes[i]);
                if (child) el.appendChild(child);
            }
            return el;
        };

        const result = document.createElement('div');
        for (let i = 0; i < doc.body.childNodes.length; i++) {
            const cleaned = cleanNode(doc.body.childNodes[i]);
            if (cleaned) result.appendChild(cleaned);
        }
        return result.innerHTML;
    }
}

// Export if module system is present, otherwise global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleHtml;
} else {
    window.SimpleHtml = SimpleHtml;
}

// Copyright (c) 2018 Chandan B N. All rights reserved.

async function sendComment(f) {
    var html = '';
    if (f.simpleHtml) {
        html = f.simpleHtml.getValue();
    } else if (f.commentarea) {
        html = f.commentarea.innerHTML;
    }
    var comment = {
        id: f.id.value,
        text: html
    };
    if (f.slug && f.slug.value) {
        comment.slug = f.slug.value;
    }
    if (f.date && f.date.value) {
        comment.date = f.date.value;
    }
    try {
        var response = await fetch('comment/', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            },
            body: JSON.stringify(comment),
        });
    } catch (e) {
        //console.log('fetch failed ' + e)
    }
    if (response.ok) {
        try {
            var json = await response.json();
            if (json.ok) {
                if (!f.slug && f.simpleHtml) {
                    f.simpleHtml.setValue('');
                    updateCommentButton(f);
                }
                setComments(f.id.value, json.ret);
            } else {
                alert('Error adding comment: ' + json.msg);
            }
        } catch (e) {
            alert('Error adding comment. Please reload the page and try again' + e + JSON.stringify(response));
        }
    } else {
        alert('Failed to add comment. Please reload the page and try again');
    }
}

async function setComments(id, cs) {
    //var json = await getSubDocs('comment', id);
    document.getElementById('comments').innerHTML = subdocRender({
        ctemplate: 'comments',
        docs: cs,
        id: id,
        username: userUsername
    });
}

async function getFiles() {
    var json = await getSubDocs('files', getDocID());
    document.getElementById('fileList').innerHTML = subdocRender({
        ctemplate: 'fileList',
        files: json,
        doc_id: getDocID()
    });
}
function fileDelete(m) {
    var fileLink = m.parentNode.parentNode.firstChild.firstChild;
    var url = fileLink.getAttribute('href');
    itemDelete(url, fileLink.textContent, getFiles);
}
function itemDelete(url, id, cb) {
    if (confirm('Delete this ' + id + '?')) {
        fetch(url, {
            method: 'DELETE',
            credentials: 'include',
            redirect: 'error',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'CSRF-Token': csrfToken
            },
        }).then(function (response) {
            if (response.status == 200) {
                infoMsg.textContent = "Deleted ";
                errMsg.textContent = "";
            } else {
                errMsg.textContent = "Error " + response.statusText;
                infoMsg.textContent = "";
            }
            cb();
        }).catch(function (error) {
            alert('Error Deleting file! Try reloading page!');
        });
    }
}

async function getChanges(id) {
    var json = await getSubDocs('log', id);
    changelog.innerHTML = subdocRender({
        ctemplate: 'changes',
        docs: json
    });
}

async function getSubDocs(docType, id) {
    try {
        var response = await fetch(docType + '/' + id, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            }
        });
        if (response.ok) {
            var json = await response.json();
            return json;
        }
    } catch (e) {
        //console.log('Error loading comments');
    }
}

function hasSimpleHtmlContent(editor) {
    if (!editor || !editor.contentArea) return false;
    var text = (editor.contentArea.textContent || '').replace(/\u00a0/g, ' ').trim();
    if (text) return true;
    return !!editor.contentArea.querySelector('img,table,blockquote,code,pre,ul,ol,li');
}

function updateCommentButton(form) {
    if (!form || !form.simpleHtml || !form.button) return;
    form.button.disabled = !hasSimpleHtmlContent(form.simpleHtml);
}

function editPost(slugValue) {
    let post = document.getElementById(slugValue);
    let text = post.querySelector("div");
    let slug = post.querySelector("input[name='slug']");
    let date = post.querySelector("input[name='date']");

    var nf = newCommentBox(text);
    nf.appendChild(slug);
    nf.appendChild(date);
    nf.button.textContent = "Update";
    post.parentNode.replaceChild(nf, post);

}

function newCommentBox(div) {
    var nc = document.getElementById("commentTemplate").cloneNode(true); // new comment
    var nf = nc.firstElementChild;
    nf.commentarea = nc.getElementsByClassName('simplehtml-editor')[0];
    var initialHtml = '';
    if (div) {
        initialHtml = div.innerHTML;
        div.className = nf.commentarea.className;
        div.innerHTML = '';
        nf.replaceChild(div, nf.commentarea);
        nf.commentarea = div;
    }
    document.getElementById("commentTemplate").insertAdjacentElement('afterend', nf)
    nf.simpleHtml = new SimpleHtml(nf.commentarea, {
        content: initialHtml,
        placeholder: 'Add a comment...'
    });
    updateCommentButton(nf);
    nf.simpleHtml.contentArea.addEventListener('input', function () {
        updateCommentButton(nf);
    });
    nf.simpleHtml.sourceArea.addEventListener('input', function () {
        updateCommentButton(nf);
    });
    nf.simpleHtml.contentArea.addEventListener('blur', function () {
        updateCommentButton(nf);
    });
    nf.simpleHtml.sourceArea.addEventListener('blur', function () {
        updateCommentButton(nf);
    });
    return nf;
}

function preview(el, ev) {
    var files = [];
    for (var i = 0; i < el.files.length; i++) {
        files.push({
            'Selected File': el.files[i].name,
            size: el.files[i].size
        });
    }
    el.parentNode.lastChild.innerHTML = subdocRender({
        ctemplate: 'filePreview',
        docs: files,
        columns: ['Selected File', 'size']
    });
    el.nextSibling.nextSibling.className = "btn icn indent save sfe"
}

function attach(el, event) {
    event.preventDefault();
    var pgb = el.nextElementSibling;
    pgb.className = 'lbl';
    var file = el.form.file1;
    //console.log('Have'+JSON.stringify(file.files));
    if (file.files.length > 0) {
        el.setAttribute("disabled", "disabled");
        upload(self.path, el.form.file1.files, el.form.comment.value, {
            success: function (url) {
                //pgb.className = 'hid';
                //console.log('refresh file list');
                getFiles();
                el.removeAttribute("disabled");
                el.form.reset();
                el.form.lastChild.innerHTML = "";
            },
            failure: function (error) {
                pgb.className = 'hid';
                el.removeAttribute("disabled");
            },
            updateProgress: function (progress) {
                if (pgb) {
                    if (progress == 100) {
                        pgb.className = 'hid';
                    } else if (progress)
                        pgb.setAttribute('value', progress);
                    else
                        pgb.removeAttribute('value');
                }
            }
        });
    }
    return false;
};

function upload(type, files, comment, cbs) {

    var reader = new FileReader();
    var xhr = new XMLHttpRequest();
    var fd = new FormData();
    fd.append('comment', comment);
    for (var i = 0; i < files.length; i++) {
        fd.append('file1', files[i]);
    }
    this.xhr = xhr;
    var self = this;
    this.xhr.upload.addEventListener("loadstart", function (e) {
        cbs.updateProgress(0); //
    }, false);

    this.xhr.upload.addEventListener("progress", function (e) {
        if (e.lengthComputable) {
            var percentage = Math.round((e.loaded * 100) / e.total);
            cbs.updateProgress(percentage)
            //self.ctrl.update(percentage);
        }
    }, false);

    xhr.upload.addEventListener("load", function (e) {
        //self.ctrl.update(100);
        cbs.updateProgress(100);
        //var canvas = self.ctrl.ctx.canvas;
        //canvas.parentNode.removeChild(canvas);
    }, false);
    var uf = function (e) {
        cbs.failure('Upload failed:');
    };
    xhr.addEventListener("error", uf, false);
    xhr.addEventListener("abort", uf, false);

    xhr.upload.addEventListener("error", uf, false);
    xhr.upload.addEventListener("abort", uf, false);

    xhr.onreadystatechange = function (oEvent) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                if (xhr.response == '{"ok":"1"}') {
                    //console.log(xhr.responseText);
                    cbs.success();
                } else {
                    cbs.failure('Upload failed: ' + xhr.statusText);
                }
            } else if (xhr.status === 404) {
                cbs.failure('Upload failed: ID Not found. Try saving document first!');
            }
        }
    };

    xhr.open("POST", window.location.pathname + '/file');
    xhr.setRequestHeader('X-CSRF-Token', csrfToken)
    xhr.overrideMimeType('text/plain; charset=x-user-defined-binary');
    xhr.send(fd);
}

// Copyright (c) 2018 Chandan B N. All rights reserved.
/* jshint esversion: 6 */
/* jshint browser:true */
/* jshint unused: false */
/* globals csrfToken */
/* globals ace */
/* globals JSONEditor */
/* globals pugRender */
/* globals textUtil */
/* globals schemaName */
/* globals SimpleHtml */
/* globals allowAjax */
/* globals docSchema */
/* globals custom_validators */
/* globals initJSON */
/* globals postUrl */
/* globals getChanges */
/* globals postURL */
/* globals idpath */
/* globals io */
/* globals realtimeEnabled */
/* globals realtimeConfig */
/* globals draftsEnabled */


var infoMsg = document.getElementById('infoMsg');
var errMsg = document.getElementById('errMsg');
var save1 = document.getElementById('save1');
var editorLabel = document.getElementById('editorLabel');
var iconTheme = 'vgi-';
var starting_value = {};
var sourceEditor;
var draftsBaseline = null;
var draftsFeatureEnabled = (typeof draftsEnabled === 'boolean') ? draftsEnabled : true;

function parseOptionClasses(className) {
    var ret = {
        iconClass: null,
        otherClasses: []
    };
    if (!className || typeof className !== 'string') {
        return ret;
    }
    var parts = className.split(/\s+/);
    for (var i = 0; i < parts.length; i++) {
        var cls = parts[i];
        if (!cls) continue;
        if (!ret.iconClass && cls.indexOf(iconTheme) === 0) {
            ret.iconClass = cls;
            continue;
        }
        ret.otherClasses.push(cls);
    }
    return ret;
}

function addTextInputIcon(input, iconClass) {
    if (!input || !iconClass || !input.parentNode) return;
    if ((input.tagName || '').toLowerCase() !== 'input') return;
    if (!input.classList || !input.classList.contains('txt')) return;

    var wrapper = input.parentNode;
    if (!wrapper.classList || !wrapper.classList.contains('txt-icon-wrap')) {
        wrapper = document.createElement('span');
        wrapper.className = 'txt-icon-wrap';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
    }

    var marker = null;
    for (var i = 0; i < wrapper.children.length; i++) {
        var child = wrapper.children[i];
        if (child.classList && child.classList.contains('txt-input-icon')) {
            marker = child;
            break;
        }
    }
    if (!marker) {
        marker = document.createElement('span');
        marker.className = 'txt-input-icon';
        wrapper.insertBefore(marker, input);
    }

    marker.className = 'txt-input-icon ' + iconClass;
    input.classList.add('txt-has-icon');
}

function setControlFormat(control, schema) {
    if (!control || !schema || !schema.format) return;
    if (control.classList && control.classList.contains('form-control')) {
        control.setAttribute('data-format', schema.format);
    }
}

function draftsStableStringify(value) {
    return JSON.stringify(value, function (key, val) {
        if (val && typeof val === 'object' && !Array.isArray(val)) {
            var ordered = {};
            Object.keys(val).sort().forEach(function (k) {
                ordered[k] = val[k];
            });
            return ordered;
        }
        return val;
    });
}

function draftsSetBaseline(doc) {
    if (doc === null || doc === undefined) {
        draftsBaseline = null;
        return;
    }
    try {
        draftsBaseline = draftsStableStringify(doc);
    } catch (e) {
        draftsBaseline = null;
    }
}

function draftsHasChanges(doc) {
    if (doc === null || doc === undefined) return false;
    var current;
    try {
        current = draftsStableStringify(doc);
    } catch (e) {
        return true;
    }
    if (draftsBaseline === null) {
        draftsBaseline = current;
        return false;
    }
    return current !== draftsBaseline;
}

var realtimeStatus = document.getElementById('realtimeStatus');
var realtimeViewers = document.getElementById('realtimeViewers');
var realtimeApplying = false;
var realtimeState = {
    enabled: false,
    socket: null,
    connected: false,
    joined: false,
    currentDocId: null,
    shadowDoc: null,
    shadowVersion: null,
    pending: false,
    dirty: false,
    debounceTimer: null,
    inflightPatch: null,
    inflightBase: null
};
var realtimeClientId = (function () {
    var key = 'vulnogram-client-id';
    try {
        var existing = window.localStorage.getItem(key);
        if (existing) {
            return existing;
        }
        var fresh = 'client-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
        window.localStorage.setItem(key, fresh);
        return fresh;
    } catch (e) {
        return 'client-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
})();

function realtimeCloneDoc(doc) {
    return doc ? JSON.parse(JSON.stringify(doc)) : {};
}

function realtimeSetStatus(connected, message) {
    if (!realtimeStatus) return;
    var label = connected ? '🟢 Online' : 'Offline';
    if (message) {
        label = label + ' (' + message + ')';
    }
    realtimeStatus.textContent = label;
}

function realtimeSetViewers(count) {
    if (!realtimeViewers) return;
    if (count && count > 1) {
        realtimeViewers.textContent = count + ' viewers';
    } else {
        realtimeViewers.textContent = '';
    }
}

function realtimeGetCurrentDoc() {
    var sourceTab = document.getElementById('sourceTab');
    if (sourceTab && sourceTab.checked && sourceEditor) {
        try {
            return JSON.parse(sourceEditor.getSession().getValue());
        } catch (e) {
            return null;
        }
    }
    if (docEditor && typeof docEditor.getValue === 'function') {
        return docEditor.getValue();
    }
    return null;
}

function realtimeJoinIfReady() {
    if (!window.realtimeEnabled) return;
    if (!realtimeState.socket || !realtimeState.socket.connected) return;
    if (!schemaName || typeof schemaName !== 'string') return;
    var docId = getDocID();
    if (!docId) return;
    if (realtimeState.currentDocId === docId && realtimeState.joined) return;
    realtimeState.joined = false;
    realtimeState.socket.emit('doc:join', { collection: schemaName, docId: docId }, function (res) {
        if (!res || !res.ok) {
            return;
        }
        realtimeState.currentDocId = docId;
        realtimeState.shadowDoc = realtimeCloneDoc(res.doc || {});
        realtimeState.shadowVersion = typeof res.version === 'number' ? res.version : 0;
        realtimeState.joined = true;
        if (typeof res.viewers === 'number') {
            realtimeSetViewers(res.viewers);
        }
        realtimeMaybeSyncLocal();
    });
}

function realtimeMaybeSyncLocal() {
    if (!realtimeState.joined || realtimeState.pending) return;
    var currentDoc = realtimeGetCurrentDoc();
    if (!currentDoc || !window.jsonpatch || typeof window.jsonpatch.compare !== 'function') {
        return;
    }
    var patch = window.jsonpatch.compare(realtimeState.shadowDoc || {}, currentDoc);
    if (patch && patch.length) {
        realtimeSendPatch(patch);
    }
}

function realtimeSendPatch(patch) {
    if (!realtimeState.socket || !realtimeState.socket.connected) return;
    if (!realtimeState.joined || !realtimeState.currentDocId) return;
    if (realtimeState.pending) {
        realtimeState.dirty = true;
        return;
    }
    if (!window.jsonpatch || typeof window.jsonpatch.apply !== 'function') return;
    infoMsg.textContent = "Saving...";
    realtimeState.pending = true;
    realtimeState.inflightPatch = patch;
    realtimeState.inflightBase = realtimeCloneDoc(realtimeState.shadowDoc || {});
    var payload = {
        collection: schemaName,
        docId: realtimeState.currentDocId,
        baseVersion: realtimeState.shadowVersion,
        patch: patch,
        clientId: realtimeClientId
    };
    realtimeState.socket.emit('doc:patch', payload, function (res) {
        realtimeState.pending = false;
        if (res && res.ok) {
            var nextShadow = realtimeCloneDoc(realtimeState.inflightBase || {});
            try {
                window.jsonpatch.apply(nextShadow, realtimeState.inflightPatch, true);
            } catch (e) {
                nextShadow = realtimeCloneDoc(realtimeGetCurrentDoc());
            }
            realtimeState.shadowDoc = nextShadow;
            realtimeState.shadowVersion = res.newVersion;
            realtimeState.inflightPatch = null;
            realtimeState.inflightBase = null;
            if (draftsCache && draftsCache.remove) {
                draftsCache.cancelSave();
                draftsCache.remove(realtimeState.currentDocId);
                infoMsg.textContent = "Auto saved";
            }
            if (realtimeState.dirty) {
                realtimeState.dirty = false;
                realtimeSchedulePatch();
            }
            return;
        }
        realtimeState.inflightPatch = null;
        realtimeState.inflightBase = null;
        if (res && res.reason === 'VERSION_MISMATCH' && res.doc) {
            realtimeApplying = true;
            try {
                if (docEditor) {
                    docEditor.setValue(res.doc);
                }
            } catch (e) {
            }
            realtimeApplying = false;
            realtimeState.shadowDoc = realtimeCloneDoc(res.doc || {});
            realtimeState.shadowVersion = typeof res.version === 'number' ? res.version : realtimeState.shadowVersion;
            return;
        }
        if (realtimeState.dirty) {
            realtimeState.dirty = false;
            realtimeSchedulePatch();
        }
    });
}

function realtimeSchedulePatch() {
    if (!window.realtimeEnabled) return;
    if (realtimeApplying || draftsSyncing) return;
    if (realtimeState.pending) {
        realtimeState.dirty = true;
        return;
    }
    if (realtimeState.debounceTimer) {
        clearTimeout(realtimeState.debounceTimer);
    }
    var debounceMs = (window.realtimeConfig && window.realtimeConfig.debounceMs) ? window.realtimeConfig.debounceMs : 350;
    realtimeState.debounceTimer = setTimeout(function () {
        if (!realtimeState.socket || !realtimeState.socket.connected) return;
        if (!window.jsonpatch || typeof window.jsonpatch.compare !== 'function') return;
        var currentDoc = realtimeGetCurrentDoc();
        if (!currentDoc) return;
        var patch = window.jsonpatch.compare(realtimeState.shadowDoc || {}, currentDoc);
        if (patch && patch.length) {
            realtimeSendPatch(patch);
        }
    }, debounceMs);
}

function realtimeApplyRemotePatch(data) {
    if (!data || !data.patch) return;
    if (data.clientId && data.clientId === realtimeClientId) return;
    if (!window.jsonpatch || typeof window.jsonpatch.apply !== 'function') return;
    var nextShadow = realtimeCloneDoc(realtimeState.shadowDoc || {});
    try {
        window.jsonpatch.apply(nextShadow, data.patch, true);
    } catch (e) {
        realtimeJoinIfReady();
        return;
    }
    realtimeState.shadowDoc = nextShadow;
    realtimeState.shadowVersion = typeof data.newVersion === 'number' ? data.newVersion : realtimeState.shadowVersion;
    realtimeApplying = true;
    try {
        if (docEditor) {
            docEditor.setValue(nextShadow);
        }
    } catch (e) {
    }
    realtimeApplying = false;
}

function initRealtime() {
    if (!window.realtimeEnabled || typeof io === 'undefined') {
        return;
    }
    realtimeState.enabled = true;
    realtimeState.socket = io();
    realtimeSetStatus(false, 'connecting');
    realtimeState.socket.on('connect', function () {
        realtimeState.connected = true;
        realtimeSetStatus(true);
        realtimeJoinIfReady();
    });
    realtimeState.socket.on('disconnect', function () {
        realtimeState.connected = false;
        realtimeState.joined = false;
        realtimeSetStatus(false);
        realtimeSetViewers(0);
    });
    realtimeState.socket.on('connect_error', function () {
        realtimeSetStatus(false, 'error');
    });
    realtimeState.socket.on('doc:patched', function (data) {
        realtimeApplyRemotePatch(data);
    });
    realtimeState.socket.on('doc:viewers', function (data) {
        if (data && typeof data.count === 'number') {
            realtimeSetViewers(data.count);
        }
    });
}

// IndexedDB cache for local document persistence
var draftsCache = draftsFeatureEnabled ? (function () {
    var DB_NAME = 'vulnogram_cache';
    var STORE_NAME = 'docs';
    var DB_VERSION = 1;
    var db = null;
    var saveTimeout = null;
    var channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('draftsCache') : null;
    var listeners = [];
    var currentSection = (typeof schemaName === 'string' && schemaName) ? schemaName : '';

    function toCacheKey(id) {
        if (!id) return null;
        return currentSection + '::' + id;
    }

    function fromStoredEntry(entry) {
        if (!entry) return null;
        if (entry.section !== currentSection || !entry.docId) return null;
        return {
            id: entry.docId,
            doc: entry.doc,
            errorCount: entry.errorCount,
            updatedAt: entry.updatedAt,
            section: entry.section
        };
    }

    // Listen for updates from other tabs
    if (channel != undefined) {
        channel.onmessage = function (e) {
            notify(e.data, true);
        };
    }

    function notify(data, isRemote) {
        listeners.forEach(function (cb) {
            try { cb(data, isRemote); } catch (e) { console.error(e); }
        });
    }

    function subscribe(cb) {
        listeners.push(cb);
    }

    function open() {
        return new Promise(function (resolve, reject) {
            if (db) { resolve(db); return; }
            var req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = function (e) {
                var d = e.target.result;
                if (!d.objectStoreNames.contains(STORE_NAME)) {
                    d.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };
            req.onsuccess = function (e) { db = e.target.result; resolve(db); };
            req.onerror = function (e) { reject(e.target.error); };
        });
    }

    function save(id, doc, errorCount) {
        if (!id) return Promise.resolve();
        var count = typeof errorCount === 'number' ? errorCount : 0;
        var cacheKey = toCacheKey(id);
        return open().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(STORE_NAME, 'readwrite');
                var store = tx.objectStore(STORE_NAME);
                store.put({
                    id: cacheKey,
                    docId: id,
                    section: currentSection,
                    doc: doc,
                    errorCount: count,
                    updatedAt: Date.now()
                });
                tx.oncomplete = function () {
                    var msg = { type: 'update', id: id, section: currentSection };
                    if (channel) channel.postMessage(msg);
                    notify(msg, false);
                    resolve();
                };
                tx.onerror = function (e) { reject(e.target.error); };
            });
        });
    }

    function get(id) {
        if (!id) return Promise.resolve(null);
        var cacheKey = toCacheKey(id);
        return open().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(STORE_NAME, 'readonly');
                var store = tx.objectStore(STORE_NAME);
                var req = store.get(cacheKey);
                req.onsuccess = function () { resolve(fromStoredEntry(req.result || null)); };
                req.onerror = function (e) { reject(e.target.error); };
            });
        });
    }

    function getAll() {
        return open().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(STORE_NAME, 'readonly');
                var store = tx.objectStore(STORE_NAME);
                var req = store.getAll();
                req.onsuccess = function () {
                    var items = (req.result || []).map(fromStoredEntry).filter(Boolean);
                    resolve(items);
                };
                req.onerror = function (e) { reject(e.target.error); };
            });
        });
    }

    function remove(id) {
        if (!id) return Promise.resolve();
        var cacheKey = toCacheKey(id);
        return open().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(STORE_NAME, 'readwrite');
                var store = tx.objectStore(STORE_NAME);
                store.delete(cacheKey);
                tx.oncomplete = function () {
                    var msg = { type: 'delete', id: id, section: currentSection };
                    if (channel) channel.postMessage(msg);
                    notify(msg, false);
                    resolve();
                };
                tx.onerror = function (e) { reject(e.target.error); };
            });
        });
    }

    function scheduleSave(getIdFn, getDocFn, getErrorCountFn) {
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(function () {
            var id = typeof getIdFn === 'function' ? getIdFn() : null;
            if (id) {
                var doc = typeof getDocFn === 'function' ? getDocFn() : null;
                if (doc === null || doc === undefined) return;
                if (!draftsHasChanges(doc)) return;
                var errorCount = typeof getErrorCountFn === 'function' ? getErrorCountFn() : 0;
                save(id, doc, errorCount).catch(function (e) { console.warn('draftsCache save error:', e); });
            }
        }, 2000);
    }

    function onTabChange(callback) {
        subscribe(function (data, isRemote) {
            if (isRemote) callback(data);
        });
    }

    function getLatest() {
        return getAll().then(function (docs) {
            if (!docs || docs.length === 0) return null;
            docs.sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
            return docs[0];
        });
    }

    function cancelSave() {
        if (saveTimeout) {
            clearTimeout(saveTimeout);
            saveTimeout = null;
        }
    }

    return { open: open, save: save, get: get, getAll: getAll, getLatest: getLatest, remove: remove, scheduleSave: scheduleSave, cancelSave: cancelSave, onTabChange: onTabChange, subscribe: subscribe };
})() : null;

var draftsSyncing = false;
var historySyncing = false;
var historyInitHandled = false;
var draftsUi = {
    toggle: document.getElementById('sidebarToggle'),
    list: document.getElementById('draftsList'),
    more: document.getElementById('draftsMore'),
    empty: document.getElementById('draftsEmpty'),
    count: document.getElementById('draftsCount')
};

function getDraftDocValue() {
    if (docEditor && typeof docEditor.getValue === 'function') {
        return docEditor.getValue();
    }
    return null;
}

function getDraftValidationErrorCount() {
    if (!docEditor) return 0;
    var errors = [];
    if (docEditor.validation_results && docEditor.validation_results.length > 0) {
        if (typeof(errorFilter) !== 'undefined') {
            errors = errorFilter(docEditor.validation_results) || [];
        } else {
            errors = docEditor.validation_results;
        }
    }
    return errors.length || 0;
}

function renderDraftButtons(target, entries) {
    if (!target) return;
    target.textContent = '';
    entries.forEach(function (entry) {
        var btn = document.createElement('a');
        btn.className = 'lbl';
        btn.title=entry.id;
        var time = '';
        if (entry.updatedAt) {
            var updatedAt = new Date(entry.updatedAt);
            if (typeof textUtil !== 'undefined' && textUtil.formatFriendlyDate) {
                time = ` ${textUtil.formatFriendlyDate(updatedAt)}`;
            }
        }
        var DraftId = document.createElement('span');
        DraftId.appendChild(document.createTextNode(entry.id));
        btn.appendChild(DraftId);

        var Meta = document.createElement('span');
        var errorCount = typeof entry.errorCount === 'number' ? entry.errorCount : 0;
        if (errorCount > 0) {
            var badge = document.createElement('b');
            badge.className = 'bdg';
            badge.textContent = errorCount;
            badge.title = String(errorCount) + ' errors!';
            Meta.appendChild(badge);
        }
        if (time) {
            Meta.appendChild(document.createTextNode(time));
        }
        var del = document.createElement('span');
            del.className = 'sbn fbn vgi-x';
            del.title = 'Delete draft '+entry.id;
        del.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (!draftsCache || !draftsCache.remove) return;
            draftsCache.cancelSave();
            draftsCache.remove(entry.id);
        });
        Meta.appendChild(del);
        btn.appendChild(Meta);
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            if (draftsUi.toggle) {
                draftsUi.toggle.checked = true;
            }
            loadDraftFromCache(entry.id, false);
        });
        target.appendChild(btn);
    });
}

function refreshDraftsList() {
    if (!draftsUi.list || !draftsCache) return;
    draftsCache.getAll().then(function (entries) {
        entries = (entries || []).filter(function (entry) {
            return entry && entry.id && entry.doc;
        });
        entries.sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
        renderDraftButtons(draftsUi.list, entries);
        if (draftsUi.empty) {
            if(entries.length > 0) {
                draftsUi.empty.classList.add('hid');
            } else {
                draftsUi.empty.classList.remove('hid');
            }
        }
        if (draftsUi.count) {
            draftsUi.count.textContent = entries.length ? entries.length : '';
        }
    }).catch(function (e) {
        console.warn('draftsCache list error:', e);
    });
}

var soloDocParam = 'doc';

function getDocIdFromSearch(search) {
    var query = typeof search === 'string' ? search : window.location.search;
    if (!query) return null;
    if (typeof URLSearchParams !== 'undefined') {
        var params = new URLSearchParams(query);
        var docId = params.get(soloDocParam);
        if (!docId || docId === 'new') return null;
        return docId;
    }
    var pairs = query.replace(/^\?/, '').split('&');
    for (var i = 0; i < pairs.length; i++) {
        var part = pairs[i];
        if (!part) continue;
        var segments = part.split('=');
        var key = '';
        try {
            key = decodeURIComponent(segments[0] || '');
        } catch (e) {
            key = segments[0] || '';
        }
        if (key === soloDocParam) {
            var raw = segments.slice(1).join('=');
            if (!raw) return null;
            try {
                raw = decodeURIComponent(raw.replace(/\+/g, ' '));
            } catch (e) {}
            if (!raw || raw === 'new') return null;
            return raw;
        }
    }
    return null;
}

function buildSoloDraftUrl(docId) {
    if (typeof URL !== 'undefined') {
        try {
            var url = new URL(window.location.href);
            if (docId) {
                url.searchParams.set(soloDocParam, docId);
            } else {
                url.searchParams.delete(soloDocParam);
            }
            return url.pathname + url.search + url.hash;
        } catch (e) {}
    }
    return window.location.pathname + window.location.search + window.location.hash;
}

function getDocIdFromLocation() {
    if (soloMode) {
        return getDocIdFromSearch();
    }
    return getDocIdFromPath();
}

function maybeInitHistoryNavigation() {
    if (historyInitHandled || !soloMode) return;
    historyInitHandled = true;
    var targetId = getDocIdFromLocation();
    if (!targetId) return;
    handleHistoryNavigation({ state: { docId: targetId } });
}

function updateDraftHistory(nextUrl, entry) {
    if (historySyncing) return;
    if (!window.history || typeof window.history.pushState !== 'function') return;
    if (!soloMode && !nextUrl) return;
    var docId = entry && entry.id ? entry.id : null;
    var currentUrl = window.location.pathname + window.location.search + window.location.hash;
    var targetUrl = null;
    if (soloMode) {
        targetUrl = buildSoloDraftUrl(docId);
    } else {
        targetUrl = nextUrl;
        if (typeof URL !== 'undefined') {
            try {
                var resolved = new URL(nextUrl, window.location.href);
                targetUrl = resolved.pathname + resolved.search + resolved.hash;
            } catch (e) {
                targetUrl = nextUrl;
            }
        }
    }
    if (!targetUrl) return;
    if (targetUrl === currentUrl) return;
    window.history.pushState({ docId: docId }, '', targetUrl);
}

function getDocIdFromPath(pathname) {
    var path = typeof pathname === 'string' ? pathname : window.location.pathname;
    var parts = path.split('/').filter(Boolean);
    if (!parts.length) return null;
    var last = parts[parts.length - 1];
    if (!last || last === 'new') return null;
    try {
        return decodeURIComponent(last);
    } catch (e) {
        return last;
    }
}

function getDocBasePath(pathname) {
    var path = typeof pathname === 'string' ? pathname : window.location.pathname;
    var base = path.replace(/\/[^\/]*$/, '');
    return base ? base : '/';
}

function loadDocFromServer(docId) {
    var base = getDocBasePath();
    var url = base.replace(/\/$/, '') + '/json/' + encodeURIComponent(docId);
    return fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json, text/plain, */*'
        }
    }).then(function (response) {
        if (!response.ok) {
            throw Error(response.statusText || 'Failed to load document');
        }
        return response.json();
    }).then(function (data) {
        var doc = Array.isArray(data) ? data[0] : data;
        if (!doc) {
            throw Error('Document not found');
        }
        var body = doc.body || doc;
        loadJSON(body, docId, 'Loaded ' + docId);
    });
}

function loadSoloDocFallback(docId, done, loadNewDoc) {
    if (!docId) {
        loadNewDoc();
        return;
    }
    if (typeof cveLoad !== 'function') {
        loadNewDoc();
        return;
    }
    try {
        var result = cveLoad(docId);
        if (result && typeof result.then === 'function') {
            result.then(function () {
                done();
            }).catch(function (e) {
                console.warn('cveLoad error:', e);
                loadNewDoc();
            });
            return;
        }
        done();
    } catch (e) {
        console.warn('cveLoad error:', e);
        loadNewDoc();
    }
}

function handleHistoryNavigation(event) {
    if (historySyncing) return;
    var state = event && event.state ? event.state : null;
    var targetId = state && state.docId ? state.docId : getDocIdFromLocation();
    var currentId = null;
    try {
        currentId = getDocID();
    } catch (e) {}
    if (targetId === currentId || (!targetId && !currentId)) {
        return;
    }
    historySyncing = true;
    var done = function () { historySyncing = false; };
    var loadNewDoc = function () {
        if (typeof initJSON !== 'undefined') {
            loadJSON(initJSON || {}, null, 'New');
            if (mainTabGroup) {
                mainTabGroup.change(0);
            }
            done();
            return true;
        }
        done();
        if (!soloMode) {
            window.location.reload();
        }
        return false;
    };
    if (!targetId) {
        loadNewDoc();
        return;
    }
    if (draftsCache && draftsCache.get) {
        draftsCache.get(targetId).then(function (entry) {
            if (entry && entry.doc) {
                applyDraftEntry(entry);
                done();
                return;
            }
            if (soloMode) {
                loadSoloDocFallback(targetId, done, loadNewDoc);
                return;
            }
            loadDocFromServer(targetId).then(done).catch(function (e) {
                console.warn('history load error:', e);
                done();
                window.location.reload();
            });
        }).catch(function (e) {
            console.warn('draftsCache load error:', e);
            if (soloMode) {
                loadSoloDocFallback(targetId, done, loadNewDoc);
                return;
            }
            loadDocFromServer(targetId).then(done).catch(function (err) {
                console.warn('history load error:', err);
                done();
                window.location.reload();
            });
        });
        return;
    }
    if (soloMode) {
        loadSoloDocFallback(targetId, done, loadNewDoc);
        return;
    }
    loadDocFromServer(targetId).then(done).catch(function (e) {
        console.warn('history load error:', e);
        done();
        window.location.reload();
    });
}

function applyDraftEntry(entry) {
    if (!entry || !entry.doc) return;
    var nextUrl = entry.id ? './' + entry.id : "./new";
    if (!docEditor || !mainTabGroup) {
        if (!soloMode) {
            postUrl = nextUrl;
        }
        updateDraftHistory(nextUrl, entry);
        loadJSON(entry.doc, entry.id, 'Loaded draft ' + entry.id);
        return;
    }
    draftsSyncing = true;
    insync = true;
    try {
        docEditor.setValue(entry.doc);
    } catch (e) {
        console.warn('Failed to apply draft', e);
    }
    insync = false;
    if (docEditor && typeof docEditor.getValue === 'function') {
        draftsSetBaseline(docEditor.getValue());
    }
    if (entry.id) {
        document.title = entry.id;
    }
    if (!soloMode) {
        postUrl = nextUrl;
    }
    updateDraftHistory(nextUrl, entry);
    if (document.getElementById("save1")) {
        save1.className = "fbn save";
    }
    mainTabGroup.change(0);
    draftsSyncing = false;
}

function loadDraftFromCache(id, isSync) {
    if (!draftsCache || !id) return;
    draftsCache.get(id).then(function (entry) {
        if (!entry || !entry.doc) return;
        var nextUrl = entry.id ? './' + entry.id : "./new";
        if (!soloMode) {
            postUrl = nextUrl;
        }
        updateDraftHistory(nextUrl, entry);
        if (isSync) {
            applyDraftEntry(entry);
            return;
        }
        loadJSON(entry.doc, entry.id, 'Loaded draft ' + entry.id);
    }).catch(function (e) {
        console.warn('draftsCache load error:', e);
    });
}

function initDraftsSidebar() {
    if (!draftsUi.list || !draftsCache) return;
    refreshDraftsList();
    draftsCache.subscribe(function () {
        refreshDraftsList();
    });
    draftsCache.onTabChange(function (data) {
        if (!data || data.type !== 'update' || !data.id) return;
        if (data.section && data.section !== schemaName) return;
        var currentId = getDocID();
        if (currentId && currentId === data.id) {
            loadDraftFromCache(data.id, true);
        }
    });
}

JSONEditor.defaults.languages.en.error_oneOf = "Please fill in the required fields *";

JSONEditor.AbstractEditor.prototype.showStar = function () {
    return this.isRequired() && !(this.schema.readOnly || this.schema.readonly || this.schema.template)
}

JSONEditor.AbstractEditor.prototype.addLinks = function () {
    /* Add links */
    if (!this.no_link_holder) {
      this.link_holder = this.theme.getLinksHolder()
      /* if description element exists, insert the link before */
      if (typeof this.description !== 'undefined') this.description.parentNode.insertBefore(this.link_holder, this.description)
      /* otherwise just insert link at bottom of container */
      else this.container.appendChild(this.link_holder)
      if (this.schema.links) {
        for (let i = 0; i < this.schema.links.length; i++) {
            var link = this.schema.links[i];
            //todo: refactor
            var style = null;
            if(link.class) {
                style=link.class;
                delete link.class;
            }
            var h = this.getLink(link);
            if(style) {
                    h.setAttribute('class', style);
                    h.removeAttribute('style')
            }
            if(link.id) {
                h.setAttribute('id', link.id)
            }
            if(link.style) {
                h.setAttribute('style', link.style);
            }
            if(link.title) {
                h.setAttribute('title', link.title);
            }
            if(link.target === false) {
                h.removeAttribute('target')
            } else {
                h.setAttribute('target', link.target)
            }
            if(link.onclick) {
                h.setAttribute('onclick', link.onclick);
            }
            if(link.place == "container" && this.container) {
                this.container.appendChild(h);
            } else if (link.place == "header" && this.header) {
                this.header.appendChild(h);
            } else {
                this.addLink(h)
            }
        }
      }
    }
  }

JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.type === "string" && schema.format === "radio") {
        return "radio";
    }
});

JSONEditor.defaults.templates.custom = function () {
    return {
        compile: function (template) {
            return function (context) {
                // context contains values of watched fields.
                // XXX: careful with remote JSON schemas.
                var ret = eval(template);
                return ret;
            };
        }
    };
};

JSONEditor.defaults.editors.array = class mystring extends JSONEditor.defaults.editors.array {
    build() {
        super.build();
        if (this.header) {
            if(this.options.class) {
                this.header.className = 'lbl ' + this.options.class;
            }
            if(this.showStar()){
                this.header.className = this.header.className + ' req'; 
            }
        }
    }
    /* move the delete button next to object title */
    _createDeleteButton (i, holder) {
        var r = super._createDeleteButton(i, holder);
        r.setAttribute('class', 'rbtn vgi-x');
        r.innerHTML = '';
        r.parentNode.setAttribute("vg","obj-del");
        if(!this.options.disable_array_add) {
            r.parentNode.parentNode.setAttribute("vg","array-obj");
        }
        return r;
    }
}

JSONEditor.defaults.editors.table = class mystring extends JSONEditor.defaults.editors.table {
    build() {
        super.build();
        if(this.options.hide_header && this.thead) {
            if(this.thead.parentNode) {
                this.thead.parentNode.removeChild(this.thead);
            }
            this.thead = null;
        } else {
            this._removeControlsHeader();
            this._toggleHeader();
        }
        if(this.schema && this.schema.options && this.schema.options.table_class != undefined) {
            this.table.className = this.schema.options.table_class;
        }
        if (this.header) {
            if(this.options.class) {
                this.header.className = 'lbl ' + this.options.class;
            }
            if(this.showStar()){
                this.header.className = this.header.className + ' req'; 
            } 
        }
        if(this.hide_delete_last_row_buttons) { this.delete_last_row_button.style.display = 'none'; }
        if(this.hide_delete_all_rows_buttons) { this.remove_all_rows_button.style.display = 'none'; }        
    }
    refreshValue() {
        super.refreshValue();
        this._toggleHeader();
    }
    _removeControlsHeader() {
        if(!this.thead) return;
        var ths = this.thead.querySelectorAll('th');
        for (var i = ths.length - 1; i >= 0; i--) {
            var th = ths[i];
            var text = th.textContent ? th.textContent.trim().toLowerCase() : '';
            if (text === 'controls' && th.parentNode) {
                th.parentNode.removeChild(th);
            }
        }
    }
    _toggleHeader() {
        var len = (Array.isArray(this.value)) ? this.value.length : 0;
        if (this.table) {
            this.table.style.display = len ? '' : 'none';
        }
        if(!this.thead) return;
        if(this.options.hide_header) {
            this.thead.style.display = 'none';
            return;
        }
        this.thead.style.display = len ? '' : 'none';
    }
}

JSONEditor.defaults.editors.object = class mystring extends JSONEditor.defaults.editors.object {
    build() {
        super.build();
        if (this.title) {
            if(this.options.class) {
                this.title.className = this.title.className + ' ' + this.options.class;
            }
            if(this.showStar()){
                this.title.className = this.title.className + ' req'; 
            }    
        }
        if(this.container && this.options.containerClass) {
            this.container.className = this.container.className + ' ' + this.options.containerClass;
        }
    }
    getValue () {
        if (!this.dependenciesFulfilled) {
          return undefined
        }
        const result = this.value;
        const isEmpty = obj => typeof obj === 'undefined' || obj === '' ||
        (
          obj === Object(obj) &&
          Object.keys(obj).length === 0 &&
          obj.constructor === Object
        ) || (Array.isArray(obj) && obj.length === 0)
        if (result && (this.jsoneditor.options.remove_empty_properties || this.options.remove_empty_properties)) {
          Object.keys(result).forEach(key => {
            var req = (Array.isArray(this.schema.required)) && this.schema.required.includes(key);
            if (isEmpty(result[key]) && !req) {
              delete result[key]
            }
          })
        }
        return result
    }
}

JSONEditor.defaults.editors.number = class mystring extends JSONEditor.defaults.editors.number {
    build() {
        super.build();
        setControlFormat(this.control, this.schema);
        var parsedClasses = parseOptionClasses(this.options && this.options.class);
        if(this.label && this.options.class) {
            if(parsedClasses.otherClasses.length > 0) {
                this.label.className = this.label.className + ' ' + parsedClasses.otherClasses.join(' ');
            }
            if(this.showStar()){
                this.label.className = this.label.className + ' req'; 
            }
        }
        if(parsedClasses.iconClass) {
            addTextInputIcon(this.input, parsedClasses.iconClass);
        }
        if(this.options.formClass) {
            this.control.className = this.control.className + ' ' + this.options.formClass;
        }
        //Use html5 datalist to show examples 
        if(this.schema.examples && this.schema.examples.length > 0){
            var dlist = document.createElement('datalist');
            dlist.setAttribute('id', this.path + '-datalist');
            var eg = this.schema.examples;
            for(var i = 0; i< eg.length; i++) {
                var v = document.createElement('option');
                v.setAttribute('value', eg[i]);
                dlist.appendChild(v);
            }
            this.input.setAttribute('list', this.path + '-datalist');
            this.input.type='search';
            this.container.appendChild(dlist);
        }
    }
}

JSONEditor.defaults.editors.string = class mystring extends JSONEditor.defaults.editors.string {

    build() {
        super.build();
        setControlFormat(this.control, this.schema);
        var parsedClasses = parseOptionClasses(this.options && this.options.class);
        if(this.label && this.options.class) {
            if(parsedClasses.otherClasses.length > 0) {
                this.label.className = this.label.className + ' ' + parsedClasses.otherClasses.join(' ');
            }
            if(this.showStar()){
                this.label.className = this.label.className + ' req'; 
            }
        }
        if(parsedClasses.iconClass) {
            addTextInputIcon(this.input, parsedClasses.iconClass);
        }
        if(this.options.formClass) {
            this.control.className = this.control.className + ' ' + this.options.formClass;
        }
        //Use html5 datalist to show examples 
        if(this.schema.examples && this.schema.examples.length > 0){
            var dlist = document.createElement('datalist');
            dlist.setAttribute('id', this.path + '-datalist');
            var eg = this.schema.examples;
            for(var i = 0; i< eg.length; i++) {
                var v = document.createElement('option');
                v.setAttribute('value', eg[i]);
                dlist.appendChild(v);
            }
            this.input.setAttribute('list', this.path + '-datalist');
            this.input.type='search';
            this.container.appendChild(dlist);
        }
    }
};

//use for unique Idenifiers for an element's id attributes
var uid = 1;

JSONEditor.defaults.editors.radio = class radio extends JSONEditor.AbstractEditor {
    setValue(value, initial) {
        value = this.typecast(value || '');
        // Sanitize value before setting it
        var sanitized = value;
        if (this.schema.enum.indexOf(sanitized) < 0) {
            sanitized = this.schema.enum[0];
        }

        if (this.value === sanitized) {
            return;
        }

        var self = this;
        for (var input in this.inputs) {
            if (input === sanitized) {

                this.inputs[input].checked = true;
                self.value = sanitized;
                self.jsoneditor.notifyWatchers(self.path);
                return false;
            }
        }
    }
    register() {
        super.register();
        if (!this.inputs) return;
        for (var i = 0; i < this.inputs.length; i++) {
            this.inputs[i].setAttribute('name', this.formname);
        }
    }
    unregister(){
        super.unregister();
        if (!this.inputs) return;
        for (var i = 0; i < this.inputs.length; i++) {
            this.inputs[i].removeAttribute('name');
        }
    }
    getNumColumns() {
        var longest_text = this.getTitle().length;
        for (var i = 0; i < this.schema.enum.length; i++) {
            longest_text = Math.max(longest_text, this.schema.enum[i].length + 4);
        }
        return Math.min(12, Math.max(longest_text / 7, 2));
    }
    typecast(value) {
        if (this.schema.type === "boolean") {
            return !!value;
        } else if (this.schema.type === "number") {
            return 1 * value;
        } else if (this.schema.type === "integer") {
            return Math.floor(value * 1);
        } else {
            return "" + value;
        }
    }
    getValue() {
        return this.value;
    }
    removeProperty() {
        super.removeProperty();
        for (var i = 0; i < this.inputs.length; i++) {
            this.inputs[i].style.display = 'none';
        }
        if (this.description) this.description.style.display = 'none';
        this.theme.disableLabel(this.label);
    }
    addProperty() {
        super.addProperty();
        for (var i = 0; i < this.inputs.length; i++) {
            this.inputs[i].style.display = '';
        }
        if (this.description) this.description.style.display = '';
        this.theme.enableLabel(this.label);
    }
    sanitize(value) {
        if (this.schema.type === "number") {
            return 1 * value;
        } else if (this.schema.type === "integer") {
            return Math.floor(value * 1);
        } else {
            return "" + value;
        }
    }
    build() {
        var self = this,
            i;
        if (!this.options.compact) {
            this.header = this.label = this.theme.getFormInputLabel(this.getTitle());
        }
        if(this.label && this.options.class) {
            this.label.className = this.label.className + ' ' + this.options.class;
            if(this.showStar()){
                this.label.className = this.label.className + ' req'; 
            }
        }

        if (this.schema.options && this.schema.options.infoText) {
            this.label.setAttribute('title', this.schema.options.infoText);
        }
        if (this.schema.description) this.description = this.theme.getFormInputDescription(this.schema.description);

        this.select_options = {};
        this.select_values = {};

        var e = this.schema.enum || [];
        var options = [];
        for (i = 0; i < e.length; i++) {
            // If the sanitized value is different from the enum value, don't include it
            if (this.sanitize(e[i]) !== e[i]) continue;

            options.push(e[i] + "");
            this.select_values[e[i] + ""] = e[i];
        }

        this.input_type = 'radiogroup';
        this.inputs = {};
        this.controls = {};
        for (i = 0; i < options.length; i++) {
            this.inputs[options[i]] = this.theme.getRadio();
            this.inputs[options[i]].setAttribute('value', options[i]);
            this.inputs[options[i]].setAttribute('name', this.formname);
            var xid = uid++;
            this.inputs[options[i]].setAttribute('id', xid);
            var label = this.theme.getRadioLabel((this.schema.options && this.schema.options.enum_titles && this.schema.options.enum_titles[i]) ?
                this.schema.options.enum_titles[i] :
                options[i]);
            label.setAttribute('for', xid);
            if(this.schema.options && this.schema.options.tooltips && this.schema.options.tooltips[options[i]]) {
                label.setAttribute('title', this.schema.options.tooltips[options[i]]);
            }
            var rdicon = null;
            if(this.options.icons && this.options.icons[options[i]]) {
                rdicon = this.options.icons[options[i]];
            } else if (iconMap[options[i]]) {
                rdicon = iconMap[options[i]];
            }
            label.setAttribute('class', 'lbl' + (rdicon ? ' ' + iconTheme + rdicon  : ''));
            this.controls[options[i]] = this.theme.getFormControl(this.inputs[options[i]], label);
        }

        this.control = this.theme.getRadioGroupHolder(this.controls, this.label, this.description);
        this.container.appendChild(this.control);
        this.control.addEventListener('change', function (e) {
            e.preventDefault();
            e.stopPropagation();

            var val = e.target.value;

            var sanitized = val;
            if (self.schema.enum.indexOf(val) === -1) {
                sanitized = self.schema.enum[0];
            }

            self.value = sanitized;

            if (self.parent) self.parent.onChildEditorChange(self);
            else self.jsoneditor.onChange();
            self.jsoneditor.notifyWatchers(self.path);
        });
    }
    enable() {
        if (!this.always_disabled) {
            var opts = Object.keys(this.inputs);
            for (var i = 0; i < opts.length; i++) {
                this.inputs[opts[i]].disabled = false;
            }
        }
        super.enable();
    }
    disable() {
        //console.log(this.inputs);
        var opts = Object.keys(this.inputs);
        for (var i = 0; i < opts.length; i++) {
            this.inputs[opts[i]].disabled = true;
        }
        super.disable();
    }
    destroy() {
        if (this.label) this.label.parentNode.removeChild(this.label);
        if (this.description) this.description.parentNode.removeChild(this.description);
        for (var i = 0; i < this.inputs.length; i++) {
            this.inputs[i].parentNode.removeChild(this.inputs[i]);
        }
        super.destroy();
    }
};

function tzOffset(x) {
    var offset = new Date(x).getTimezoneOffset(),
        o = Math.abs(offset);
    return (offset < 0 ? "+" : "-") + ("00" + Math.floor(o / 60)).slice(-2) + ":" + ("00" + (o % 60)).slice(-2);
}

// The time is displayed/set in local times in the input,
//  but setValue, getValue use UTC. JSON output will be in UTC.
const localTZ = (new Date).toLocaleString("en", {timeZoneName: "short"}).split(" ").pop();
JSONEditor.defaults.editors.dateTime = class dateTime extends JSONEditor.defaults.editors.string{
    getValue() {
        if (this.value && this.value.length > 0) {
            if (this.value.match(/^\d{4}-\d{2}-\d{2}T[\d\:\.]+$/)) {
                this.value = this.value + tzOffset(this.value);
            }
            var d = new Date(this.value);
            if (d instanceof Date && !isNaN(d.getTime())) {
                return d.toISOString();
            } else {
                return this.value;
            }
        } else {
            return "";
        }
    }
    setValue(val) {
        if (val && this.value.match(/^\d{4}-\d{2}-\d{2}T[\d\:\.]+$/)) {
            val = val + tzOffset();
        }
        var d = new Date(val);
        if (d instanceof Date && !isNaN(d.getTime()) && d.getTime() > 0) {
            var x = new Date((d.getTime() - (d.getTimezoneOffset() * 60000)));
            this.value =
                this.input.value = x.toJSON().slice(0, 16);
        } else {
            this.value = this.input.value = "";
        }
        this.jsoneditor.notifyWatchers(this.path);
    }
    build() {
        this.schema.format = "datetime-local";
        super.build();
        this.input.className = "txt";
        this.input.setAttribute("tz", localTZ);
    }
};


JSONEditor.defaults.editors.taglist = class taglist extends JSONEditor.defaults.editors.string {
    getValue() {
        if(this.tagify && this.tagify.value) {
            return this.tagify.value.map(item => item.value);
        } else {
            return [];
        }
    }
    setValue(val) {
        if (val instanceof Array) {
            this.tagify.removeAllTags();
            this.tagify.addTags(val);
        } else {
            this.tagify.addTags(val.split(','));
        }
        this.onChange(true);
    }
    build() {
        this.schema.format = "taglist";
        super.build();
        var tagClasses = {};
        var iconSources = [
            this.schema && this.schema.items && this.schema.items.options && this.schema.items.options.icons,
            this.schema && this.schema.options && this.schema.options.icons,
            this.options && this.options.icons
        ];
        for (var srcIdx = 0; srcIdx < iconSources.length; srcIdx++) {
            var src = iconSources[srcIdx];
            if (src && typeof src === 'object') {
                Object.keys(src).forEach(function (key) {
                    tagClasses[key] = src[key];
                });
            }
        }
        if (!Object.keys(tagClasses).length) {
            tagClasses = null;
        }
        //console.log('list'+ this.schema.items.examples);
        this.tagify = new Tagify(this.input, {
            whitelist: this.schema.items.enum ? this.schema.items.enum : (this.schema.items.examples ? this.schema.items.examples : []),
            enforceWhitelist: this.schema.items.enum ? true : false,
            maxTags: this.schema.maxItems ? this.schema.maxItems : 512,
            transformTag: function(tagData) {
                if (!tagClasses || !tagData || tagData.value === null || tagData.value === undefined) return;

                var tagValue = String(tagData.value);
                var mappedClass = tagClasses[tagValue];
                if (typeof mappedClass !== 'string' || !mappedClass.trim()) return;

                var existingClasses = [];
                if (typeof tagData.class === 'string' && tagData.class.trim()) {
                    existingClasses = tagData.class.trim().split(/\s+/);
                }
                var mappedClasses = mappedClass.trim().split(/\s+/).map(function (cls) {
                    if (!cls) return cls;
                    // `options.icons` values are icon keys; normalize to CSS classes used in this app.
                    if (cls.indexOf(iconTheme) === 0) return cls;
                    return iconTheme + cls;
                });
                var mergedClasses = [];
                var seen = {};
                var i;

                for (i = 0; i < existingClasses.length; i++) {
                    if (!existingClasses[i] || seen[existingClasses[i]]) continue;
                    seen[existingClasses[i]] = true;
                    mergedClasses.push(existingClasses[i]);
                }
                for (i = 0; i < mappedClasses.length; i++) {
                    if (!mappedClasses[i] || seen[mappedClasses[i]]) continue;
                    seen[mappedClasses[i]] = true;
                    mergedClasses.push(mappedClasses[i]);
                }

                if (mergedClasses.length) {
                    tagData.class = mergedClasses.join(' ');
                }
            },
            dropdown: {
              maxItems: 40,           // <- mixumum allowed rendered suggestions
              classname: "tags-look", // <- custom classname for this dropdown, so it could be targeted
              enabled: 0,             // <- show suggestions on focus
              closeOnSelect: false    // <- do not hide the suggestions dropdown once an item has been selected
            }
          })
        if(this.options && this.options.inputAttributes && this.options.inputAttributes.placeholder) {
            this.input.setAttribute('placeholder', this.options.inputAttributes.placeholder)
        }
    }
};

JSONEditor.defaults.editors.simplehtml = class simplehtml extends JSONEditor.defaults.editors.string {
    getValue() {
        var ret = super.getValue();
        if (this.simpleHtml) {
            ret = this.simpleHtml.getValue();
        }
        return ret;
    }

    setValue (value,initial,from_template) {
        super.setValue(value,initial,from_template);
        if (this.simpleHtml) {
            var nextValue = value == null ? '' : value;
            var priorVal = this.simpleHtml.getValue();
            this.simpleHtml.setValue(nextValue);
            var currentVal = this.simpleHtml.getValue();
            if (priorVal !== currentVal) {
                this.value = this.input.value = currentVal;
                this.onChange(true);
            }
        }
    }
    build() {
        this.schema.format = this.format = 'hidden';
        super.build();
        if(this.label && this.options.class) {
            this.label.className = this.label.className + ' ' + this.options.class;
            if(this.showStar()){
                this.label.className = this.label.className + ' req'; 
            }
        }
        this.control.className = 'simplehtml form-control';
        this.simpleHtmlHost = document.createElement('div');
        this.simpleHtmlHost.className = 'simplehtml-editor';
        this.input.parentNode.appendChild(this.simpleHtmlHost);
    }
    afterInputReady () {
        var self = this;
        var placeholder = (this.options && this.options.inputAttributes && this.options.inputAttributes.placeholder) ||
            (this.schema && this.schema.placeholder) || '';
        var options = {
            content: this.input.value || ''
        };
        if (placeholder) {
            options.placeholder = placeholder;
        }
        this.simpleHtml = new SimpleHtml(this.simpleHtmlHost, options);

        var syncValue = function () {
            var current = self.simpleHtml.getValue();
            if (current !== self.input.value) {
                self.value = self.input.value = current;
                self.is_dirty = true;
                self.onChange(true);
            }
        };

        this.simpleHtml.contentArea.addEventListener('input', syncValue);
        this.simpleHtml.sourceArea.addEventListener('input', syncValue);
        this.simpleHtml.contentArea.addEventListener('blur', syncValue);
        this.simpleHtml.sourceArea.addEventListener('blur', syncValue);

        var cleaned = this.simpleHtml.getValue();
        if (cleaned !== this.input.value) {
            this.value = this.input.value = cleaned;
        }
    }
    showValidationErrors(errs) {
        var self = this;

        if(this.jsoneditor.options.show_errors === "always") {}
        else if(!this.is_dirty && this.previous_error_setting===this.jsoneditor.options.show_errors) return;
        
        this.previous_error_setting = this.jsoneditor.options.show_errors;
    
        var messages = [];
        errs.forEach(i => {
            if(i.path === self.path) {
                messages.push(i.message);
            }
        });    
        if(messages.length) {
          this.theme.addInputError(this.control, messages.join('. ')+'.');
        }
        else {
          this.theme.removeInputError(this.control);
        }
    }
};

// Instruct the json-editor to use the custom datetime-editor.
JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.type === "string" && schema.format === "datetime") {
        return "dateTime";
    }
});

JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.type === "array" && schema.format === "taglist") {
        return "taglist";
    }

});

JSONEditor.defaults.resolvers.unshift(function (schema) {
    if (schema.type === "string" && schema.format === "simplehtml") {
        return "simplehtml";
    }
});
/*
JSONEditor.defaults.editors.upload =
    JSONEditor.defaults.editors.upload.extend({
        build: function () {
            this._super();
            this.uploader.className = "fbn";
            var a = document.createElement('a');
            a.className = 'fbn icn download';
            a.target = "_blank";
            this.control.replaceChild(a, this.label);
            this.control.appendChild(this.preview);
            this.label = this.title = a;
        },
        setValue: function (val) {
            if (this.value !== val) {
                this.title.href = window.location + '/file/' + encodeURIComponent(val);
                this.title.textContent = val;
                this._super(val);
            }
        },
        refreshPreview: function () {
            if (this.last_preview === this.preview_value) return;
            this.last_preview = this.preview_value;

            this.preview.innerHTML = '';

            if (!this.preview_value) return;

            var self = this;

            var mime = this.preview_value.match(/^data:([^;,]+)[;,]/);
            if (mime) mime = mime[1];
            if (!mime) mime = 'unknown';

            var file = this.uploader.files[0];

            this.preview.textContent = textUtil.fileSize(file.size);
            var uploadButton = this.getButton('Upload', 'upload', 'Upload');
            uploadButton.className ='btn icn indent sfe save';
            this.preview.appendChild(uploadButton);
            uploadButton.addEventListener('click', function (event) {
                event.preventDefault();

                uploadButton.setAttribute("disabled", "disabled");
                self.theme.removeInputError(self.uploader);

                if (self.theme.getProgressBar) {
                    self.progressBar = self.theme.getProgressBar();
                    self.preview.appendChild(self.progressBar);
                }

                self.jsoneditor.options.upload(self.path, file, {
                    success: function (url) {
                        self.setValue(url);

                        if (self.parent) self.parent.onChildEditorChange(self);
                        else self.jsoneditor.onChange();

                        if (self.progressBar) self.preview.removeChild(self.progressBar);
                        uploadButton.textContent = 'Done';
                        uploadButton.setAttribute('value', 'Done');
                        uploadButton.setAttribute('disabled', true);
                    },
                    failure: function (error) {
                        self.theme.addInputError(self.uploader, error);
                        if (self.progressBar) self.preview.removeChild(self.progressBar);
                        uploadButton.removeAttribute("disabled");
                        uploadButton.textContent = "Upload";

                    },
                    updateProgress: function (progress) {
                        if (self.progressBar) {
                            if (progress) self.theme.updateProgressBar(self.progressBar, progress);
                            else self.theme.updateProgressBarUnknown(self.progressBar);
                        }
                    }
                });
            });
        }
    });
*/

var iconMapping = {
    collapse: 'down',
      expand: 'add',
      delete: 'x',
      moveup: 'up',
      movedown: 'down'
};

JSONEditor.defaults.iconlibs.vgi = class CustomIconLib extends JSONEditor.AbstractIconLib {
    constructor () {
      super();
      this.mapping = iconMapping;
      this.icon_prefix = 'vgi-';
    }
  }

JSONEditor.defaults.options.iconlib = 'vgi';

JSONEditor.defaults.themes.customTheme = class customTheme extends JSONEditor.AbstractTheme{
    getBlockLink() {
        var link = document.createElement('a');
        return link;
    }
    getLinksHolder() {
            var el = document.createElement('span');
            return el;
      }
    getDescription (text) {
        var el = document.createElement('summary');
        return el;
    }
  getFormControl(label, input, description, infoText) {
      var el = super.getFormControl(label, input, description, infoText);
      if(input.type =='text')
        input.className = 'txt';
      return el;
  }
    getFormInputLabel(text) {
        var el = super.getFormInputLabel(text);
        el.className = 'lbl' + (iconMap[text]? ' ' + iconTheme + iconMap[text] : '');
        return el;
    }
  /*  getIndentedPanel() {
        var el = super.getIndentedPanel();
    //    el.classList.add("indent");
        return el;
    }*/
    getHeader(text) {
        var el = document.createElement('span');
        if (typeof text === "string") {
            el.textContent = text;
            if(iconMap[text])
                el.className =  iconTheme + iconMap[text];
        } else {
            if(iconMap[text.textContent])
                text.className = iconTheme + iconMap[text.textContent];
            el.appendChild(text);
        }
        return el;
    }
    getTable() {
        var el = super.getTable();
        el.className = 'nobor';
        return el;
    }
    getTableHeaderCell (text) {
            const el = document.createElement('b')
            if(this.options && this.options.class) {
                el.className = this.options.class
            } else if(iconMap[text]) {
                el.className = iconTheme + iconMap[text];
            }
            el.textContent = text == ' ' ? '': text;
            const t = document.createElement('th');
            t.appendChild(el);
            return t
    }
    getButton(text, icon, title) {
        var el = document.createElement('button');
        el.type = 'button';
        el.className = 'btn';
        this.setButtonText(el,text,icon,title);
        return el;
    }
    addInputError(input, text) {
        try {
            input.setCustomValidity(text);
            input.onfocus = function(){ this.reportValidity(); }
            input.oninput = function(){ this.setAttribute("novalidate", true); this.setCustomValidity('')}
        } catch(e) {}
        input.style.boxShadow = "0px 0px 0px 2px rgba(252, 114, 114, 0.33)";        
        input.style.border = "1px solid coral";
        if(text && text != 'Value required.') {
            if (!input.errmsg) {
                var group = this.closest(input, '.form-control');
               /* var label = group.getElementsByClassName('lbl');
                if(label && label[0]){
                    group = label[0];
                }*/
                input.errmsg = document.createElement('div');
                //input.errmsg.setAttribute('class', 'lbl tred indent');
                input.errmsg.style = input.errmsg.style || {};
                group.appendChild(input.errmsg);
            } else {
                input.errmsg.style.display = 'block';
            }
            input.errmsg.setAttribute('class', 'lbl tred');
            input.errmsg.textContent = '';
            input.errmsg.appendChild(document.createTextNode(' ' + text));
        }
        if(input.errmsg) {
            input.errmsg.setAttribute('class', 'lbl tred');
        }
    }
    removeInputError(input) {
        try{
        input.setCustomValidity('');
        } catch(e) {}
        input.style.border = '';
        input.style.boxShadow = '';
        if (input.errmsg) input.errmsg.style.display = 'none';
    }
    getRadio() {
        var el = this.getFormInputField('radio');
        return el;
    }
    getRadioGroupHolder(controls, label, description) {
        var el = document.createElement('div');
        var radioGroup = document.createElement('div');
        radioGroup.className = 'rdg';

        if (label) {
            el.appendChild(label);
        }
        el.appendChild(radioGroup);
        for (var i in controls) {
            if (!controls.hasOwnProperty(i)) continue;
            radioGroup.appendChild(controls[i]);
        }

        if (description) el.appendChild(description);
        return el;
    }
    getRadioLabel(text) {
        var el = this.getFormInputLabel(text);
        return el;
    }
    getProgressBar() {
        var max = 100,
            start = 0;

        var progressBar = document.createElement('progress');
        progressBar.setAttribute('max', max);
        progressBar.setAttribute('value', start);
        return progressBar;
    }
    updateProgressBar(progressBar, progress) {
        if (!progressBar) return;
        progressBar.setAttribute('value', progress);
    }
    updateProgressBarUnknown(progressBar) {
        if (!progressBar) return;
        progressBar.removeAttribute('value');
    }
    /*getSelectInput(options) {
        var select = document.createElement('select');
        //select.className = 'txt';
        if(options)     this.setSelectOptions(select, options);
        return select;
    }*/
    setGridColumnSize(el, size) {
      el.className = el.className + ' col s' + size;
    } 
    getSwitcher (options) {
        const switcher = this.getSelectInput(options, false);
        switcher.classList.add('je-switcher');
        if(! /^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
            switcher.classList.add('rdg');
            switcher.setAttribute('size',2);
        }
        return switcher
    }
};

JSONEditor.defaults.themes.customTheme.rules = {};

if (typeof(custom_validators) !== 'undefined'){
    JSONEditor.defaults.custom_validators = custom_validators;
}

var docEditorOptions = {
    // Enable fetching schemas via ajax
    ajax: allowAjax,
    theme: 'customTheme',
    show_errors: 'always',
    disable_collapse: true,
    disable_array_reorder: true,
    disable_properties: true,
    disable_edit_json: true,
    disable_array_delete_last_row: true,
    disable_array_delete_all_rows: true,
    input_width: '3em',
    input_height: '4em',
    template: 'custom',
    prompt_before_delete: false,
    ajaxBase: ajaxBase,
    schema: docSchema,
    // Seed the form with a starting value
    //starting_value: {},

    // Disable additional properties
    //no_additional_properties: false,

    // Require all properties by default
    //required_by_default: false,
    remove_empty_properties: true
    //display_required_only: true
};
var docEditor;

function hashChange() {
    if(window.location.hash) {
        var hash = window.location.hash.substring(1);
        if((hash) && document.getElementById(hash+'Tab')) {
            selected = hash+'Tab';
            var t = document.getElementById(selected);
            t.checked = true;
            var event = new Event('change');
            t.dispatchEvent(event);
        }
    }
}

window.onhashchange = hashChange;

var selected = "editorTab";
if (typeof(defaultTab) !== 'undefined') {
    selected = defaultTab;
} else {
    if(window.location.hash) {
        var hash = window.location.hash.substring(1);
        if((hash) && document.getElementById(hash+'Tab')){
            selected = hash+'Tab';
        }
    }
}
var insync = false;

function Tabs(tabGroupId, tabOpts, primary) {
    var elem = document.getElementById(tabGroupId);
    var tg = {
        changeIndex: [],
        primary: primary,
        tabOpts: tabOpts,
        tabId: [],
        element: elem,
        tabs: elem.getElementsByClassName("tab"),
    }; 
    for (var i = 0; i < tg.tabs.length; i++) {
        
        var tab = tg.tabs[i];
        //console.log(tab.nextElementSibling);
        tab.nextElementSibling._tgIndex = tab._tgIndex = i;
        if(tab.id){
            tg.tabId[i] = tab.id;
        }
        tg.changeIndex[i]=0;
        tab.addEventListener('change', function(event){
            //console.log('CLicked ' + JSON.stringify( event) + ' ; ' + event.target);
            tg.select(event, event.target);
        });
    }
    tg.changeIndex[0] = 1;
    tg.select = function (event, elem) {
        //errMsg.textContent = "";
        var selected = elem._tgIndex;
        //Does the tab need an update?
        //console.log('===CLICK====' + selected + ' cI '  + tg.changeIndex);
        if (tg.changeIndex[selected] < Math.max(...tg.changeIndex)) {
            var val = tg.getValue();
            //console.log('VAL = ' + val);
            if (val) {
                if(selected != primary){
                    //console.log(' Then Setting ' + selected);
                    tg.setValue(selected, val);
                    tg.changeIndex[selected] = tg.changeIndex[primary];
                }
            } else {
                event.preventDefault();
                return;
            }
        }
        if (soloMode) {
            window.location.hash = tg.tabId[selected].replace(/Tab$/,'');
        }
    },
    tg.getValue = function (i) {
        if(i == undefined) {
            var maxi = 0;
            for (var m = 0; m < tg.tabs.length; m++) {
                if (tg.changeIndex[m] > tg.changeIndex[maxi]) {
                    maxi = m;
                }
            }
            var src = tg.tabId[maxi];
            //console.log('Most current = ' + maxi);
            if (src && tg.tabOpts[src].validate) {
                    //console.log('Validating ' + src );
                    var ret = tg.tabOpts[src].validate();
                    //console.log(' Got = ' + ret)
                    if(ret == -1) {
                        //event.preventDefault();
                        return undefined;
                    }
            }
            var val = tg.getValue(maxi);
            var primaryChanged = false;
            if(maxi != primary) {
                //console.log(' First Setting ' + primary);
                tg.setValue(primary, val);
                primaryChanged = true;
                tg.changeIndex[primary] = tg.changeIndex[maxi];
                var primaryOpts = tg.tabOpts[tg.tabId[primary]];
                if (primaryOpts && primaryOpts.validate) {
                    //console.log('validating Primary');
                    primaryOpts.validate();
                }
            }
            if (!primaryChanged) {
                return val;
            }
            i = primary;
        }
        //console.log('geting tab '+i);
        if(tg.tabOpts[tg.tabId[i]] && tg.tabOpts[tg.tabId[i]].getValue) {
            return tg.tabOpts[tg.tabId[i]].getValue();
        } else {
            return undefined;
        }
    }
    tg.setValue = function (index, val) {
        //console.log('Seting tab '+index+ ' + ' + tg.tabId[index] + "="+JSON.stringify(tg.tabOpts));
        if(tg.tabOpts[tg.tabId[index]] && tg.tabOpts[tg.tabId[index]].setValue) {
            //console.log('tab INDEX',tg.tabId);
            return tg.tabOpts[tg.tabId[index]].setValue(val);
        }
    }
    tg.focus = function(index) {
        if (!insync) {
            if(tg.tabs[index]) {
                tg.tabs[index].checked = true;
                tg.tabs[index].dispatchEvent(new Event('change'));
            } else {
                console.log('no tab');
            }
        }
    }
    tg.change = function(index) {
        if (!insync) {
            tg.changeIndex[index]++;
            if (!realtimeApplying) {
                errMsg.textContent = '';
                editorLabel.className = "lbl";
                infoMsg.textContent = 'Edited';
                var nid = getDocID();
                if (!draftsSyncing && draftsCache && draftsCache.scheduleSave) {
                    draftsCache.scheduleSave(getDocID, getDraftDocValue, getDraftValidationErrorCount);
                }
            }
            if (typeof tg.onChange === 'function') {
                tg.onChange(index, realtimeApplying);
            }
            //console.log('Inc '+ tg.tabId[index] + ' is ' + tg.changeIndex[index]);
        }
    }
    return tg;
};

var originalTitle = document.title;
var changes = true;

if (document.getElementById('remove')) {
    document.getElementById('remove').addEventListener('click', function () {
        //var e = docEditor.getValue();
        if (confirm('Delete this ' + originalTitle + '?')) {
            fetch("", {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'CSRF-Token': csrfToken
                },
            }).then(function (response) {
                if (response.status == 200) {
                    infoMsg.textContent = "Deleted ";
                    errMsg.textContent = "";
                    window.location = "./";
                } else {
                    showAlert("Error " + response.statusText);
                    errMsg.textContent = "Error " + response.statusText;
                    infoMsg.textContent = "";
                }
            });
        }
    });
}

if (document.getElementById('save1')) {
    document.getElementById('save1').addEventListener('click', save);
}

function scroll2Err(x) {
    var path = x.getAttribute('e_path');
    mainTabGroup.focus(0);
    if(path) {
        if(!path.startsWith('root.')) {
            path = 'root.' + path;
        }
        var ee = docEditor.getEditor(path);
        if(ee && ee.container) {
            var stkH = document.getElementById("vgHead").offsetHeight;
            ee.container.style["scroll-margin-top"] = (stkH + 40) + "px";
            ee.container.scrollIntoView({behavior:"smooth"});
            x.closest('details').removeAttribute('open');
        }
    }
}

function showJSONerrors(errors) {
    errList.textContent="";
    for (i = 0;i < errors.length; i++) {
        var e = errors[i];
        var showLabel = undefined;
        var ee = docEditor.getEditor(e.path);
        if (ee) {
            if(ee.header && ee.header.innerText) {
                showLabel = ee.header.innerText;
            }
            if(!showLabel && !(ee.original_schema === undefined) && !(ee.original_schema.title === undefined)) {
                showLabel = ee.original_schema.title
            } else {
                showLabel = ee.getHeaderText();
            }
        }
        var a = document.createElement('a');
        a.setAttribute('class', 'rqd')
        a.setAttribute('e_path', e.path);
        a.setAttribute('onclick', 'scroll2Err(this)');
        a.textContent = (showLabel && showLabel.trim() ? showLabel : e.path.replace('^root.','')) + ": " + e.message;
        errList.appendChild(a);
        errList.appendChild(document.createElement('br'))
    }
    errCount.className = 'indent bdg';
    errPop.className = 'popup';
    errCount.innerText = errors.length;
    //editorLabel.className = "lbl";
}

function hideJSONerrors() {
    errCount.innerText = "";
    errPop.className = 'hid';
    errList.textContent = "";
    editorLabel.className = "lbl";
}

var defaultTabs = {
    editorTab: {
        setValue: function (val) {
            insync = true;
            docEditor.setValue(val);
            insync = false;
        },
        getValue: function () {
            return docEditor.getValue();
        },
        validate: function (x) {
            var errors = [];
            if (x) {
                errors = docEditor.validate(x);
            } else {
                errors = docEditor.validate();
            }
            if (typeof(errorFilter) !== 'undefined'){
                errors = errorFilter(errors);
            }
            if (errors.length > 0) {
                docEditor.setOption('show_errors', 'always');
                showJSONerrors(errors);
                return 0;
            } else {
                hideJSONerrors();
                return 1;
            }
        }
    },
    sourceTab: {
        setValue: function (val) {
            if (sourceEditor == undefined) {
                ace.config.set('basePath', '/js/')
                sourceEditor = ace.edit("output");
                sourceEditor.getSession().setMode("ace/mode/json");
                sourceEditor.getSession().on('change', function () {
                    mainTabGroup.change(1);
                });
                sourceEditor.setOptions({
                    maxLines: 480,
                    wrap: true
                });
                sourceEditor.$blockScrolling = Infinity;
            }
            insync = true;
            sourceEditor.getSession().setValue(JSON.stringify(val, null, 2));
            sourceEditor.clearSelection();
            insync = false;
        },
        validate: function () {
            try {
                var hasError = false;
                var firsterror = null;
                var annotations = sourceEditor.getSession().getAnnotations();
                for (var l in annotations) {
                    var annotation = annotations[l];
                    if (annotation.type === "error") {
                        hasError = true;
                        firsterror = annotation;
                        //console.log('SOurce error'+annotation);
                        break;
                    }
                }
                if (!hasError) {
                    return 1;
                } else {
                    sourceEditor.moveCursorTo(firsterror.row, firsterror.column, false);
                    sourceEditor.clearSelection();
                    showAlert('Please fix error: ' + firsterror.text);
                    errMsg.textContent = 'Please fix error: ' + firsterror.text;
                    document.getElementById("sourceTab").checked = true;
                    return -1;
                }
            } catch (err) {
                showAlert(err.message);
                errMsg.textContent = err.message;
                document.getElementById("sourceTab").checked = true;
                return -1;
            } finally {}
        },
        getValue: function () {
            return JSON.parse(sourceEditor.getSession().getValue());
        }
    }
};
if(typeof additionalTabs !== 'undefined') {
    Object.assign(defaultTabs, additionalTabs);
}

var mainTabGroup = new Tabs('mainTabGroup', defaultTabs, 0);
mainTabGroup.onChange = function () {
    realtimeSchedulePatch();
};
initDraftsSidebar();
initRealtime();
window.addEventListener('popstate', handleHistoryNavigation);

function loadJSON(res, id, message, editorOptions) {
    draftsSetBaseline(null);
    // workaround for JSON Editor issue with clearing arrays
    // https://github.com/jdorn/json-editor/issues/617
    if (docEditor) {
        docEditor.destroy();
    }
    docEditor = new JSONEditor(document.getElementById('docEditor'), editorOptions ? editorOptions : docEditorOptions);
    docEditor.on('ready', async function () {
        await docEditor.root.setValue(res, true);
        if (docEditor && typeof docEditor.getValue === 'function') {
            draftsSetBaseline(docEditor.getValue());
        }
        infoMsg.textContent = message ? message : '';
        //errMsg.textContent = "";
        if(id) {
            document.title = id;
        } else {
            var nid =  getDocID();
            document.title = nid ? nid : 'Vulnogram';
        }
        if (message) {
            selected = "editorTab";
        }
        docEditor.watch('root', function(){
            mainTabGroup.change(0);
        });
        if (idpath) {
            docEditor.watch('root.' + idpath, function () {
                realtimeJoinIfReady();
            });
        }
        docEditor.on('change', async function(){
            var errors = [];
            if(docEditor.validation_results && docEditor.validation_results.length > 0) {
                if (typeof(errorFilter) !== 'undefined'){
                    errors = errorFilter(docEditor.validation_results);
                } else {
                    errors = docEditor.validation_results;
                }
            }
            if(errors.length > 0) {
                showJSONerrors(errors);
            } else {
                hideJSONerrors();
            }
        });
        editorLabel.className = "lbl";
        if(!soloMode) {
            postUrl = getDocID() ? './' + getDocID() : "./new";
        }
        realtimeJoinIfReady();

        document.getElementById(selected).checked = true;
        var event = new Event('change');
        //document.getElementById(selected).dispatchEvent(event);
        setTimeout(function (){
            document.getElementById(selected).dispatchEvent(event);
            maybeInitHistoryNavigation();
        }, 50);
    });
}

function save(e, onSuccess) {
    var j = mainTabGroup.getValue();
    if (!j){
        return;
    }
    infoMsg.textContent = "Saving...";
    fetch(postUrl ? postUrl : '', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            },
            redirect: 'error',
            body: JSON.stringify(j),
        })
        .then(function (response) {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response.json();
        })
        .then(function (res) {
            if (res.type == "go") {
                window.location.href = res.to;
            } else if (res.type == "err") {
                showAlert(res.msg);
                errMsg.textContent = res.msg;
                infoMsg.textContent = "";
            } else if (res.type == "saved") {
                infoMsg.textContent = "Saved";
                errMsg.textContent = "";
                document.title = originalTitle;
                draftsSetBaseline(getDraftDocValue());
                if (draftsCache && draftsCache.remove) {
                    draftsCache.cancelSave();
                    draftsCache.remove(getDocID());
                }
                getChanges(getDocID());
                if (onSuccess)
                    onSuccess()
            }
            changes = 0;
        })
        .catch(function (error) {
            showAlert(error + ' Try reloading the page.');
            errMsg.textContent = error + ' Try reloading the page.';
        });
    // This is a trick for brower auto completion to work
        document.getElementById('docEditor').submit();
}

function getDocID() {
    if(docEditor) {
        var idEditor = docEditor.getEditor('root.' + idpath);
        if (idEditor) {
            var val = idEditor.getValue();
            if (val) {
                return val;
            } else {
                return null;
            }
        }
    }
}
function copyText(element) {
    if (document.selection) {
        var range = document.body.createTextRange();
        range.moveToElementText(element);
        range.select();
        document.execCommand("copy");
        document.selection.empty();
        infoMsg.textContent = 'Copied JSON to clipboard';
    } else if (window.getSelection) {
        var mrange = document.createRange();
        mrange.selectNode(element);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(mrange);
        document.execCommand("copy");
        window.getSelection().removeAllRanges();
        infoMsg.textContent = 'Copied JSON to clipboard';
    }
}
function importFile(event, elem) {
    var file = document.getElementById("importJSON");
    file.click();
}
function loadFile(event, elem) {
    var file = elem.files[0];
    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
            loadJSON(JSON.parse(evt.target.result), null, "Imported file");
        };
        reader.onerror = function (evt) {
            showAlert("Error reading file");
            errMsg.textContent = "Error reading file";
        };
    }
}
function downloadFile(event, link) {
    var j = mainTabGroup.getValue();
    if (!j){
        event.preventDefault();
        alert('JSON Validation Failure: Fix the errors before downloading')
        return false;
    }
    var file = new File([textUtil.getMITREJSON(textUtil.reduceJSON(j))], getDocID() + '.json', {
        type: "text/plain",
        lastModified: new Date()
    });
    link.href = URL.createObjectURL(file);
    link.download = file.name;
    // trick to get autocomplete work
    document.getElementById('docEditor').submit();
}

function downloadText(element, link) {
    var j = mainTabGroup.getValue();
    if (!j){
        event.preventDefault();
        alert('JSON Validation Failure: Fix the errors before downloading.')
        return false;
    }
    var file = new File([element.textContent], getDocID() + '.json', {
        type: "text/plain",
        lastModified: new Date()
    });
    link.href = URL.createObjectURL(file);
    link.download = file.name;
}
function downloadHtml(title, element, link) {
    var file = new File([
            '<html><head><title>'
            + title
            + '</title><style>body{font-family:"Helvetica"; margin:3em}table {border-spacing: 0; border: 1px solid #888; border-collapse: collapse;}'+
'table th { text-align:center;background-color:#88888822;}'+
'table td { padding:5px;border: 1px solid #888}</style><body>'
            + element.innerHTML
            + '</body></html>'
        ], getDocID() + '.html', {
        type: "text/html",
        lastModified: new Date()
    });
    link.href = URL.createObjectURL(file);
    link.download = file.name;
}

function showAlert(msg, smallmsg, timer, showCancel) {
    errMsg.textContent="";
    infoMsg.textContent="";
    if (showCancel) {
        document.getElementById("alertCancel").style.display = "inline-block";
    } else {
        var temp1 = document.getElementById("alertOk");
        temp1.setAttribute("onclick", "document.getElementById('alertDialog').close();");
        document.getElementById("alertCancel").style.display = "none";
    }
    document.getElementById("alertMessage").innerText = msg;
    if (smallmsg)
        document.getElementById("smallAlert").innerText = smallmsg;
    else
        document.getElementById("smallAlert").innerText = " ";
    if (!document.getElementById("alertDialog").hasAttribute("open"))
        document.getElementById("alertDialog").showModal();
    if (timer)
        setTimeout(function () {
            document.getElementById("alertDialog").close();
        }, timer);
}
