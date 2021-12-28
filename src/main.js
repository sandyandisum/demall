import Web3 from "web3"
import { newKitFromWeb3 } from "@celo/contractkit"
import BigNumber from "bignumber.js"
import marketplaceAbi from "../contract/marketplace.abi.json"
import erc20Abi from "../contract/erc20.abi.json"

const ERC20_DECIMALS = 18
const MPContractAddress = "0x9360121A277b115B44C7F2dA1315EE08141494f8"
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"

let kit
let contract
let products = []
let stores = []
let bought = []
let reviewIndex = 0
let reviews = []

const connectCeloWallet = async function () {
  if (window.celo) {
    notification("⚠️ Please approve this DApp to use it.")
    try {
      await window.celo.enable()
      notificationOff()

      const web3 = new Web3(window.celo)
      kit = newKitFromWeb3(web3)

      const accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]

      contract = new kit.web3.eth.Contract(marketplaceAbi, MPContractAddress)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.")
  }
}

async function approve(_price) {
  const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)

  const result = await cUSDContract.methods
    .approve(MPContractAddress, _price)
    .send({ from: kit.defaultAccount })
  return result
}

const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
  document.querySelector("#balance").textContent = cUSDBalance
}

const getStores = async function() {
  const _storesLength = await contract.methods.getStoresLength().call()
  const _stores = []

  for (let i = 0; i < _storesLength; i++) {
    let _store = new Promise(async (resolve, reject) => {
      let s = await contract.methods.getStore(i).call()
      resolve({
        index: i,
        name: s[0],
        products: s[1]
      })
    })
    _stores.push(_store)
  }
  stores = await Promise.all(_stores)
  renderStores()
}

const getProducts = async function() {
  const _productsLength = await contract.methods.getProductsLength().call()
  const _products = []
  bought = await contract.methods.getBoughtProducts(kit.defaultAccount).call()
  for (let i = 0; i < _productsLength; i++) {
    let _product = new Promise(async (resolve, reject) => {
      let p = await contract.methods.getProduct(i).call()
      resolve({
        index: i,
        owner: p[0],
        name: p[1],
        image: p[2],
        description: p[3],
        store: p[4],
        price: new BigNumber(p[5]),
        reviews: p[6],
      })
    })
    _products.push(_product)
  }
  products = await Promise.all(_products)
}

async function renderStores() {
  document.getElementById("filterList").innerHTML = '<option selected>All Stores</option>'
  for (let _store of stores){
    document.getElementById("filterList").innerHTML += `<option value="${_store.index}">${_store.name}</option>`
    document.getElementById("selectStore").innerHTML += `<option value="${_store.index}">${_store.name}</option>`
  }
}

async function renderProducts() {
  document.getElementById("store").innerHTML = ""
  for (let _product of products){
    const newDiv = document.createElement("div")
    newDiv.className = "col-md-4"
    newDiv.innerHTML = await productTemplate(_product)
    document.getElementById("store").appendChild(newDiv)
  }
}

function renderReviews() {
  document.getElementById("reviewsViewList").innerHTML = ""
  for (let _review of reviews) {
    const newDiv = document.createElement("li")
    newDiv.className = "list-group-item"
    newDiv.innerHTML = reviewTemplate(_review)
    document.getElementById("reviewsViewList").appendChild(newDiv)
  }
}

function reviewTemplate(_review) {
  return `
  <div class="row">
  <div class="col-md-2">
    <div class="row">
      <div class="col" style="margin-left: 4px;">
        ${identiconTemplate(_review.creator)}
      </div>
      <div class="col">
      <p class="text-center">
        ${_review.points} / 5
      </p>
      </div>
    </div>
  </div>
  <div class="col-md-10">
  ${_review.content}
  </div>
  </div>
  `
}

async function productTemplate(_product) {
  const storeName = await contract.methods.getStore(_product.store).call()
  let button = _product.owner == kit.defaultAccount || bought.includes((_product.index).toString()) ? `<a type="button" class="btn btn-sm btn-outline-secondary reviewBtn" id="${_product.index}" data-bs-toggle="modal" data-bs-target="#addReviewModal">Review</a>` : `<button type="button" class="btn btn-sm btn-outline-secondary buyBtn" id="${_product.index}">Buy for ${_product.price.shiftedBy(-ERC20_DECIMALS).toFixed(2)}</button>`
  return `
  <div class="col">
  <div class="card" style="width: 18rem;">
    <img src="${_product.image}" class="card-img-top" alt="..." style="height: 200px; width: 100%; object-fit: cover;">
    <div class="card-body">
    <div class="translate-middle-y" style="widht: 100%">
        ${identiconTemplate(_product.owner)}
    </div>
      <h5 class="card-title">${_product.name}</h5>
      <p class="text-muted">${storeName[0]}</p>
      <p class="card-text">${_product.description}</p>

      <div class="btn-group">
        <a type="button" class="btn btn-sm btn-outline-secondary viewReviews" data-bs-toggle="modal" data-bs-target="#reviewsModal" id="${_product.index}">View Reviews</a>
        ${button}
      </div>
      
  
    </div>
  </div>
  </div>
  `
}

