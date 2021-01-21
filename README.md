# geo-format

This is a typescript library to read text in TRUMPF GEO file format.

It comes with a plain class model of the GEO file and a persistency layer to read this model from a string.

Additionally, it provides a SVG writer to output the GEO class model into a SVG string.

## Usage

This package is deployed to the gitlab npm package repository. You need to configure this repository within your project.
Therefore, create a local `.npmrc` file (to be checked in - also good for `yarn`):

```
@scalenc:registry=https://gitlab.com/api/v4/packages/npm/
```

You need authentication to the gitlab npm package repository. Therefore, you need to create a personal access token (see https://gitlab.com/-/profile/personal_access_tokens).
Then, create a `.npmrc` file in your home directory (do not check in):

```
//gitlab.com/api/v4/packages/npm/:_authToken=<your personal access token>
//gitlab.com/api/v4/projects/:_authToken=<your personal access token>
```

## Development

### Setup

Run `yarn` to install all dependencies.

### Test

Run `yarn test` to run all tests.

### Linting

Run `yarn run lint` to check for linting issues.

### Build

Run `yarn build` to build.

## License

All rights reserved to ScaleNC GmbH.
