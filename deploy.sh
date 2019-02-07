#!/bin/bash
if [ $# -ne 1 ]; then
    echo "ERROR Illegal number of parameters !!!"
    exit 1
fi
echo "______________ node version ______________ "
node --version
echo "______________ npm version ______________ "
npm --version
echo "______________ instal dependecies ______________ "
npm install
sls plugin install --name serverless-stage-manager
echo "______________ deploy ______________ "
sls deploy -s $1

