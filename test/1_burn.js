/*
################################################
Creates the contracts
Deposits from 5 accounts, burns then withdraws
Deposits again and tests that burning in the same day fails
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
    deposit(4, accounts)
    burn()
    rollDay()
    burn()
    depositAgain(5, accounts)
    burnFail()
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
        const maxMembers = await instanceBURN.maxMembers()
        assert.equal(maxMembers, '10', "maxMembers is correct")
        const maxEther = _.getBN(await instanceBURN.maxEther())
        assert.equal(maxEther, _.BN2Str(_.oneBN), "maxEther is correct")
        const maxDays = await instanceBURN.maxDays()
        assert.equal(maxDays, '3', "maxDays is correct")

        console.log(`Acc0: ${acc0}`)
        console.log(`Acc1: ${acc1}`)
        console.log(`Burns: ${instanceBURN.address}`)
    });
}


async function deposit(n, accounts) {

    it("It deposits", async () => {
        for (var i = 1; i <= n; i++) {
            var balStartVeth = _.getBN(await web3.eth.getBalance(instanceBURN.address))
            var tx1 = await instanceBURN.deposit(_.BN2Str(10), { value: _.BN2Str(_.dot01BN), from: accounts[i] });
            var balEndVeth = _.getBN(await web3.eth.getBalance(instanceBURN.address))
            assert.equal(_.BN2Str(balEndVeth.minus(balStartVeth)), _.BN2Str(_.dot01BN))
            var etherToBurn = (await instanceBURN.mapMemberData(accounts[i])).etherToBurn
            assert.equal(_.BN2Str(etherToBurn), _.BN2Str(_.dot01BN))

            var dayCount = (await instanceBURN.mapMemberData(accounts[i])).daysToBurn
            assert.equal(_.BN2Str(dayCount), _.BN2Str(10))

            var memberCount = await instanceBURN.memberCount()
            assert.equal(_.BN2Str(memberCount), i)
            var members = await instanceBURN.arrayMembers(i-1)
            assert.equal(members, accounts[i])
        }
    })
}

function burn() {

    it("It burns", async () => {
        var balStartBurn = _.getBN(await web3.eth.getBalance('0xE5904695748fe4A84b40b3fc79De2277660BD1D3'))
        // console.log(_.BN2Str(balStartBurn))
        var balStartVeth = _.getBN(await web3.eth.getBalance(instanceVETH.address))
        // console.log(_.BN2Str(balStartVeth))

        var daysStart = await instanceBURN.dayTotal()

        var era = await instanceVETH.currentEra()
        var day = await instanceVETH.currentDay()
        console.log('burnt in:', _.BN2Str(era),_.BN2Str(day))

        var lastEra = await instanceBURN.lastEra()
        var lastDay = await instanceBURN.lastDay()
        console.log('last burn in:', _.BN2Str(lastEra),_.BN2Str(lastDay))

        var tx1 = await instanceBURN.burn();

        var balEndBurn = _.getBN(await web3.eth.getBalance('0xE5904695748fe4A84b40b3fc79De2277660BD1D3'))
        assert.equal(_.BN2Str(balEndBurn.minus(balStartBurn)), '4000000000000000')
        var balEndVeth = _.getBN(await web3.eth.getBalance(instanceVETH.address))
        assert.equal(_.BN2Str(balEndVeth.minus(balStartVeth)), 0)

        var shareVeth = await instanceVETH.getEmissionShare(era, day, instanceBURN.address)
        console.log(_.BN2Str(shareVeth), _.BN2Str(era),_.BN2Str(day))
        assert.equal(_.BN2Str(shareVeth), '2048')
        var units = await instanceVETH.mapEraDay_Units(era, day)
        assert.equal(_.BN2Str(units), '4000000000000000')

        var totalBurnt = await instanceBURN.mapEraDay_TotalBurnt(era, day)
        assert.equal(_.BN2Str(totalBurnt), '4000000000000000')

        var daysEnd = await instanceBURN.dayTotal()
        assert.equal(_.BN2Int(daysEnd)-_.BN2Int(daysStart), '1')

        if(_.BN2Int(lastDay) > 0){
            // console.log('here')
            var shareVethYesterday = await instanceVETH.getEmissionShare(lastEra, lastDay, instanceBURN.address)
            assert.equal(_.BN2Str(shareVethYesterday), '0')
                
                var bal0 = await instanceVETH.balanceOf(acc0)
                var bal1 = await instanceVETH.balanceOf(acc1)
                var bal2 = await instanceVETH.balanceOf(acc2)
                var bal3 = await instanceVETH.balanceOf(acc3)
                var bal4 = await instanceVETH.balanceOf(acc4)

                console.log(_.BN2Str(bal0))
                console.log(_.BN2Str(bal1),_.BN2Str(bal2))
                console.log(_.BN2Str(bal3),_.BN2Str(bal4))
                assert.equal(_.BN2Str(bal0.add(bal1).add(bal2).add(bal3).add(bal4)), '2048')
        }
        
    })
}

function rollDay() {
    it("It rolls a day", async () => {
        var era = await instanceVETH.currentEra()
        var day = await instanceVETH.currentDay()
        console.log('Current Era/Day',_.BN2Str(era),_.BN2Str(day))
        await _.delay(2000)
        await web3.eth.sendTransaction({from: acc0, to:instanceVETH.address, value: _.BN2Str(_.dot01BN)})
        var era2 = await instanceVETH.currentEra()
        var day2 = await instanceVETH.currentDay()
        console.log('Current Era/Day',_.BN2Str(era2),_.BN2Str(day2))
    })
}

function withdraw() {

    it("It withdraws", async () => {

        var tx1 = await instanceBURN.withdraw(1, 1);

        var bal0 = await instanceVETH.balanceOf(acc0)
        var bal1 = await instanceVETH.balanceOf(acc1)
        var bal2 = await instanceVETH.balanceOf(acc2)
        var bal3 = await instanceVETH.balanceOf(acc3)
        var bal4 = await instanceVETH.balanceOf(acc4)

        console.log(_.BN2Str(bal0))
        console.log(_.BN2Str(bal1),_.BN2Str(bal2))
        console.log(_.BN2Str(bal3),_.BN2Str(bal4))
        assert.equal(_.BN2Str(bal0.add(bal1).add(bal2).add(bal3).add(bal4)), '2048')

    })
}

async function depositAgain(n, accounts) {

    it("It deposits", async () => {
        for (var i = 1; i <= n; i++) {
            await instanceBURN.deposit(_.BN2Str(10), { value: _.BN2Str(_.dot01BN), from: accounts[i] });
        }
    })
}


function burnFail() {

    it("It fails to burn in same day", async () => {
        var era = await instanceVETH.currentEra()
        var day = await instanceVETH.currentDay()
        console.log('burnt in:', _.BN2Str(era),_.BN2Str(day))
        await truffleAssert.reverts(instanceBURN.burn());
        var era2 = await instanceVETH.currentEra()
        var day2 = await instanceVETH.currentDay()
        console.log('burnt in:', _.BN2Str(era2),_.BN2Str(day2))
        await truffleAssert.reverts(instanceBURN.burn());
        var era3 = await instanceVETH.currentEra()
        var day3 = await instanceVETH.currentDay()
        console.log('burnt in:', _.BN2Str(era3),_.BN2Str(day3))
        await truffleAssert.reverts(instanceBURN.burn());
    })
}




