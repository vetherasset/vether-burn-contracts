# Vether BURN Contract 

Vether Burn Contracts will allow members to deposit Ether, then for other people to automate the daily burning process. 

### Member

Simply call `deposit(days)` with an attached amount of Ether, and the number of days to burn over. 

### Burners

In order to claim the fee of 1%, call `burn()` on the contract. This will
1) Burn for everyone on the current day
2) If vether is available for yesterday, it will withdraw it
3) Pay out everyone who burnt yesterday
4) Pay you the 1% fee

Note: `burn()` can only be called once a day, so it's a race once a new day starts. 

## Smart Contract

Vether Burn has the following intended design:

Users
* Deposit Ether to burn over several days

Burners
* Burn and Withdraw on behalf of other people for a fee

**Limits**
There is a `maxEther` `maxMembers` `maxDays` to limit liability on the contract initially. 

### ERC-20

### Vether Public Get Methods

```solidity
address payable public vetherAddress;
uint public _1 = 10**18;
uint public burnerShare = 9900;

uint public maxMembers;
uint public maxEther;
uint public maxDays;

uint public day;
uint public etherPooled;
uint public memberCount;
address[] public arrayMembers;
mapping(address => MemberData) public mapMemberData;
struct MemberData {
    uint etherToBurn;
    uint daysToBurn;
}

mapping(uint => mapping(uint => uint)) public mapEraDay_TotalBurnt;
mapping(uint => mapping(uint => bool)) public mapEraDay_Burnt;
```

### Vether Public Transactions
```solidity
function deposit(uint dayCount) public payable returns (bool success)
function burn() public returns (bool sucess)
```

### Constructor

```solidity
//local
maxMembers = 10;
maxEther = _1;
maxDays = 2;

//testnet
maxMembers = 2;
maxEther = _1;
maxDays = 2;

//mainnet
maxMembers = 10;
maxEther = 10;
maxDays = 10;

```


## Testing - Buidler

The test suite uses [Buidler](https://buidler.dev/) as the preferred testing suite, since it compiles and tests faster. 
The test suite implements 7 routines that can be tested individually.

```
npx buidler compile
```

Execute all at once:
```
npx builder test
```

Or execute individually:
```
npx builder test/1_coin.js
```

## Testing - Truffle
 Truffle testing can also be done:

```
truffle compile && truffle migrate --reset
```

Execute all at once:
```
truffle test
```

Or execute individually:
```
truffle test test/1_burn.js
```