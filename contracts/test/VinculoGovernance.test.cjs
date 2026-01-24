/**
 * Tests for VinculoGovernance
 *
 * Run: npx hardhat test test/VinculoGovernance.test.cjs
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VinculoGovernance", function () {
  let governance;
  let owner, landlord, tenant, arbitrator1, arbitrator2, arbitrator3, operator;

  const RENTAL_CONTRACT_ID = 42;
  const DISPUTE_AMOUNT = ethers.parseEther("1"); // 1 MATIC

  // Enum values
  const DisputeType = {
    PaymentDefault: 0,
    PropertyDamage: 1,
    ContractBreach: 2,
    DepositDispute: 3,
    MaintenanceIssue: 4,
    EarlyTermination: 5,
    Other: 6
  };

  const DisputeStatus = {
    Opened: 0,
    UnderReview: 1,
    AwaitingEvidence: 2,
    Voting: 3,
    Resolved: 4,
    Appealed: 5,
    Closed: 6
  };

  const Resolution = {
    None: 0,
    InFavorOfLandlord: 1,
    InFavorOfTenant: 2,
    PartialBoth: 3,
    Dismissed: 4
  };

  beforeEach(async function () {
    [owner, landlord, tenant, arbitrator1, arbitrator2, arbitrator3, operator] = await ethers.getSigners();

    const VinculoGovernance = await ethers.getContractFactory("VinculoGovernance");
    governance = await VinculoGovernance.deploy();
    await governance.waitForDeployment();

    // Setup operators
    const OPERATOR_ROLE = await governance.OPERATOR_ROLE();
    await governance.grantRole(OPERATOR_ROLE, operator.address);

    // Add arbitrators
    await governance.addArbitrator(arbitrator1.address);
    await governance.addArbitrator(arbitrator2.address);
    await governance.addArbitrator(arbitrator3.address);
  });

  describe("Deployment", function () {
    it("Should set owner as admin", async function () {
      const DEFAULT_ADMIN_ROLE = await governance.DEFAULT_ADMIN_ROLE();
      expect(await governance.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("Should start with zero disputes", async function () {
      const stats = await governance.getStats();
      expect(stats._totalDisputes).to.equal(0);
    });

    it("Should have default configuration", async function () {
      expect(await governance.evidenceDeadlineDays()).to.equal(7);
      expect(await governance.appealDeadlineDays()).to.equal(3);
      expect(await governance.minArbitratorsForVoting()).to.equal(3);
    });
  });

  describe("Arbitrator Management", function () {
    it("Should add arbitrators correctly", async function () {
      const activeArbitrators = await governance.getActiveArbitrators();
      expect(activeArbitrators.length).to.equal(3);
      expect(activeArbitrators).to.include(arbitrator1.address);
    });

    it("Should set arbitrator info", async function () {
      const info = await governance.arbitrators(arbitrator1.address);
      expect(info.arbitrator).to.equal(arbitrator1.address);
      expect(info.isActive).to.be.true;
      expect(info.reputation).to.equal(100);
    });

    it("Should grant ARBITRATOR_ROLE", async function () {
      const ARBITRATOR_ROLE = await governance.ARBITRATOR_ROLE();
      expect(await governance.hasRole(ARBITRATOR_ROLE, arbitrator1.address)).to.be.true;
    });

    it("Should remove arbitrator", async function () {
      await governance.removeArbitrator(arbitrator3.address);

      const activeArbitrators = await governance.getActiveArbitrators();
      expect(activeArbitrators.length).to.equal(2);
      expect(activeArbitrators).to.not.include(arbitrator3.address);

      const info = await governance.arbitrators(arbitrator3.address);
      expect(info.isActive).to.be.false;
    });

    it("Should reject adding existing arbitrator", async function () {
      await expect(
        governance.addArbitrator(arbitrator1.address)
      ).to.be.revertedWith("Governance: already arbitrator");
    });
  });

  describe("Dispute Opening", function () {
    it("Should allow landlord to open dispute", async function () {
      const tx = await governance.connect(landlord).openDispute(
        RENTAL_CONTRACT_ID,
        landlord.address,
        tenant.address,
        DisputeType.PaymentDefault,
        "Tenant has not paid rent for 3 months",
        DISPUTE_AMOUNT
      );

      await expect(tx)
        .to.emit(governance, "DisputeOpened")
        .withArgs(1, RENTAL_CONTRACT_ID, landlord.address, DisputeType.PaymentDefault, DISPUTE_AMOUNT);

      const dispute = await governance.getDispute(1);
      expect(dispute.id).to.equal(1);
      expect(dispute.rentalContractId).to.equal(RENTAL_CONTRACT_ID);
      expect(dispute.initiator).to.equal(landlord.address);
      expect(dispute.landlord).to.equal(landlord.address);
      expect(dispute.tenant).to.equal(tenant.address);
      expect(dispute.disputeType).to.equal(DisputeType.PaymentDefault);
      expect(dispute.status).to.equal(DisputeStatus.Opened);
      expect(dispute.amountInDispute).to.equal(DISPUTE_AMOUNT);
    });

    it("Should allow tenant to open dispute", async function () {
      await governance.connect(tenant).openDispute(
        RENTAL_CONTRACT_ID,
        landlord.address,
        tenant.address,
        DisputeType.MaintenanceIssue,
        "Landlord not fixing broken AC",
        DISPUTE_AMOUNT
      );

      const dispute = await governance.getDispute(1);
      expect(dispute.initiator).to.equal(tenant.address);
    });

    it("Should reject dispute from non-party", async function () {
      await expect(
        governance.connect(owner).openDispute(
          RENTAL_CONTRACT_ID,
          landlord.address,
          tenant.address,
          DisputeType.PaymentDefault,
          "Some dispute",
          DISPUTE_AMOUNT
        )
      ).to.be.revertedWith("Governance: only contract parties can open dispute");
    });

    it("Should reject dispute without description", async function () {
      await expect(
        governance.connect(landlord).openDispute(
          RENTAL_CONTRACT_ID,
          landlord.address,
          tenant.address,
          DisputeType.PaymentDefault,
          "", // Empty description
          DISPUTE_AMOUNT
        )
      ).to.be.revertedWith("Governance: description required");
    });

    it("Should track disputes by rental contract", async function () {
      await governance.connect(landlord).openDispute(
        RENTAL_CONTRACT_ID, landlord.address, tenant.address,
        DisputeType.PaymentDefault, "First dispute", DISPUTE_AMOUNT
      );
      await governance.connect(tenant).openDispute(
        RENTAL_CONTRACT_ID, landlord.address, tenant.address,
        DisputeType.MaintenanceIssue, "Second dispute", DISPUTE_AMOUNT
      );

      const disputes = await governance.getRentalDisputes(RENTAL_CONTRACT_ID);
      expect(disputes.length).to.equal(2);
    });

    it("Should track disputes by user", async function () {
      await governance.connect(landlord).openDispute(
        RENTAL_CONTRACT_ID, landlord.address, tenant.address,
        DisputeType.PaymentDefault, "Dispute", DISPUTE_AMOUNT
      );

      const landlordDisputes = await governance.getUserDisputes(landlord.address);
      const tenantDisputes = await governance.getUserDisputes(tenant.address);

      expect(landlordDisputes.length).to.equal(1);
      expect(tenantDisputes.length).to.equal(1);
    });
  });

  describe("Evidence Submission", function () {
    beforeEach(async function () {
      await governance.connect(landlord).openDispute(
        RENTAL_CONTRACT_ID, landlord.address, tenant.address,
        DisputeType.PaymentDefault, "Non-payment", DISPUTE_AMOUNT
      );
    });

    it("Should allow parties to submit evidence", async function () {
      const tx = await governance.connect(landlord).submitEvidence(1, "QmEvidenceHash1");

      await expect(tx)
        .to.emit(governance, "EvidenceSubmitted")
        .withArgs(1, landlord.address, "QmEvidenceHash1");

      const evidence = await governance.getDisputeEvidence(1);
      expect(evidence.length).to.equal(1);
      expect(evidence[0]).to.equal("QmEvidenceHash1");
    });

    it("Should allow multiple evidence submissions", async function () {
      await governance.connect(landlord).submitEvidence(1, "QmEvidenceHash1");
      await governance.connect(tenant).submitEvidence(1, "QmEvidenceHash2");
      await governance.connect(landlord).submitEvidence(1, "QmEvidenceHash3");

      const evidence = await governance.getDisputeEvidence(1);
      expect(evidence.length).to.equal(3);
    });

    it("Should reject evidence from non-party", async function () {
      await expect(
        governance.connect(owner).submitEvidence(1, "QmHash")
      ).to.be.revertedWith("Governance: only parties can submit evidence");
    });
  });

  describe("Dispute Review Process", function () {
    beforeEach(async function () {
      await governance.connect(landlord).openDispute(
        RENTAL_CONTRACT_ID, landlord.address, tenant.address,
        DisputeType.PaymentDefault, "Non-payment", DISPUTE_AMOUNT
      );
    });

    it("Should allow operator to start review", async function () {
      const tx = await governance.connect(operator).startReview(1);

      await expect(tx)
        .to.emit(governance, "DisputeStatusChanged")
        .withArgs(1, DisputeStatus.Opened, DisputeStatus.UnderReview);

      const dispute = await governance.getDispute(1);
      expect(dispute.status).to.equal(DisputeStatus.UnderReview);
    });

    it("Should reject review from non-operator", async function () {
      await expect(
        governance.connect(landlord).startReview(1)
      ).to.be.reverted; // AccessControl error
    });

    it("Should allow operator to start voting", async function () {
      await governance.connect(operator).startReview(1);
      const tx = await governance.connect(operator).startVoting(1);

      await expect(tx)
        .to.emit(governance, "DisputeStatusChanged")
        .withArgs(1, DisputeStatus.UnderReview, DisputeStatus.Voting);

      const dispute = await governance.getDispute(1);
      expect(dispute.status).to.equal(DisputeStatus.Voting);
    });

    it("Should assign arbitrators when voting starts", async function () {
      await governance.connect(operator).startReview(1);
      await governance.connect(operator).startVoting(1);

      const arbitrators = await governance.getDisputeArbitrators(1);
      expect(arbitrators.length).to.equal(3);
    });
  });

  describe("Voting Process", function () {
    beforeEach(async function () {
      await governance.connect(landlord).openDispute(
        RENTAL_CONTRACT_ID, landlord.address, tenant.address,
        DisputeType.PaymentDefault, "Non-payment", DISPUTE_AMOUNT
      );
      await governance.connect(operator).startReview(1);
      await governance.connect(operator).startVoting(1);
    });

    it("Should allow designated arbitrators to vote", async function () {
      const tx = await governance.connect(arbitrator1).vote(1, true); // In favor of landlord

      await expect(tx)
        .to.emit(governance, "ArbitratorVoted")
        .withArgs(1, arbitrator1.address, true);
    });

    it("Should track votes correctly", async function () {
      await governance.connect(arbitrator1).vote(1, true);
      await governance.connect(arbitrator2).vote(1, true);

      const dispute = await governance.getDispute(1);
      expect(dispute.votesForLandlord).to.equal(2);
      expect(dispute.votesForTenant).to.equal(0);
    });

    it("Should prevent double voting", async function () {
      await governance.connect(arbitrator1).vote(1, true);

      await expect(
        governance.connect(arbitrator1).vote(1, false)
      ).to.be.revertedWith("Governance: already voted");
    });

    it("Should auto-resolve when all votes are in (landlord wins)", async function () {
      await governance.connect(arbitrator1).vote(1, true);
      await governance.connect(arbitrator2).vote(1, true);
      const tx = await governance.connect(arbitrator3).vote(1, false);

      await expect(tx).to.emit(governance, "DisputeResolved");

      const dispute = await governance.getDispute(1);
      expect(dispute.status).to.equal(DisputeStatus.Resolved);
      expect(dispute.resolution).to.equal(Resolution.InFavorOfLandlord);
      expect(dispute.amountToLandlord).to.equal(DISPUTE_AMOUNT);
      expect(dispute.amountToTenant).to.equal(0);
    });

    it("Should auto-resolve when all votes are in (tenant wins)", async function () {
      await governance.connect(arbitrator1).vote(1, false);
      await governance.connect(arbitrator2).vote(1, false);
      await governance.connect(arbitrator3).vote(1, true);

      const dispute = await governance.getDispute(1);
      expect(dispute.resolution).to.equal(Resolution.InFavorOfTenant);
      expect(dispute.amountToLandlord).to.equal(0);
      expect(dispute.amountToTenant).to.equal(DISPUTE_AMOUNT);
    });

    it("Should split in case of tie (even number of arbitrators)", async function () {
      // Remove one arbitrator to get even number
      await governance.removeArbitrator(arbitrator3.address);

      // Set min arbitrators to 2
      await governance.setMinArbitratorsForVoting(2);

      // Open new dispute
      await governance.connect(landlord).openDispute(
        99, landlord.address, tenant.address,
        DisputeType.PaymentDefault, "New dispute", DISPUTE_AMOUNT
      );
      await governance.connect(operator).startReview(2);
      await governance.connect(operator).startVoting(2);

      await governance.connect(arbitrator1).vote(2, true);
      await governance.connect(arbitrator2).vote(2, false);

      const dispute = await governance.getDispute(2);
      expect(dispute.resolution).to.equal(Resolution.PartialBoth);
      expect(dispute.amountToLandlord).to.equal(DISPUTE_AMOUNT / 2n);
      expect(dispute.amountToTenant).to.equal(DISPUTE_AMOUNT / 2n);
    });

    it("Should update arbitrator stats after voting", async function () {
      await governance.connect(arbitrator1).vote(1, true);
      await governance.connect(arbitrator2).vote(1, true);
      await governance.connect(arbitrator3).vote(1, false);

      const info = await governance.arbitrators(arbitrator1.address);
      expect(info.casesHandled).to.equal(1);
      expect(info.casesResolved).to.equal(1);
      expect(info.reputation).to.equal(110); // 100 + 10
    });
  });

  describe("Appeals", function () {
    beforeEach(async function () {
      await governance.connect(landlord).openDispute(
        RENTAL_CONTRACT_ID, landlord.address, tenant.address,
        DisputeType.PaymentDefault, "Non-payment", DISPUTE_AMOUNT
      );
      await governance.connect(operator).startReview(1);
      await governance.connect(operator).startVoting(1);

      // Resolve in favor of landlord
      await governance.connect(arbitrator1).vote(1, true);
      await governance.connect(arbitrator2).vote(1, true);
      await governance.connect(arbitrator3).vote(1, true);
    });

    it("Should allow losing party to appeal", async function () {
      const tx = await governance.connect(tenant).appeal(1);

      await expect(tx)
        .to.emit(governance, "DisputeAppealed")
        .withArgs(1, tenant.address);

      const dispute = await governance.getDispute(1);
      expect(dispute.status).to.equal(DisputeStatus.Appealed);
    });

    it("Should reset votes on appeal", async function () {
      await governance.connect(tenant).appeal(1);

      const dispute = await governance.getDispute(1);
      expect(dispute.votesForLandlord).to.equal(0);
      expect(dispute.votesForTenant).to.equal(0);
    });

    it("Should prevent second appeal", async function () {
      await governance.connect(tenant).appeal(1);

      await expect(
        governance.connect(tenant).appeal(1)
      ).to.be.revertedWith("Governance: not resolved");
    });
  });

  describe("Dispute Dismissal", function () {
    beforeEach(async function () {
      await governance.connect(landlord).openDispute(
        RENTAL_CONTRACT_ID, landlord.address, tenant.address,
        DisputeType.Other, "Frivolous dispute", DISPUTE_AMOUNT
      );
    });

    it("Should allow operator to dismiss dispute", async function () {
      const tx = await governance.connect(operator).dismissDispute(1);

      await expect(tx)
        .to.emit(governance, "DisputeResolved")
        .withArgs(1, Resolution.Dismissed, 0, 0);

      const dispute = await governance.getDispute(1);
      expect(dispute.status).to.equal(DisputeStatus.Closed);
      expect(dispute.resolution).to.equal(Resolution.Dismissed);
    });

    it("Should reject dismissal from non-operator", async function () {
      await expect(
        governance.connect(landlord).dismissDispute(1)
      ).to.be.reverted;
    });
  });

  describe("Dispute Closure", function () {
    beforeEach(async function () {
      await governance.connect(landlord).openDispute(
        RENTAL_CONTRACT_ID, landlord.address, tenant.address,
        DisputeType.PaymentDefault, "Non-payment", DISPUTE_AMOUNT
      );
      await governance.connect(operator).startReview(1);
      await governance.connect(operator).startVoting(1);
      await governance.connect(arbitrator1).vote(1, true);
      await governance.connect(arbitrator2).vote(1, true);
      await governance.connect(arbitrator3).vote(1, true);
    });

    it("Should allow closing after appeal deadline", async function () {
      // Fast forward time past appeal deadline
      await ethers.provider.send("evm_increaseTime", [4 * 24 * 60 * 60]); // 4 days
      await ethers.provider.send("evm_mine");

      const tx = await governance.connect(operator).closeDispute(1);

      await expect(tx)
        .to.emit(governance, "DisputeStatusChanged")
        .withArgs(1, DisputeStatus.Resolved, DisputeStatus.Closed);
    });

    it("Should reject closing before appeal deadline", async function () {
      await expect(
        governance.connect(operator).closeDispute(1)
      ).to.be.revertedWith("Governance: appeal period not over");
    });
  });

  describe("Configuration", function () {
    it("Should allow admin to change evidence deadline", async function () {
      await governance.setEvidenceDeadlineDays(14);
      expect(await governance.evidenceDeadlineDays()).to.equal(14);
    });

    it("Should allow admin to change appeal deadline", async function () {
      await governance.setAppealDeadlineDays(5);
      expect(await governance.appealDeadlineDays()).to.equal(5);
    });

    it("Should allow admin to change min arbitrators", async function () {
      await governance.setMinArbitratorsForVoting(5);
      expect(await governance.minArbitratorsForVoting()).to.equal(5);
    });

    it("Should allow admin to pause/unpause", async function () {
      await governance.pause();
      expect(await governance.paused()).to.be.true;

      await governance.unpause();
      expect(await governance.paused()).to.be.false;
    });

    it("Should reject operations when paused", async function () {
      await governance.pause();

      await expect(
        governance.connect(landlord).openDispute(
          RENTAL_CONTRACT_ID, landlord.address, tenant.address,
          DisputeType.PaymentDefault, "Dispute", DISPUTE_AMOUNT
        )
      ).to.be.revertedWithCustomError(governance, "EnforcedPause");
    });
  });

  describe("Statistics", function () {
    it("Should track total disputes", async function () {
      await governance.connect(landlord).openDispute(
        RENTAL_CONTRACT_ID, landlord.address, tenant.address,
        DisputeType.PaymentDefault, "Dispute 1", DISPUTE_AMOUNT
      );
      await governance.connect(landlord).openDispute(
        99, landlord.address, tenant.address,
        DisputeType.PropertyDamage, "Dispute 2", DISPUTE_AMOUNT
      );

      const stats = await governance.getStats();
      expect(stats._totalDisputes).to.equal(2);
      expect(stats._totalValueDisputed).to.equal(DISPUTE_AMOUNT * 2n);
    });

    it("Should track resolved disputes", async function () {
      await governance.connect(landlord).openDispute(
        RENTAL_CONTRACT_ID, landlord.address, tenant.address,
        DisputeType.PaymentDefault, "Dispute", DISPUTE_AMOUNT
      );
      await governance.connect(operator).startReview(1);
      await governance.connect(operator).startVoting(1);
      await governance.connect(arbitrator1).vote(1, true);
      await governance.connect(arbitrator2).vote(1, true);
      await governance.connect(arbitrator3).vote(1, true);

      const stats = await governance.getStats();
      expect(stats._totalResolved).to.equal(1);
    });
  });
});
