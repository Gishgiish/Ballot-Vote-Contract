const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { contractFactory, Signer } = require("ethers");

describe("BallotVote contract", function () {
  let BallotVote;
  let ballotVote;
  let owner;
  let voter1;
  let voter2;
  let proposalNames = ["Proposal 1", "Proposal 2", "Proposal 3"];

  before(async function () {
    BallotVote = await ethers.getContractFactory("BallotVote");
  });

  beforeEach(async function () {
    [owner, voter1, voter2] = await ethers.getSigners();

    ballotVote = await BallotVote.deploy(proposalNames);
    await ballotVote.deployed();
  });

  it("Should deploy the contract with correct chairperson", async function () {
    const chairperson = await ballotVote.chairperson;
    console.log("Chairperson: ", chairperson);
    expect(await ballotVote.chairperson).to.equal(owner.address);
  });

  it("Should give voting rights to voters", async function () {
    await ballotVote.giveRightToVote(voter1.address);
    await ballotVote.giveRightToVote(voter2.address);

    const voter1Info = await ballotVote.voters(voter1.address);
    const voter2Info = await ballotVote.voters(voter2.address);
    console.log("Voter 1 Info: ", voter1Info);
    console.log("Voter 2 Info: ", voter2Info);

    expect(voter1Info).to.not.be.null;
    expect(voter2Info).to.not.be.null;
  });

  it("Should prevent chairperson from voting", async function () {
    const error = "Chairperson cannot be given the right to vote!";
    const tx = ballotVote.giveRightToVote(owner.address);
    await expect(tx).to.be.revertedWith(error);
    console.log("Expected error: ", error);
  });

  it("Should allow voters to delegate and vote", async function () {
    await ballotVote.giveRightToVote(voter1.address);
    await ballotVote.giveRightToVote(voter2.address);

    await ballotVote.delegate(voter1.address);
    await ballotVote.vote(0);

    const voter1Data = await ballotVote.voters(voter1.address);
    const proposal0 = await ballotVote.proposals(0);
    console.log("Voter 1 Data: ", voter1Data);
    console.log("Proposal 0 Data: ", proposal0);

    expect(voter1Data.votedProposalId).to.equal(0);
    expect(proposal0.voteCount).to.equal(1);
  });

  it("Should prevent voters from double voting", async function () {
    await ballotVote.giveRightToVote(voter1.address);
    await ballotVote.vote(0);

    const error = "You have already voted!";
    const tx = ballotVote.vote(1);
    await expect(tx).to.be.revertedWith(error);
    console.log("Expected error: ", error);
  });

  it("Should determine the winning proposal", async function () {
    await ballotVote.giveRightToVote(voter1.address);
    await ballotVote.giveRightToVote(voter2.address);

    await ballotVote.vote(0);
    await ballotVote.vote(1);

    const winningProposal = await ballotVote.winningProposal();
    console.log("Winning Proposal: ", winningProposal);
    expect(winningProposal).to.equal("Proposal 1");
  });
});
