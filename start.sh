#!/bin/sh

npm run build
cd backend && node index.js --host &

wait
exit $?
