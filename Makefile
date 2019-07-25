OUT = ./standalone
CSS = $(OUT)/css
JS = $(OUT)/js
CVE = $(OUT)/cve
CSSO = ./node_modules/.bin/csso
UJS = ./node_modules/.bin/uglifyjs

TARGETS := $(OUT)/index.html $(CSS)/sprite.svg $(CSS)/min.css $(CSS)/icns.css $(CSS)/logo.png $(CSS)/logo.gif $(JS)/util.js $(JS)/editor.js $(JS)/cvss.json $(JS)/cwe-frequent.json

$(OUT)/index.html: ./scripts/standalone.js ./config/conf-standalone.js ./[cd][ue][sf]*[mt]/cve/* ./views/*
	if [ -e "./custom/cve/conf.js" ]; then node $< custom ;  else node $< ; fi


$(OUT)/js:
	mkdir -p $(OUT)/js

$(OUT)/css:
	mkdir -p $(OUT)/css

$(CVE):
	mkdir -p $(CVE)

$(CSS)/%.css: ./public/css/%.css
	$(CSSO) $< -o $@

$(CSS)/%.svg: ./public/css/%.svg
	cp -f $< $@

$(CSS)/%.png: ./public/css/%.png
	cp -f $< $@

$(CSS)/%.gif: ./public/css/%.gif
	cp -f $< $@
    
$(JS)/%.js: ./public/js/%.js
	$(UJS) $< -c -o $@

$(JS)/%.json: ./public/js/%.json
	node -e 'console.log(JSON.stringify(require("./" + process.argv[1])))' $< > $@

$(CVE)/%: ./public/js/cve/%
	$(UJS) $< -o $@

min: $(CVE) $(CSS) $(JS) $(TARGETS)
