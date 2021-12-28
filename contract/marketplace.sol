// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
    function transfer(address, uint256) external returns (bool);

    function approve(address, uint256) external returns (bool);

    function transferFrom(
        address,
        address,
        uint256
    ) external returns (bool);

    function totalSupply() external view returns (uint256);

    function balanceOf(address) external view returns (uint256);

    function allowance(address, address) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

contract Mall {
    uint256 internal storesLength = 0;
    uint256 internal productsLength = 0;
    uint256 internal reviewsLength = 0;
    address internal cUsdTokenAddress =
        0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    struct Product {
        address payable owner;
        string name;
        string image;
        string description;
        uint256 store;
        uint256 price;
        uint256[] reviews;
    }

    struct Review {
        address creator;
        string content;
        uint256 points;
    }

    struct Store {
        string name;
        uint256[] products;
    }

    mapping(uint256 => Review) internal reviews;

    mapping(uint256 => Product) internal products;

    mapping(address => uint256[]) internal boughtProducts;

    mapping(uint256 => Store) internal stores;

    function addProduct(
        string memory _name,
        string memory _image,
        string memory _description,
        uint256 _store,
        uint256 _price
    ) public {
        uint256[] memory _reviews;
        products[productsLength] = Product(
            payable(msg.sender),
            _name,
            _image,
            _description,
            _store,
            _price,
            _reviews
        );
        stores[_store].products.push(productsLength);
        productsLength++;
    }

    function addStore(string memory _name) public {
        uint256[] memory _products;
        stores[storesLength] = Store(_name, _products);
        storesLength++;
    }

    function getProduct(uint256 _index)
        public
        view
        returns (
            address payable,
            string memory,
            string memory,
            string memory,
            uint256,
            uint256,
            uint256[] memory
        )
    {
        return (
            products[_index].owner,
            products[_index].name,
            products[_index].image,
            products[_index].description,
            products[_index].store,
            products[_index].price,
            products[_index].reviews
        );
    }

    function getStore(uint256 _index)
        public
        view
        returns (string memory, uint256[] memory)
    {
        return (stores[_index].name, stores[_index].products);
    }

    function addReview(
        uint256 _index,
        string memory _content,
        uint256 _points
    ) public {
        reviews[reviewsLength] = Review(msg.sender, _content, _points);
        products[_index].reviews.push(reviewsLength);
        reviewsLength++;
    }

    function getReview(uint256 _index)
        public
        view
        returns (
            address,
            string memory,
            uint256
        )
    {
        return (
            reviews[_index].creator,
            reviews[_index].content,
            reviews[_index].points
        );
    }

    function buyProduct(uint256 _index) public payable {
        require(
            IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                products[_index].owner,
                products[_index].price
            ),
            "Transfer failed."
        );
        boughtProducts[msg.sender].push(_index);
    }

    function getStoresLength() public view returns (uint256) {
        return (storesLength);
    }

    function getProductsLength() public view returns (uint256) {
        return (productsLength);
    }

    function getreviewsLength() public view returns (uint256) {
        return (reviewsLength);
    }

    function getBoughtProducts(address _profile)
        public
        view
        returns (uint256[] memory)
    {
        return (boughtProducts[_profile]);
    }
}
