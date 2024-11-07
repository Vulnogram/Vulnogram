#!/usr/bin/env bash
set -ex -o pipefail

sed -i -e "s/copyright.*/copyright : '$(git describe --tags)',/" config/conf.js
node app.js
