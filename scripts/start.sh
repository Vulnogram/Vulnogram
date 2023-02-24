#!/usr/bin/env bash
set -ex -o pipefail

if [[ -z "${START_COMMAND}" ]]; then
    forever start --id 'vulnogram' --spinSleepTime 5000 --minUptime 2000 app.js
    forever list
else
    /bin/bash -c "${START_COMMAND}"
fi
