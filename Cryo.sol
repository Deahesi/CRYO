pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./CYCO.sol";

contract Cryo is Ownable {
    using Counters for Counters.Counter;
    using Address for address;

    Counters.Counter private _tokenIds;

    struct CryoTech {
        uint256 amount;
        uint8 royalty;
        address creator;
    }

    struct CryoListing {
        uint256 amount;
        uint256 price;
        uint256 rent_price;
    }

    struct CryoRent {
        address tenant;
        uint256 amount;
        uint256 rent_price;
        uint256 last_payment;
    }

    //owner            //id
    mapping(address => mapping(uint256 => CryoTech)) public equipments;

    //seller           //id
    mapping(address => mapping(uint256 => CryoListing)) public listings;

    //owner            //tenant           //id
    mapping(address => mapping(address => mapping(uint256 => CryoRent)))
        public rents;

    CYCOToken token;

    event Purchase(
        address indexed previousOwner,
        address indexed newOwner,
        uint256 indexed id,
        uint256 amount,
        uint256 price
    );
    event Rented(
        address indexed owner,
        address indexed tenant,
        uint256 indexed id,
        uint256 amount,
        uint256 rent_price
    );
    event RentPayment(
        address indexed owner,
        address indexed tenant,
        uint256 indexed id,
        uint256 amount,
        uint256 cost
    );

    // string public name     = "CryoCoin";
    // string public symbol   = "CYCO";

    constructor(address payable _token) {
        require(
            Address.isContract(_token),
            "CYCO token address must be contract"
        );
        token = CYCOToken(_token);
    }

    receive() external payable {
        revert();
    }

    function getListing(address _owner, uint256 _id)
        public
        view
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        return (
            listings[_owner][_id].amount,
            listings[_owner][_id].price,
            listings[_owner][_id].rent_price
        );
    }

    function getRent(
        address _owner,
        address _tenant,
        uint256 _id
    )
        public
        view
        returns (
            address,
            uint256,
            uint256,
            uint256
        )
    {
        return (
            rents[_owner][_tenant][_id].tenant,
            rents[_owner][_tenant][_id].amount,
            rents[_owner][_tenant][_id].rent_price,
            rents[_owner][_tenant][_id].last_payment
        );
    }

    function getRentPrice(
        address _owner,
        address _tenant,
        uint256 _id
    ) public view returns (uint256) {
        return
            rents[_owner][_tenant][_id].rent_price *
            (block.timestamp - rents[_owner][_tenant][_id].last_payment);
    }

    function createEquip(
        address _eqowner,
        uint256 _amount,
        uint8 _royalty
    ) public onlyOwner returns (uint256) {
        require(_amount != 0, "equipment amount cannot be 0");
        require(
            _royalty >= 0 && _royalty < 21,
            "enter valid royalty percentage"
        );

        equipments[_eqowner][_tokenIds.current()] = CryoTech(
            _amount,
            _royalty,
            _eqowner
        );
        _tokenIds.increment();

        return _tokenIds.current() - 1;
    }

    function addListing(
        uint256 _id,
        uint256 _amount,
        uint256 _price,
        uint256 _rent_price
    ) public {
        require(
            equipments[msg.sender][_id].amount != 0,
            "you haven't any equipment with this id"
        );
        require(
            listings[msg.sender][_id].amount == 0,
            "you are already listing this equip"
        );
        require(_amount != 0, "you cannot listing 0 equipments");
        require(
            equipments[msg.sender][_id].amount >= _amount,
            "you haven't enough equipment"
        );
        require(_price > 0 && _rent_price > 0, "invalid price");

        listings[msg.sender][_id] = CryoListing(_amount, _price, _rent_price);
    }

    function changeListing(
        uint256 _id,
        uint256 _amount,
        uint256 _price,
        uint256 _rent_price
    ) public {
        require(_amount != 0, "you cannot listing 0 equipments");
        require(_price > 0 && _rent_price > 0, "invalid price");
        require(
            equipments[msg.sender][_id].amount >= _amount,
            "you haven't enough equipment"
        );
        require(
            listings[msg.sender][_id].amount != 0,
            "you haven't any listing with this id"
        );

        listings[msg.sender][_id] = CryoListing(_amount, _price, _rent_price);
    }

    function purchaseEquipment(
        address _seller,
        uint256 _id,
        uint256 _amount
    ) public {
        require(listings[_seller][_id].amount != 0, "no listings found");
        require(
            listings[_seller][_id].amount >= _amount,
            "no enough equipments in listing"
        );
        CryoListing memory listing = listings[_seller][_id];
        require(
            token.allowance(msg.sender, address(this)) >=
                listing.price * _amount,
            "not approved enough tokens to contract"
        );

        token.transferFrom(msg.sender, _seller, listing.price * _amount);
        listings[_seller][_id].amount -= _amount;
        equipments[_seller][_id].amount -= _amount;
        equipments[msg.sender][_id] = CryoTech(
            equipments[msg.sender][_id].amount + _amount,
            equipments[_seller][_id].royalty,
            equipments[_seller][_id].creator
        );

        emit Purchase(_seller, msg.sender, _id, _amount, listing.price);
    }

    function startRent(
        address _owner,
        uint256 _id,
        uint256 _amount
    ) public {
        require(listings[_owner][_id].amount != 0, "no listings found");
        require(
            listings[_owner][_id].amount >= _amount,
            "no enough equipments in listing"
        );
        CryoListing memory listing = listings[_owner][_id];
        require(
            token.allowance(msg.sender, address(this)) >=
                listing.rent_price * _amount,
            "not approved enough tokens to contract"
        );

        token.transferFrom(
            msg.sender,
            _owner,
            (listing.rent_price * 30 days) * _amount
        );

        listings[_owner][_id].amount -= _amount;

        rents[_owner][msg.sender][_id] = CryoRent(
            msg.sender,
            _amount,
            listings[msg.sender][_id].rent_price,
            block.timestamp
        );

        emit Rented(_owner, msg.sender, _id, _amount, listing.rent_price);
    }

    function endRent(address _owner, uint256 _id) public {
        require(rents[_owner][msg.sender][_id].amount != 0, "no rents found");
        // require(token.allowance(msg.sender, address(this)) >= listing.rent_price * _amount, "not approved enough tokens to contract");
        rents[_owner][msg.sender][_id] = CryoRent(address(0), 0, 0, 0);
    }

    function payRent(address _owner, uint256 _id) public {
        require(rents[_owner][msg.sender][_id].amount != 0, "no rents found");
        CryoRent memory rent = rents[_owner][msg.sender][_id];
        // require(, "not approved enough tokens to contract");

        uint256 price = rent.rent_price * (block.timestamp - rent.last_payment);

        if (token.allowance(msg.sender, address(this)) >= price) {
            token.transferFrom(msg.sender, _owner, price);

            rents[_owner][msg.sender][_id] = CryoRent(
                msg.sender,
                rent.amount,
                listings[msg.sender][_id].rent_price,
                block.timestamp
            );

            emit RentPayment(_owner, msg.sender, _id, rent.amount, price);
        } else {
            listings[_owner][_id].amount += rent.amount;
            rents[_owner][msg.sender][_id] = CryoRent(address(0), 0, 0, 0);
        }
    }

    function balanceOf(address _owner, uint256 _id)
        public
        view
        returns (uint256)
    {
        return equipments[_owner][_id].amount;
    }
}
