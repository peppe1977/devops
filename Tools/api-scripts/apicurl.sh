#!/bin/bash

# This has really only been tried with GET. Heads up
#
function die_usage
{
    echo "Usage: $0 commands"
    echo "$*"
    exit 9
}

endpoint=$1
shift 1

# check for jq
#
[ -x "$(which jq)" ] || die_usage "ERROR: You need jq - try brew install jq or the linux equivalent"

current=$(apc target | grep Targeted | awk '{ print $2}' | sed 's|\[||;s|\]||')
api_host=$(echo $current | sed "s|//|//api.|")

arg=.tokens.\"$current\"
quoted_arg=\'$arg\'

token=$(eval jq -r $quoted_arg ~/.apc)
URL=${api_host}${endpoint}

curl --silent -H "Authorization: $token" "$@" $URL | jq .
