#!/bin/bash
#source variables (and create file if missing) 
source devEnv/env-vars.sh

#read and export json for docker-compose
_json=$(<${SLACK_AGENT_EVENT_FILE})
export SLACK_AGENT_EVENT_JSON=${_json}

#start db if not working
if ! [ -n "$(docker ps -a | grep dynamodb)" ]; then
    docker-compose -f devEnv/docker-compose-db.yml up -d
    #wait until shell available
    sleep 7s
fi

#run lambda
docker-compose -f devEnv/docker-compose-lambda.yml up
