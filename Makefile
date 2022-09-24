OUT = ./standalone
CSS = $(OUT)/css
JS = $(OUT)/js

CSSO = ./node_modules/.bin/csso
UJS = ./node_modules/.bin/uglifyjs

TARGETS := $(OUT) $(OUT)/static $(OUT)/index.html $(CSS)/min.css $(CSS)/vg-icons.css $(CSS)/tagify.css $(CSS)/logo.png $(CSS)/logo.gif $(JS)/util.js $(JS)/editor.js $(JS)/mode-json.js $(JS)/cvss.json $(JS)/cwe-frequent.json $(JS)/capec.json $(JS)/wy/ $(JS)/wy/ $(JS)/tablesort.min.js $(JS)/tagify.min.js

$(OUT):
	mkdir $(OUT)

$(OUT)/index.html: ./scripts/standalone.js ./config/conf-standalone.js ./[cd][ue][sf]*[mt]/cve5/* ./views/*
	if [ -e "./custom/cve5/conf.js" ]; then node $< custom ;  else node $< ; fi

$(OUT)/js:
	mkdir -p $(OUT)/js

$(OUT)/js/wy:
	mkdir -p $(OUT)/js/wy

$(OUT)/css:
	mkdir -p $(OUT)/css

$(CSS)/%.css: ./public/css/%.css
	$(CSSO) $< -o $@

$(CSS)/%.svg: ./public/css/%.svg
	cp -f $< $@

$(CSS)/%.png: ./public/css/%.png
	cp -f $< $@

$(CSS)/%.gif: ./public/css/%.gif
	cp -f $< $@

$(OUT)/js/wy/: ./public/js/wy/
	cp -pr $< $@
    
$(JS)/%.js: ./public/js/%.js
	$(UJS) $< -c -o $@

$(JS)/%.json: ./public/js/%.json
	node -e 'console.log(JSON.stringify(require("./" + process.argv[1])))' $< > $@

#$(OUT)/%: ./public/js/cve/%
#	$(UJS) $< -o $@

$(OUT)/static/: ./default/cve5/static/
	cp -pr $< $@
min: $(OUT) $(CSS) $(JS) $(TARGETS)
