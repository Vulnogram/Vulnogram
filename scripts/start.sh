#!/usr/bin/env sh

sh -c "${START_COMMAND:-forever start --id 'vulnogram' --spinSleepTime 5000 --minUptime 2000 app.js; forever list}"
