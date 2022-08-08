// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract Burnance is ReentrancyGuard, Pausable, Ownable {

    address public furnace = address(0);
    uint256 public defaultPrice = 1 gwei;
    uint256 public guaranteeFee = 0.0017 ether;
    uint256 public buyBackPrice = 0.006 ether;
    uint256 public maxTokensPerTx = 100;

    uint256 public guaranteeTransferId;

    struct GauranteeIntent {
        address contractAddress;
        address owner;
        uint256 amount;
        uint256 expireTime;
        uint256 id;
    }

    mapping(address => uint256) private _contractPrices;
    mapping(uint256 => GauranteeIntent) public guaranteeById;
    mapping(address => uint256[]) public _userGuarantees;
    mapping(uint256 => uint256) public _guaranteesIndex;

    function setFurnace(address _furnance) public onlyOwner {
        furnace = _furnance;
    }

    function setDefaultPrice(uint256 _defaultPrice) public onlyOwner {
        defaultPrice = _defaultPrice;
    }

    function setGuaranteeFee(uint256 _guaranteeFee) public onlyOwner {
        guaranteeFee = _guaranteeFee;
    }

    function setBuyBackPrice(uint256 _buyBackPrice) public onlyOwner {
        buyBackPrice = _buyBackPrice;
    }

    function setMaxTokensPerTx(uint256 _maxTokensPerTx) public onlyOwner {
        maxTokensPerTx = _maxTokensPerTx;
    }

    function setPriceByContract(address contractAddress, uint256 price) public onlyOwner {
        _contractPrices[contractAddress] = price;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _getPrice(address contractAddress) internal view returns (uint256) {
        if (_contractPrices[contractAddress] > 0)
            return _contractPrices[contractAddress];
        else return defaultPrice;
    }

    function batchTransfer(address[] calldata tokenContracts, uint256[] calldata amounts) external whenNotPaused {
        require(furnace != address(0), "Furnace cannot be the 0x0 address");
        require(tokenContracts.length > 0, "Must have 1 or more token contracts");
        require(tokenContracts.length == amounts.length, "All params must have equal length");

        uint256 totalTokens = tokenContracts.length;
        uint256 totalPrice;

        require(totalTokens < maxTokensPerTx, "Maximum token count reached.");

        for (uint256 i; i < tokenContracts.length; i++) {
            require(amounts[i] > 0, "Token amount must be greater than zero.");

            totalPrice += _getPrice(tokenContracts[i]);        
            
            transferToken(
                msg.sender,
                furnace,
                tokenContracts[i],
                amounts[i]
            );
        }

        require(address(this).balance > totalPrice, "Not enough ether in contract.");

        (bool sent, ) = payable(msg.sender).call{value: totalPrice}("");
        require(sent, "Failed to send ether.");
    }

    function gauranteeTransfer(address _tokenContract, uint256 _amount, uint256 _monthsReserved) public payable whenNotPaused {
        // Checks payment and max reserved months
        require(
            msg.value >= _monthsReserved * guaranteeFee,
            "Not enough ether to pay guarantee fee."
        );
        require(
            _monthsReserved <= 36,
            "can't reserve for more than 36 months."
        );

        // Transfer from the user to this contract
        transferToken(
            msg.sender,
            address(this),
            _tokenContract,
            _amount
        );  

        // Save guarantee info for tracking
        saveForTracking(_tokenContract, msg.sender, _amount, _monthsReserved);     

        // Calculates and send the payment
        uint256 payment = _getPrice(_tokenContract);

        (bool sent, ) = payable(msg.sender).call{value: payment}("");
        require(sent, "Failed to send ether.");
    }

    function buyBack (uint256 _guaranteeId) public payable {
        // Gets the guarantee using the id
        GauranteeIntent memory guarantee = guaranteeById[_guaranteeId];

        // Verify ownership, expiration time and ETH for payment
        require(guarantee.owner == msg.sender, "Only the owner can buy back this token");
        require(guarantee.expireTime > block.timestamp, "Guarantee is expired");
        require(msg.value >= buyBackPrice, "Not enough ETH to buy back");

        // Removes guarantee from the tracking
        removeFromTracking(guarantee.owner, _guaranteeId);

        // Transfer the NFT back to the user
        transferToken(
            address(this),
            guarantee.owner,
            guarantee.contractAddress,
            guarantee.amount
        );
    }

    function batchRemove (uint256 [] memory _guaranteeIds) external onlyOwner {
        GauranteeIntent memory guarantee;

        for(uint256 i; i < _guaranteeIds.length; i++){
            guarantee = guaranteeById[_guaranteeIds[i]];

            // if there's expireTime and timestamp is bigger, this guarantee can be claimed
            if(guarantee.expireTime != 0 && guarantee.expireTime < block.timestamp){
                // Removes guarantee from the tracking
                removeFromTracking(guarantee.owner, _guaranteeIds[i]);

                // Transfer the NFT back to the user
                transferToken(
                    address(this),
                    owner(),
                    guarantee.contractAddress,
                    guarantee.amount
                );
            } 
            // else ignore this guarantee id
            else {
                continue;
            }
        }
    }

    function transferToken(address from, address to, address contractAddress, uint256 amount) internal {    
        if(from == address(this)){
            IERC20(contractAddress).transfer(to, amount);     
        } else {
            IERC20(contractAddress).transferFrom(from, to, amount);     
        }
    }

    function saveForTracking(address _tokenContract, address user, uint256 _amount, uint256 _monthsReserved) internal {
        // Gets the guarantee Id
        uint256 id = guaranteeTransferId;

        // Create and save the info using the Id
        guaranteeById[id] = GauranteeIntent({
            contractAddress: _tokenContract,
            owner: user,
            amount: _amount,
            expireTime: block.timestamp + _monthsReserved * 60, // 1 month == 60 seconds on testnet
            // expireTime: block.timestamp + _monthsReserved * 30 days, // USE THIS ON MAINNET 
            id: id
        });

        // Assign the guarantee created to the user
        _guaranteesIndex[id] = _userGuarantees[user].length;
        _userGuarantees[user].push(id);

        // Increase the counter to avoid Id collision
        guaranteeTransferId++;
    }

    function removeFromTracking(address _owner, uint256 _guaranteeId) internal {
        // To prevent a gap in _userGuarantees array, we save the last guarantee in the index of the guarantee we want to delete
        uint256 lastGuaranteeIndex = _userGuarantees[_owner].length - 1;
        uint256 guaranteeIndex = _guaranteesIndex[_guaranteeId];

        // When the guarantee to delete is the last in the array, don't need to swap
        if (guaranteeIndex != lastGuaranteeIndex) {
            uint256 lastGuaranteeId = _userGuarantees[_owner][
                lastGuaranteeIndex
            ];

            _userGuarantees[_owner][guaranteeIndex] = lastGuaranteeId;
            _guaranteesIndex[lastGuaranteeId] = guaranteeIndex;
        }

        // Delete last position of the array and guaranteeById info
        _userGuarantees[_owner].pop();
        delete guaranteeById[_guaranteeId];
    }

    function getGuarantees(address _senderAddress) public view returns (GauranteeIntent[] memory lists) {
        uint256 length = _userGuarantees[_senderAddress].length;
        lists = new GauranteeIntent[](length);

        for (uint256 i; i < length; i++) {
            lists[i] = guaranteeById[_userGuarantees[_senderAddress][i]];
        }
    }

    receive() external payable {}

    function withdrawBalance() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }
}
