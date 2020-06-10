/*
################################################
Tests that it will fail from maxing Ether, Members and Days
Tests should be done 1 at a time and visually inspected
################################################
*/

const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');
var BigNumber = require('bignumber.js');

const _ = require('./utils.js');

var VETHER = artifacts.require("./Vether.sol");
var BURN = artifacts.require("./VetherBurn.sol");

var instanceVETH; var instanceBURN;
var acc0; var acc1; var acc2; var acc3; var acc4;

contract('VETHERBURN', function (accounts) {
    constructor(accounts)
    depositFailEther(12, accounts)
    // depositFailMembers(12, accounts)
    // depositFailDays(3, accounts)
})


//################################################################
// CONSTRUCTION
function constructor(accounts) {
    acc0 = accounts[0]; acc1 = accounts[1]; acc2 = accounts[2]; acc3 = accounts[3]; acc4 = accounts[4]

    it("constructor events", async () => {

        instanceVETH = await VETHER.deployed();
        instanceBURN = await BURN.deployed();

        const vetherAddr = await instanceBURN.vetherAddress()
        assert.equal(vetherAddr, instanceVETH.address, "address is correct")

        console.log(`Acc0: ${acc0}`)
        console.log(`Acc1: ${acc1}`)
        console.log(`Pools: ${instanceBURN.address}`)
    });
}

async function depositFailMembers(n, accounts) {

    it("It deposit fail due members", async () => {
        for (var i = 1; i <= n; i++) {
            
            var members = await instanceBURN.memberCount()
            var maxMembers = await instanceBURN.maxMembers()
            console.log(i, _.BN2Int(members), _.BN2Int(maxMembers))
            if(_.BN2Int(members) > _.BN2Int(maxMembers)){
                console.log('going to fail')
                await truffleAssert.reverts(instanceBURN.deposit(_.BN2Str(100), { value: _.BN2Str(_.dot01BN), from: accounts[i] }));
            } else {
                console.log('not going to fail')
                await instanceBURN.deposit(_.BN2Str(100), { value: _.BN2Str(_.dot01BN), from: accounts[i] })
            }
        }
    })

}

async function depositFailEther(n, accounts) {

    it("It deposit fail due ether", async () => {
        for (var i = 1; i <= n; i++) {
            
            var ether = await instanceBURN.etherPooled()
            var maxEther = await instanceBURN.maxEther()
            console.log(i, _.BN2Int(ether), _.BN2Int(maxEther))
            if(_.BN2Int(ether) >= _.BN2Int(maxEther)){
                console.log('going to fail')
                await truffleAssert.reverts(instanceBURN.deposit(_.BN2Str(100), { value: _.BN2Str(_.dot1BN), from: accounts[i] }));
            } else {
                console.log('not going to fail')
                await instanceBURN.deposit(_.BN2Str(100), { value: _.BN2Str(_.dot1BN), from: accounts[i] })
            }
        }
    })

}

async function depositFailDays(n, accounts) {

    it("It deposit fail due days", async () => {
        for (var i = 1; i <= n; i++) {
            
            var day = await instanceBURN.dayTotal()
            var maxDays = await instanceBURN.maxDays()
            console.log(i, _.BN2Int(day), _.BN2Int(maxDays))
            if(_.BN2Int(day) > _.BN2Int(maxDays)){
                console.log('going to fail')
                await truffleAssert.reverts(instanceBURN.deposit(_.BN2Str(100), { value: _.BN2Str(_.dot01BN), from: accounts[i] }));
            } else {
                console.log('not going to fail')
                await instanceBURN.deposit(_.BN2Str(100), { value: _.BN2Str(_.dot01BN), from: accounts[i] })   
            }
        await instanceBURN.burn();
        var day = await instanceBURN.dayTotal()
        console.log(_.BN2Int(day))
        await _.delay(2000) 
        }
    })

}

async function rollDay() {
    var era = await instanceVETH.currentEra()
    var day = await instanceVETH.currentDay()
    console.log('Current Era/Day',_.BN2Str(era),_.BN2Str(day))
    await _.delay(2000)
    await web3.eth.sendTransaction({from: acc0, to:instanceVETH.address, value: _.BN2Str(_.dot01BN)})
    var era2 = await instanceVETH.currentEra()
    var day2 = await instanceVETH.currentDay()
    console.log('Current Era/Day',_.BN2Str(era2),_.BN2Str(day2))
}



