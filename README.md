# Demall

Demall integrates the division by different stores, so that several products from different stores are presented in the same environment, also allows you to see the reviews of other users, and in turn, write your own review about the product, of course, as long as the user has purchased the product, but yes, anyone can be the other reviews, regardless of whether you have purchased the product or not.

Any user can add a new store, and a new product, categorizing the latter with an existing store.

## Contract Methods

addProduct: Entering the name, image, description, store index, and price, the product is added to the list, and also, the store pushes the index of the product to his list

addReview: Entering the product index, the content and the point from 0 to 5, the review is added to the list of reviews and the reviews of the product

addStore: Entering the name of the store, it adds the name to the map and relates it to a index

buyProduct: Entering the index of the product, it fetches the product data and transfers the money from the buyer to the seller, also adds the product to the boughtProducts map

getBoughtProducts: Returns the array of bought profuct of an user by his address

getProduct: Returns all the info about the product by his index

getProductsLength: Retrun the total number of products

getReview: Returns the data from a review by his index

getStore: Returns the Store struct by his index

getStoresLength: Returns the total number of stores

getreviewsLength: Returns the totaal number of reviews


# Install

```

npm install

```

or 

```

yarn install

```

# Start

```

npm run dev

```

# Build

```

npm run build

```
# Usage
1. Install the [CeloExtensionWallet](https://chrome.google.com/webstore/detail/celoextensionwallet/kkilomkmpmkbdnfelcpgckmpcaemjcdh?hl=en) from the google chrome store.
2. Create a wallet.
3. Go to [https://celo.org/developers/faucet](https://celo.org/developers/faucet) and get tokens for the alfajores testnet.
4. Switch to the alfajores testnet in the CeloExtensionWallet.
