const assert = require('node:assert').strict
sut = require("../custom/cve5/conf.js")

customValidators = sut.validators[1]

assert.deepEqual(customValidators(undefined, "user@pulsar.khulnasoft.com", "root.CNA_private.userslist"), [], "user list should not produce an error")
assert(customValidators(undefined, "security@pulsar.khulnasoft.com", "root.CNA_private.userslist")[0].message.endsWith("mixing public and private lists is discouraged."))
assert(customValidators(undefined, "private@pulsar.khulnasoft.com", "root.CNA_private.userslist")[0].message.endsWith("mixing public and private lists is discouraged."))
