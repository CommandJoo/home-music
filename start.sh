#!/bin/sh

npm run build
cd backend && node index.js &

wait
exit $?