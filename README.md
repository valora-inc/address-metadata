# address-metadata

This repository contains utilities and automation for updating static data (supported ERC20 tokens, etc) in Firebase's RTDB.

## Disclaimer

Note: filing an issue does not guarantee addition to the supported token list.
We do not review token addition requests in any particular order, and we do not
guarantee that we will review your request to add the token to the supported list.

## Adding new ERC20 tokens

To add a new ERC20 token you need to follow these steps:

- Add your token info to the relevant tokens info JSON. For example, to add a token on Celo Mainnet, update [`src/data/mainnet/celo-tokens-info.json`](src/data/mainnet/celo-tokens-info.json). The fields are described below.
- Add the logo to [assets/tokens](./assets/tokens)
- After doing this you should open a PR and ask someone on the Valora team to review it so it can be merged. Once it's merged, the new ERC20 token will be visible in the Valora Wallet for users holding it.

### ERC20 token info

| Property   | Description                                                                                                                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `address`  | The lower-case address of the ERC20 token contract.                                                                                                                                                                                                          |
| `decimals` | The number of decimals used by the ERC20 token.                                                                                                                                                                                                              |
| `imageUrl` | The logo to display for the ERC20 token. It must be a 256 x 256 PNG. Add the image to the [assets/tokens](assets/tokens) folder and use the following format: `https://raw.githubusercontent.com/valora-inc/address-metadata/main/assets/tokens/{image}.png` |
| `name`     | The name to display for the ERC20 token.                                                                                                                                                                                                                     |
| `symbol`   | The short symbol to display for the ERC20 token.                                                                                                                                                                                                             |

## Generic Use

When adding a new node of data to this repository, first write a `Joi` schema for the data in `src/schemas`.
Then, add the raw data as a JSON blob to e.g., `src/data/mainnet/{some-rtdb-node}.json` or `src/data/testnet/{some-rtdb-node}.json`. Finally, import the appropriate files and fill in the required metadata
in `src/index.ts`. The `rtdbLocation` field in the metadata list
should be the path where this data is located within RTDB.

Once these steps are done, any changes you make to the raw JSON files will be committed to the correct RTDB
environments during CICD, on a merge to `main`.

This repository also contains some nifty utilities. Running `yarn validate` will validate all the JSON blobs against
their corresponding schemas, and will fail if any of the JSON blobs are poorly formed.

`yarn diff --project={mainnet|testnet} --database-url={URL to Firebase RTDB location}` will display a
diff between the local JSON contents and the state within RTDB, much like `git diff`.

`yarn update:rtdb --project={mainnet|testnet} --database-url={URL to Firebase RTDB location}` will actually perform
RTDB updates based off the local state. If some local JSON blob fails to validate, it will not be updated.
Similarly, if the local state is already consistent with that in RTDB, we will not perform any write.

### Install

```
yarn
```

### Validate

```
yarn test
```

### Diff

```
yarn diff --project={mainnet|testnet} --database-url={URL to Firebase RTDB location}
```

#### Known issues

When updating nodes without overrides, there is no check to avoid sending the update request even if there is no update (i.e. info in firebase is already ok).

### Update RTDB

This is done automatically during CICD; you should _not_ need to run this locally.

```
yarn update:rtdb --project={mainnet|testnet} --database-url={URL to Firebase RTDB location}
```

## Adding blockchains

To add support for tokens on a new blockchain, you need to follow these steps:

1. Add a json with information on the tokens you wish to be recognized to `src/data/mainnet/YOUR_NEW_CHAIN-tokens-info.json`
   and any tokens on the blockchain's main testnet to `src/data/mainnet/YOUR_NEW_CHAIN-TESTNET_NAME-tokens-info.json`
2. Add the new blockchain and to "Network" and "NetworkId" enums in `src/types.ts`
3. Try compiling with `yarn build` and see where it breaks. At time of writing, the places to update are:

- `src/transforms.ts` - add mapping from environment and network to network ID
- `src/index.ts` - add mapping from network to token info from jsons added in step 1

## Adding new tokens in bulk

There may be times where we want to add many new tokens at once. An example of how to do this is in `scripts/add-erc20-tokens-coingecko.ts`. This script utilizes Coingecko to get a list of tokens by market cap, and adds them to the specified tokens info file. It also adds the token images to the assets folder.

Note that there are some expectations for the image assets, they should be 256x256 .png files and ideally under 60 KB in size. The above script will print warnings if the images do not meet these requirements, and manual intervention will be required to fix them. For resizing files, an online tool like [Tiny png](https://tinypng.com/) can be used.

As an example, you can run the following command from the project root to add the top 20 tokens on Coingecko for the Ethereum network:

```bash
yarn ts-node scripts/add-erc20-tokens-coingecko.ts --category-id ethereum-ecosystem --platform-id ethereum --viem-chain-id mainnet --number-of-results 20 --page-number 1 --tokens-info-file-path src/data/mainnet/ethereum-tokens-info.json --enable-swap true
```
