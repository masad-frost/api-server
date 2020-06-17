#!/bin/bash

# Start server in background
output=$(mktemp "${TMPDIR:-/tmp/}$(basename 0).XXX")
error=$(mktemp "${TMPDIR:-/tmp/}$(basename 0).XXX")
LOCAL=true node index.js 2> $error 1> $output &
server_pid=$!
echo "Server pid: $server_pid"
echo "Server output redirected to: $output"
echo "Server errors redirected to: $error"
echo "Waiting for server to start"

# trap exit and make sure we kill the server
cleanup() {
    if ps -p $server_pid > /dev/null
    then
        kill -9 $server_pid;
    fi
}
trap 'cleanup' INT TERM EXIT

# wait for "Listening on http://0.0.0.0:5050"
until grep -q -i 'Listening on http://0.0.0.0:5050' $output
do
    if ! ps -p $server_pid > /dev/null
    then
        cat $error
        echo "The server died" >&2
        # exit with 1 if the server doesn't startup
        return 1
    fi
    echo -n "."
    sleep 1
done
echo "Server is running, starting tests"

npm run test:mocha
exit_code=$?

cleanup

return $exit_code
