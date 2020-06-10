let Vether = artifacts.require("./Vether.sol");
let Burn = artifacts.require("./VetherBurn.sol");

module.exports = function(deployer, network) {
  deployer.deploy(Vether);
  deployer.deploy(Burn);
};
