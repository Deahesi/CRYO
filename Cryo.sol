pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "CYCO.sol";

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
        uint256 next_payment;
    }

    //owner            //id
    mapping(address => mapping(uint256 => CryoTech)) public equipments;

    //seller           //id
    mapping(address => mapping(uint256 => CryoListing)) public listings;

    //owner            //tenant           //id
    mapping(address => mapping(address => mapping(uint256 => CryoRent)))
        public rents;

    CYCOToken token;

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

    function createEquip(
        address _eqowner,
        uint256 _id,
        uint256 _amount,
        uint8 _royalty
    ) public onlyOwner {
        require(
            equipments[_eqowner][_id].amount == 0,
            "equipment with this id already created"
        );
        require(_amount != 0, "equipment amount cannot be 0");
        require(
            _royalty >= 0 && _royalty < 21,
            "enter valid royalty percentage"
        );

        equipments[_eqowner][_id] = CryoTech(_amount, _royalty, _eqowner);
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
        require(_amount != 0, "you cannot listing 0 equipments");
        require(
            equipments[msg.sender][_id].amount >= _amount,
            "you haven't enough equipment"
        );
        require(_price > 0 && _rent_price > 0, "invalid price");

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

        listing[_owner][msg.sender][_id].amount -= _amount;
        rents[_owner][msg.sender][_id] = CryoRent(
            msg.sender,
            _amount,
            listings[msg.sender][_id].rent_price,
            now,
            now + 30 days
        );
    }

    function payRent(address _owner, uint256 _id) public {
        require(rents[_owner][msg.sender][_id].amount != 0, "no rents found");
        CryoRent memory rent = rents[_owner][msg.sender][_id];
        require(now - rent.next_payment >= 0, "not payment date");
        // require(, "not approved enough tokens to contract");

        if (
            token.allowance(msg.sender, address(this)) >=
            ((rent.rent_price *
                ((rent.next_payment - rent.last_payment) +
                    (now - rent.next_payment))) * rent.amount)
        ) {
            token.transferFrom(
                msg.sender,
                _owner,
                (rent.rent_price *
                    ((rent.next_payment - rent.last_payment) +
                        (now - rent.next_payment))) * rent.amount
            );
            rent.last_payment = now;
            rent.next_payment = now + 30 days;

            rents[_owner][msg.sender][_id] = CryoRent(
                msg.sender,
                rent.amount,
                listings[msg.sender][_id].rent_price,
                now,
                now + 30 days
            );
        }
    }
}
