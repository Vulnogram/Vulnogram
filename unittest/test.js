
// Mock
const mockDocument = {
  addEventListener: function() {
  }
}

// System under test
sut = require("../default/cve5/script.js")

// Tests
console.assert(sut.htmltoText('<a href="foo">foo</a>') == " foo ")
console.assert(sut.htmltoText('<a href="foo">bar</a>') == " bar foo ")
console.assert(sut.htmltoText('<a href="foo">foo</a> <a href="bar">bar</a>') == " foo   bar ")
console.assert(sut.htmltoText('<a href="foo">baz</a> <a href="bar">bar</a>') == " baz foo   bar ")

console.assert(sut.htmltoText('<a href="foo">foo<br></a>bar') == " foo\n bar")
