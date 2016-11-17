#!/bin/bash

look_for=$1

UUIDS=$(apc package list --namespace / --provides $look_for --json | jq --raw-output '.[].uuid')

for uuid in $UUIDS
do
    echo jobs using $uuid:
    apicurl.sh /v1/jobs?package_id=$uuid  | jq --raw-output '.[].fqn' | awk '{print "\t" $0}'
done
