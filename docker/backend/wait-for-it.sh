#!/bin/sh
# wait-for-it.sh

set -e

host=$(echo "$1" | cut -d : -f 1)
port=$(echo "$1" | cut -d : -f 2)
shift
cmd="$@"

until wget -q --spider "http://$host:$port/"; do
  >&2 echo "MongoDB is unavailable - sleeping"
  sleep 1
done

>&2 echo "MongoDB is up - executing command"
exec $cmd
