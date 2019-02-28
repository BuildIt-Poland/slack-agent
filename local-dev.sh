#!/bin/bash

#before calling lambda we'd know that dynamodb is running
function waitForDB {
    local what="DynamoDB-local"
    local secs=$1
    if ! [ -n "$(docker ps --filter 'ancestor=devenv_config' --filter 'status=exited' | grep devenv)" ]; then
      echo -n "Waiting for $what ..."
      local starttime=$(date +%s)
      while true; do
         sleep 1s
         if [ -n "$(docker ps --filter 'ancestor=devenv_config' --filter 'status=exited' | grep devenv)" ]; then
            break
         fi
         if [ "$(($(date +%s)-starttime))" -gt "$secs" ]; then
            echo "Failed waiting for $what"
            exit -1
         fi
         echo -n "."
      done
      echo ""
    fi
}

#helper function for adding questions
function setVariable() {
	label=$1
	variable_name=$2
    default_val=$3
    file=$4
    if [ -z $default_val ]; then
        read -p "$label: " val
    else
        read -p "$label [$(tput setaf 2)$default_val$(tput sgr 0)]: " val
    fi
    if [ -z $val ] && [ ! -z $default_val ]; then
        val=$default_val
    fi
    echo -e "export $variable_name=\"$val\"" >> $file
    export $variable_name="$val"
}

#populate env file with values if missing
function createDefaultEnv {
    touch $1
    echo -e "#!/bin/bash" >> $1
    echo -e "export SLACK_AGENT_EVENT_FILE=\"devEnv/events/event\"" >> $1
    echo -e "export SLACK_AGENT_HANDLER=\"bookParkingPlace\"" >> $1
    echo -e "export SLACK_AGENT_FUNCTION=\"book\"" >> $1
}

#wizard that configures devEnv/env-vars.sh
function config {
    local _tmp_file="devEnv/env-vars-tmp.sh"
    local _env_file="devEnv/env-vars.sh"
    if ! [ -f $_env_file ]; then
       createDefaultEnv $_env_file
    fi
    source $_env_file
    if [ -f $_tmp_file ]; then
        rm $_tmp_file
    fi
    touch $_tmp_file
    echo -e "#!/bin/bash" > $_tmp_file
    
    echo "$(tput setaf 4)Sample value is 'devEnv/events/event'. Add new files next to this one. There is no validation on existance. $(tput sgr 0)"
    setVariable "Path to file containing event json" "SLACK_AGENT_EVENT_FILE" "$SLACK_AGENT_EVENT_FILE" $_tmp_file
    echo "$(tput setaf 4)Go to 'handlers' directory and choose one of filenames without extension. $(tput sgr 0)"
    setVariable "Handler name" "SLACK_AGENT_HANDLER" "$SLACK_AGENT_HANDLER" $_tmp_file
    echo "$(tput setaf 4)Open your selected handler and choose function name, $(tput sgr 0)"
    setVariable "Function name" "SLACK_AGENT_FUNCTION" "$SLACK_AGENT_FUNCTION" $_tmp_file

    cp $_tmp_file $_env_file
    rm $_tmp_file

}

#run local env
function start {
    #source variables (and create file if missing)
    if ! [ -f devEnv/env-vars.sh ]; then
        config
    fi
    source devEnv/env-vars.sh

    #read and export json for docker-compose
    _json=$(<${SLACK_AGENT_EVENT_FILE})
    export SLACK_AGENT_EVENT_JSON=${_json}

    #start db if not working
    if ! [ -n "$(docker ps -a | grep dynamodb)" ]; then
        docker-compose -f devEnv/docker-compose-db.yml up -d --build
        #wait until shell available
        waitForDB 10
    fi

    #run lambda
    docker-compose -f devEnv/docker-compose-lambda.yml up
}

#destroy local env
function stop {
    read -r -p "$(tput setaf 1)Are you sure that you want to stop DynamoDB-local? [y/N] $(tput sgr 0)" response
    response=$(echo $response | tr '[:upper:]' '[:lower:]')
    if [ "$response" == "yes" ] || [ "$response" == "y" ]; then
        #source variables (and create file if missing)
        source devEnv/env-vars.sh
        export SLACK_AGENT_EVENT_JSON=""
        docker-compose -f devEnv/docker-compose-db.yml down
        docker-compose -f devEnv/docker-compose-lambda.yml down
    fi
}

function readme {
 echo "$(tput setaf 4)
    Call $(tput setaf 2)local-dev.sh$(tput setaf 4) with following params:

        $(tput setaf 2)start$(tput setaf 4)  - to run lambda function and DynamoDB-local if not available.
        $(tput setaf 2)stop$(tput setaf 4)   - to terminate currently running instance of DynamoDB-local.
        $(tput setaf 2)config$(tput setaf 4) - to configure which lambda and event should be used in test. 
    $(tput sgr 0)"
}

set -e
_commands="^(stop$|start$|config)"
if [[ "$1" =~ $_commands ]]; then
    "$@"
else
    readme
fi
