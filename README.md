# deploy

## Installation

The easiest way to install deploy is to grab the latest package from
the [releases page](https://github.com/ben754444/deploy/releases/latest).

On linux, you can then run `./deploy-linux-amd64 --systemd` to install the systemd service.

Alternatively, you can build the TypeScript source code yourself and run that. You will need to have Node.js 18 along
with all the packages listed in `package.json` installed.

## Configuration

App configuration is done via the config.json file. The following options are available:

```
{
    port: number                             - port number to run the server on 
    host: string                             - interface to bind to
    production: boolean                      - whether the server is in production mode
    hide_projects: boolean                   - whether to hide the presence of projects (will always return 404 unless all data is correct, recommended in production)
    environment_variables_prefix: string     - The prefix for user supplied environment variables (to avoid collisions)
}
```

All project configurations should be placed in the /projects directory. Each project has its own file. The file can take
two forms:

### Single environment

[Example](projects/example.json)

```
{
    secret: string              - unencrypted secret (generate a random string)
    scripts: {                  - read more below
        pre?: string[]
        main: string[]
        on_success?: string[]
        on_failure?: string[]
        finally?: string[]
    }
    environment_variables?: {   - user defined environment variables that are accessible under DEPLOY_USER_... in scripts
        [key: string]: string
    }
}

```

### Multiple environments

[Example2](projects/example2.json)

```
[
    {
        environment: string         - name of the environment
        secret: string              - unencrypted secret (generate a random string)
        scripts: {                  - read more below
            pre?: string[]
            main: string[]
            on_success?: string[]
            on_failure?: string[]
            finally?: string[]
        }
        environment_variables?: {   - user defined environment variables that are accessible under DEPLOY_USER_... in scripts
            [key: string]: string
        }
    }
    ... copy and paste for more
]
```

GitHub webhooks are also supported. To use them, simply create a GitHub webhook like normal, with the URL
as `https://<your deploy instance>/<project>/<environment?>` The secret should be the same as the one in the project
config file. GitHub will automatically encrypt it.

## Authorisation

There are 2 types of authorisation. The first uses the "Authorization" header and expects a bearer token in the form of
a SHA256 hash of the secret. The second uses the "X-Hub-Signature-256" header and expects a SHA256 HMAC of the request
body (used only for GitHub webhooks).

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