# deploy

## Scripts

There are 5 types of scripts that can be used in each environment/project. Throughout every script, execution of that
script will be stopped if any command fails. The scripts are executed in the following order:

* `pre` - optional
* `main` - required
* `on_success` - optional
* `on_failure` - optional
* `finally` - optional

### Pre Script

The `pre` script is run before the `main` script. This script can be used to check the environment is ready for the
deployment. If the `pre` script fails (a non-zero exit code), no other scripts will run.

### Main Script

The `main` script is the main deployment script. This script is run after the `pre` script.

### Success Script

The `on_success` script is run after the `main` script if the `main` script runs successfully. This can be used to send
a notification that the deployment was successful.

### Failure Script

The `on_failure` script is run after the `main` script if the `main` script fails. This can be used to revert the
deployment or send a notification that the deployment failed.

### Finally Script

The `finally` script is run after the `main` script, regardless of whether the `main` script was successful or not. This
can be used to clean up any temporary files.