Contributions to this KSF fork of Vulnogram are welcome.

# Coordination

Submitting a contribution without prior coordination is fine, but for larger
changes first discussing it in a [GitHub issue](https://github.com/khulnasoft/security-vulnogram)
or on the [security-discuss@khulnasoft.com mailinglist](https://www.khulnasoft.com/foundation/mailinglists.html)
might be good to avoid disappointment.

# Testing

Try to test your changes locally before submitting your changes.

# Submitting changes

Submit changes by creating a GitHub PR to the `main` branch.

# Reviewing

Anyone may review changes. After an approval by a Security Team member, the
reviewer may choose to merge the change immediately, or leave the PR to be
merged after the contributor has considered any optional comments.

A reviewer may ask for specific functionality/scenarios to be tested before
promoting the feature from the test to the prod environment. 

# Deploying

Changes are deployed to the test and prod environments manually by the security
team. Generally we try to have a quick pipeline from merging to `main`,
deploying to the test environment and then deploying to the prod environment.

If any problems are identified on the test environment ideally those are fixed
with a quick follow-up PR. If there is no quick solution available and the
change introduces a regression, the feature may be reverted on `main` to
unblock the deployment pipeline.
