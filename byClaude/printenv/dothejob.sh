#!/bin/sh
####
# Render start-script: byClaude/printenv (compiled JS, no secrets)
# Root dir:      byClaude/printenv
# Build command: npm install && npm run build
# Start command: sh dothejob.sh
####

realpath .
ls -l dist/ || exit
echo "PORT=${PORT:-3000}"
echo 'OK...'
sleep 1

exec node dist/server.js
