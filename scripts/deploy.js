const { ethers } = require("hardhat");

async function main() {
  const BallotVote = await ethers.getContractFactory("BallotVote");
  const ballotVote = await BallotVote.deploy(proposalNames);

  await ballotVote.deployed();

  console.log("BallotVote contract deployed to:", ballotVote.address);

  //initialize proposals
  const proposalNames = ["Proposal 1", "Proposal 2", "Proposal 3"];
  await ballotVote.initializeProposals(proposalNames);
  console.log("Proposals initialized.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
