#!/bin/bash
read -r -p "Are you sure that you want to stop DynamoDB-local? [y/N] " response
response=$(echo $response | tr '[:upper:]' '[:lower:]')
if [ "$response" = "yes" ] || [ "$response" = "y" ]; then
    docker-compose -f devEnv/docker-compose-db.yml down
fi