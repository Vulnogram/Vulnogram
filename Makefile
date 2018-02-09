OUT = ./standalone
CSS = $(OUT)/css
JS = $(OUT)/js
CSSO = ./node_modules/.bin/csso
UJS = ./node_modules/.bin/uglifyjs

TARGETS := $(OUT)/index.html $(CSS)/sprite.svg $(CSS)/style.css $(CSS)/logo.png $(JS)/util.js $(JS)/editor.js $(JS)/render.js

$(OUT)/index.html: ./scripts/standalone.js ./config/conf-standalone.js ./default/* ./default/cve/*
	node $<

$(OUT)/js:
	mkdir -p $(OUT)/js

$(OUT)/css:
	mkdir -p $(OUT)/css

$(CSS)/%.css: ./public/css/%.css
	$(CSSO) $< $@

$(CSS)/%.svg: ./public/css/%.svg
	cp -f $< $@

$(CSS)/%.png: ./public/css/%.png
	cp -f $< $@

$(JS)/%: ./public/js/%
	$(UJS) $< -o $@

min: $(CSS) $(JS) $(TARGETS)
