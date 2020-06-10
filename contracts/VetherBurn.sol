pragma solidity ^0.6.4;

import "./Vether.sol";

// Safe Math
library SafeMath {
    function sub(uint a, uint b) internal pure returns (uint) {
        assert(b <= a);
        return a - b;
    }

    function add(uint a, uint b) internal pure returns (uint)   {
        uint c = a + b;
        assert(c >= a);
        return c;
    }

    function mul(uint a, uint b) internal pure returns (uint) {
        if (a == 0) {
            return 0;
        }
        uint c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");
        return c;
    }

    function div(uint a, uint b) internal pure returns (uint) {
        require(b > 0, "SafeMath: division by zero");
        uint c = a / b;
        return c;
    }
}

contract VETHERBURN {
    using SafeMath for uint;

    address payable public vetherAddress;
    uint public _1 = 10**18;
    uint public burnerShare = 9900;

    uint public maxMembers;
    uint public maxEther;
    uint public maxDays;
    
    uint public dayTotal;
    uint public etherPooled;
    uint public memberCount;
    address[] public arrayMembers;
    mapping(address => MemberData) public mapMemberData;
    struct MemberData {
        uint etherToBurn;
        uint daysToBurn;
    }
    uint public lastDay;
    uint public lastEra;

    mapping(uint => mapping(uint => uint)) public mapEraDay_TotalBurnt;
    mapping(uint => mapping(uint => bool)) public mapEraDay_Burnt;
   
    constructor (address payable addressVether) public {
        vetherAddress = addressVether;
        dayTotal = 1;

        //local
        maxMembers = 10;
        maxEther = _1;
        maxDays = 3;

        //testnet
        // maxMembers = 2;
        // maxEther = _1;
        // maxDays = 2;

        //mainnet
        // maxMembers = 10;
        // maxEther = 10;
        // maxDays = 10;
    }

    receive() external payable {
    }

    function deposit(uint dayCount) public payable returns (bool success) {
        require(etherPooled.add(msg.value) <= maxEther, 'too much ether');
        require(memberCount <= maxMembers, 'too many members');
        require(dayTotal <= maxDays, 'went past max days');
        
        uint maxDayCount = maxDays.sub(dayTotal);
        if(maxDayCount >= maxDays){
            mapMemberData[msg.sender].daysToBurn = maxDayCount;  
        } else {
            mapMemberData[msg.sender].daysToBurn = dayCount; 
        }
        mapMemberData[msg.sender].etherToBurn = msg.value;
        arrayMembers.push(msg.sender); 
        memberCount += 1;
        etherPooled += msg.value;
        return true;
    }

    function burn() public returns (bool sucess){
        uint era_ = VETHER(vetherAddress).currentEra(); 
        uint day_ = VETHER(vetherAddress).currentDay();
        require(!mapEraDay_Burnt[era_][day_], 'must not be burnt already');
        uint totalBurntForDay;
        for(uint i = 0; i < memberCount; i++){
            address member = arrayMembers[i];
            uint daysToBurn = mapMemberData[member].daysToBurn;
            uint etherToBurn = mapMemberData[member].etherToBurn;
            uint ethToBurnToday = etherToBurn.div(daysToBurn);
            totalBurntForDay += ethToBurnToday;
        }
        vetherAddress.call.value(totalBurntForDay)(""); 
        mapEraDay_TotalBurnt[era_][day_] = totalBurntForDay;
        mapEraDay_Burnt[era_][day_] = true;
        dayTotal += 1;
        uint vetherToWithdrawYesterday = VETHER(vetherAddress).getEmissionShare(lastEra, lastDay, address(this));
        if(vetherToWithdrawYesterday>0){
            withdraw(lastEra, lastDay);
        }
        lastEra = era_;
        lastDay = day_;
        return true;
    }

    function withdraw(uint era, uint day) private returns (uint total){
        uint vetherToWithdraw = VETHER(vetherAddress).getEmissionShare(era, day, address(this));
        VETHER(vetherAddress).withdrawShare(era, day);
        uint totalForDay = mapEraDay_TotalBurnt[era][day];
        uint burnerFee;
        for(uint i = 0; i < memberCount; i++){
            address member = arrayMembers[i];
            uint daysToBurn = mapMemberData[member].daysToBurn;
            uint etherToBurn = mapMemberData[member].etherToBurn;
            uint ethBurntForMember = etherToBurn.div(daysToBurn);
            uint share = (vetherToWithdraw.mul(ethBurntForMember)).div(totalForDay);
            uint memberShare = (share.mul(burnerShare)).div(10000);
            burnerFee += share.sub(memberShare);
            VETHER(vetherAddress).transfer(member, memberShare);
        }
        VETHER(vetherAddress).transfer(msg.sender, burnerFee);
        return total;
    }
}
