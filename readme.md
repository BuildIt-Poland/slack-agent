## Local Dev Mode

For running lambdas locally we're using `dynamodb-local` from AWS amd `lambci` on Docker. There's also `config` container
which is responsible for db tables configuration.

* `npm run start-lambda` to run lambda function and DynamoDB-local if not available.
* `npm run stop-lambda` to terminate currently running instance of DynamoDB-local. _NOTE_ You don't need to stop DB between different lambdas calls.
* `npm run configure-lambda` to configure which handler should be used in test run.

_DB-GUI_: http://localhost:8000/shell/

### Configuration

For **changing running params** run `local-dev.sh config` or edit file `devEnv/env-vars.sh` by hand.

By default it uses `devEnv/events/event` as a file with event passed to lambda. However you may modify it in wizard.

For **adding preload documents** to local db add them to files in `./dynamo/content` directory.
