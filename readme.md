## Local Dev Mode

For running lambdas locally we're using `dynamodb-local` from AWS amd `lambci` on Docker. There's also `config` container
which is responsible for db tables configuration.

* `docker-compose up` to start    
* `ctrl-z` or `docker-compose down` to stop    
* if you modify `dynamoLocal.js` file, pls run `docker-compose up --build`    
* if you don't stop `dynamodb` between runnings, you'll face error from `config`: `Cannot create preexisting table`. It's irrelevant as you need table which is right there.    

### Configuration

For **changing running params** Open `docker-compose.yml` and edit `command` line in `lambda` ex:

`command: "handler.parkingPlaceList '{\"body\":{\"test\": \"123\"}}'"`

where `parkingPlaceList` is lambda function name and `'{\"body\":{\"test\": \"123\"}}'` is a event body (Note. *escapes* are important :) ).

For **adding preload documents** to local db add them to file `./development/docs.json`.