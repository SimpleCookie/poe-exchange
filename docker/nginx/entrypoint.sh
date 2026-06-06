#!/bin/sh
set -e

# Substitute only ${POE_PROXY_UPSTREAM} so that nginx variables such as
# $host, $remote_addr, $uri, etc. are left untouched.
envsubst '${POE_PROXY_UPSTREAM}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
