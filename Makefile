OUT = ./standalone
CSS = $(OUT)/css
JS = $(OUT)/js

TARGETS := $(OUT)/index.html $(CSS)/sprite.svg $(CSS)/style.css  $(CSS)/logo.png $(JS)/util.js $(JS)/editor.js $(JS)/schemas.js $(JS)/advisory.js

$(OUT)/index.html: ./standalone.js ./config/conf.js
	node $<

$(OUT)/js:
	mkdir -p $(OUT)/js

$(OUT)/css:
	mkdir -p $(OUT)/css

$(CSS)/%.css: ./public/css/%.css
	csso $< $@

$(CSS)/%.svg: ./public/css/%.svg
	cp -f $< $@

$(CSS)/%.png: ./public/css/%.png
	cp -f $< $@

$(JS)/%: ./public/js/%
	uglifyjs $< -o $@

min: $(CSS) $(JS) $(TARGETS)
