// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "hardhat/console.sol";

contract BallotVote {
    address public chairperson;
    uint public winningProposalIdx;

    struct Voter {
        bool hasVoted;
        uint votedProposalId;
    }

    struct Proposal {
        bytes32 name;
        uint voteCount;
    }

    Proposal[] public proposals;
    mapping(address => Voter) public voters;

    constructor() {
        chairperson = msg.sender;
        voters[chairperson].hasVoted = true; // Chairperson cannot vote
    }

    function initializeProposals(bytes32[] memory proposalnames) external {
        require(
            msg.sender == chairperson,
            "Only chairperson can initialize proposals."
        );
        require(
            proposals.length == 0,
            "Proposals have already been initialized."
        );

        for (uint i = 0; i < proposalnames.length; i++) {
            proposals.push(Proposal({name: proposalnames[i], voteCount: 0}));
        }
    }

    function giveRightToVote(address voter) public {
        require(
            msg.sender == chairperson,
            "Only chairperson can give the right to vote."
        );
        require(!voters[voter].hasVoted, "The voter has already voted.");
        require(
            voter != chairperson,
            "Chairperson cannot be given the right to vote."
        );
        voters[voter].hasVoted = false;
    }

    function delegate(address to) public {
        require(!voters[msg.sender].hasVoted, "You have already voted.");
        require(to != msg.sender, "Self-delegation is disallowed.");
        address currentDelegate = to;
        while (voters[currentDelegate].hasVoted) {
            require(currentDelegate != msg.sender, "Found loop in delegation.");
            currentDelegate = voters[currentDelegate].votedProposalId == 0
                ? to
                : address(uint160(voters[currentDelegate].votedProposalId));
        }
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = uint160(currentDelegate);
        //proposals[currentDelegate].voteCount++;
    }

    function vote(uint proposal) public {
        require(!voters[msg.sender].hasVoted, "You have already voted.");
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = proposal;
        proposals[proposal].voteCount++;
    }

    function winningProposal()
        public
        view
        returns (bytes32 winningProposalName)
    {
        uint maxVoteCount = 0;
        uint winningProposalIndex = 0;
        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > maxVoteCount) {
                maxVoteCount = proposals[i].voteCount;
                winningProposalIndex = i;
            }
        }
        winningProposalName = proposals[winningProposalIndex].name;
    }
}
