# address-metadata

This repository contains utilities and automation for updating static data (supported ERC20 tokens, etc) in Firebase's RTDB.

## Adding new ERC20 tokens

To add a new ERC20 token you need to follow these steps:

- Open [`src/data/mainnet/tokens-info.json`](src/data/mainnet/tokens-info.json) and/or [`src/data/alfajores/tokens-info.json`](src/data/alfajores/tokens-info.json). You will see that it has a root object, keyed by ERC20 token contract addresses. Add a new object. The fields are described below.
- After doing this you should open a PR and ask someone on the Valora team to review it so it can be merged. Once it's merged, the new ERC20 token will be visible in the Valora Wallet for users holding it.

### ERC20 token info

| Property   | Description                                                                                                                                                                                                                                                           |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `address`  | The address of the ERC20 token contract. This should match the key used in the root object.                                                                                                                                                                           |
| `decimals` | The number of decimals used by the ERC20 token.                                                                                                                                                                                                                       |
| `imageUrl` | The logo to display for the ERC20 token. The image must be a 256 x 256 PNG. Add the image to the [assets/tokens](./assets/tokens) folder and use the following format: `https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/{image}.png` |
| `name`     | The name to display for the ERC20 token.                                                                                                                                                                                                                              |
| `symbol`   | The short symbol to display for the ERC20 token.                                                                                                                                                                                                                      |

## Use

When adding a new node of data to this repository, first write a `Joi` schema for the data in `src/schemas`.
Then, add the raw data as a JSON blob to e.g., `src/data/mainnet/{some-rtdb-node}.json` or `src/data/alfajores/{some-rtdb-node}.json`. Finally, import the appropriate files and fill in the required metadata
in `src/data/mainnet/index.ts` or `src/data/alfajores/index.ts`. The `rtdbLocation` field in the metadata list
should be the path where this data is located within RTDB.

Once these steps are done, any changes you make to the raw JSON files will be committed to the correct RTDB
environments during CICD, on a merge to `main`.

This repository also contains some nifty utilities. Running `yarn validate` will validate all the JSON blobs against
their corresponding schemas, and will fail if any of the JSON blobs are poorly formed.

`yarn diff --project={mainnet|alfajores} --database-url={URL to Firebase RTDB location}` will display a
diff between the local JSON contents and the state within RTDB, much like `git diff`.

`yarn update --project={mainnet|alfajores} --database-url={URL to Firebase RTDB location}` will actually perform
RTDB updates based off the local state. If some local JSON blob fails to validate, it will not be updated.
Similarly, if the local state is already consistent with that in RTDB, we will not perform any write.

## Install

```
yarn
```

### Validate

```
yarn validate
```

### Diff

```
yarn diff --project={mainnet|alfajores} --database-url={URL to Firebase RTDB location}
```

#### Knonw issues

When updating nodes without overrides, there is no check to avoid sending the update request even if there is no update (i.e. info in firebase is already ok).

### Update RTDB

This is done automatically during CICD; you should _not_ need to run this locally.

```
yarn update --project={mainnet|alfajores} --database-url={URL to Firebase RTDB location}
```
