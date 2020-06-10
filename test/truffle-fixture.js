
var Vether = artifacts.require("./Vether.sol") 
var Burn = artifacts.require("./VetherBurn.sol");

module.exports = async() => {
    const vether = await Vether.new();
    Vether.setAsDeployed(vether)
    const burn = await Burn.new(vether.address);
    Burn.setAsDeployed(burn)
};