function identiconTemplate(_address) {
  const icon = blockies
    .create({
      seed: _address,
      size: 8,
      scale: 16,
    })
    .toDataURL()

  return `
  <div class="rounded-circle overflow-hidden d-inline-block border border-white border-2 shadow-sm m-0">
    <a href="https://alfajores-blockscout.celo-testnet.org/address/${_address}/transactions"
        target="_blank">
        <img src="${icon}" width="48" alt="${_address}">
    </a>
  </div>
  `
}

function notification(_text) {
  document.querySelector(".alert").style.display = "block"
  document.querySelector("#notification").textContent = _text
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none"
}

window.addEventListener("load", async () => {
  notification("⌛ Loading...")
  await connectCeloWallet()
  await getBalance()
  await getProducts()
  renderProducts()
  bought = await contract.methods.getBoughtProducts(kit.defaultAccount).call()
  await getStores()
  notificationOff()
});

document.querySelector("#newProductBtn").addEventListener("click", async (e) => {
  const params = [
    document.getElementById("newProductName").value,
    document.getElementById("newImgUrl").value,
    document.getElementById("newProductDescription").value,
    document.getElementById("selectStore").value,
    new BigNumber(document.getElementById("newPrice").value)
    .shiftedBy(ERC20_DECIMALS)
    .toString()
  ]
  notification(`⌛ Adding "${params[0]}"...`)
  try {
    const result = await contract.methods
      .addProduct(...params)
      .send({ from: kit.defaultAccount })
  } catch (error) {
    notification(`⚠️ ${error}.`)
  }
  notification(`🎉 You successfully added "${params[0]}".`)
  getProducts()
  renderProducts()
})

document.querySelector("#newStoreBtn").addEventListener("click", async (e) => {
  const name = document.getElementById("newStoreName").value;
  notification(`⌛ Adding "${name}"...`)
  try {
    const result = await contract.methods
      .addStore(name)
      .send({ from: kit.defaultAccount })
  } catch (error) {
    notification(`⚠️ ${error}.`)
  }
  notification(`🎉 You successfully added "${name}".`)
  getStores()
})

document.querySelector("#store").addEventListener("click", async (e) => {
  if (e.target.className.includes("buyBtn")) {
    const index = e.target.id
    notification("⌛ Waiting for payment approval...")
    try {
      await approve(products[index].price)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`⌛ Awaiting payment for "${products[index].name}"...`)
    try {
      const result = await contract.methods
        .buyProduct(index)
        .send({ from: kit.defaultAccount })
      notification(`🎉 You successfully bought "${products[index].name}".`)
      bought = await contract.methods.getBoughtProducts(kit.defaultAccount).call()
      getProducts()
      renderProducts()
      getBalance()
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  }
  if (e.target.className.includes("viewReviews")) {
    const index = e.target.id
    const _prod = await contract.methods.getProduct(index).call()

    const reviewsList = _prod[6]

    let _reviews = []

    for (let review of reviewsList) {
      let _rev = new Promise(async (resolve, reject) => {
        let r = await contract.methods.getReview(review).call()
        resolve({
          index: review,
          creator: r[0],
          content: r[1],
          points: r[2]
        })
      })
      _reviews.push(_rev)
    }
    reviews = await Promise.all(_reviews)

    renderReviews()
  }
  if (e.target.className.includes("reviewBtn")) {
    reviewIndex = e.target.id
  }
})  

document.querySelector("#newReviewBtn").addEventListener("click", async (e) => {
  const params = [
    reviewIndex,
    document.getElementById("newReview").value,
    document.getElementById("newPoints").value
  ]
  notification(`⌛ Adding Review...`)
  try {
    const result = await contract.methods
      .addReview(...params)
      .send({ from: kit.defaultAccount })
  } catch (error) {
    notification(`⚠️ ${error}.`)
  }
  notification(`🎉 You successfully added your review.`)
})

document.querySelector("#filterList").addEventListener("change", async (e)=> {
  getProducts()
  if(e.target.value != "All Stores"){
    products = products.filter((ele) => {
      return ele.store == e.target.value
    })
  }
  renderProducts()
})