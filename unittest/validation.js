const assert = require('node:assert').strict;
const sut = require("../custom/cve5/conf.js");
const customValidators = sut.validators[1];
describe('Email Validation', () => {
    it('should allow valid private list emails', () => {
        assert.deepEqual(
            customValidators(undefined, "user@pulsar.khulnasoft.com", "root.CNA_private.userslist"),
            [],
            "user list should not produce an error"
        );
    });
    it('should discourage mixing public and private lists', () => {
        const publicEmailError = customValidators(
            undefined,
            "security@pulsar.khulnasoft.com",
            "root.CNA_private/userslist"
        )[0];
        assert(publicEmailError.message.endsWith("mixing public and private lists is discouraged."));
        const privateEmailError = customValidators(
            undefined,
            "private@pulsar.khulnasoft.com",
            "root.CNA_private/userslist"
        )[0];
        assert(privateEmailError.message.endsWith("mixing public and private lists is discouraged."));
    });
    it('should validate email format', () => {
        const invalidEmailError = customValidators(
            undefined,
            "invalid-email",
            "root.CNA_private/userslist"
        )[0];
        assert(invalidEmailError.message.includes("invalid email format"));
    });
});
