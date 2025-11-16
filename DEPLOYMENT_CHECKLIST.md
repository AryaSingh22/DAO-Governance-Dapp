# Sepolia Testnet Deployment Checklist

## Pre-Deployment Checks

### Environment Setup
- [ ] Ensure Node.js >= 16.0.0 is installed
- [ ] Verify Hardhat is properly installed
- [ ] Check that all dependencies are installed (`npm install`)
- [ ] Confirm `.env` file contains:
  - `SEPOLIA_RPC_URL`
  - `PRIVATE_KEY`
  - `ETHERSCAN_API_KEY`

### Code Verification
- [ ] All contracts compile without errors (`npx hardhat compile`)
- [ ] Contract sizes are within Ethereum limits (`npx hardhat size-contracts`)
- [ ] All tests pass (`npx hardhat test`)
- [ ] Code has been reviewed for security issues

### Configuration Review
- [ ] Hardhat configuration is correct (`hardhat.config.ts`)
- [ ] Network settings for Sepolia are properly configured
- [ ] Deployment parameters are set appropriately:
  - Voting delay
  - Voting period
  - Proposal threshold
  - Quorum percentage
  - Timelock delay

## Deployment Process

### 1. Start Deployment
- [ ] Run deployment script: `npx hardhat run scripts/deploy-dao.ts --network sepolia`
- [ ] Monitor deployment progress in console
- [ ] Note any errors or warnings

### 2. Contract Verification
- [ ] Verify GovernanceToken on Etherscan
- [ ] Verify TimelockController on Etherscan
- [ ] Verify ProposalMetadataManager on Etherscan
- [ ] Verify Guardian on Etherscan
- [ ] Verify VotingEngine on Etherscan
- [ ] Verify ProposalExecutor on Etherscan
- [ ] Verify ModularGovernor on Etherscan
- [ ] Verify Treasury on Etherscan
- [ ] Verify MembershipNFT on Etherscan
- [ ] Verify DAORegistry on Etherscan

### 3. Post-Deployment Setup
- [ ] Confirm all contract addresses are displayed correctly
- [ ] Verify role assignments in TimelockController
- [ ] Test basic governance functionality:
  - Token delegation
  - Proposal creation
  - Voting
  - Proposal execution
- [ ] Test emergency functions through Guardian contract
- [ ] Verify DAORegistry contains all contract addresses

### 4. Frontend Integration
- [ ] Update frontend configuration file with new contract addresses
- [ ] Test frontend connection to all contracts
- [ ] Verify proposal creation through frontend
- [ ] Test voting functionality through frontend
- [ ] Confirm treasury interactions work correctly

## Security Checks

### Access Control Verification
- [ ] Confirm only authorized addresses can perform administrative functions
- [ ] Verify timelock delays are properly enforced
- [ ] Test emergency cancellation through Guardian contract
- [ ] Confirm ownership transfers were completed correctly

### Functionality Testing
- [ ] Test all proposal types (Finance, Protocol, Community, Emergency, Research)
- [ ] Verify metadata is correctly stored and retrieved
- [ ] Test quadratic voting functionality
- [ ] Confirm delegation hierarchy works correctly
- [ ] Verify treasury can receive and send assets
- [ ] Test MembershipNFT minting and transfers

## Documentation Updates

### Contract Addresses
- [ ] Record all deployed contract addresses
- [ ] Update project documentation with new addresses
- [ ] Add addresses to deployment summary

### Deployment Summary
- [ ] Document any issues encountered during deployment
- [ ] Record gas costs for each contract deployment
- [ ] Note any deviations from expected behavior
- [ ] Update deployment instructions if needed

## Post-Deployment Monitoring

### Network Monitoring
- [ ] Monitor contract interactions on Sepolia
- [ ] Watch for any failed transactions
- [ ] Track gas usage for common operations
- [ ] Monitor for any unexpected behavior

### Community Testing
- [ ] Provide contract addresses to test users
- [ ] Collect feedback on functionality
- [ ] Address any issues discovered during testing
- [ ] Update documentation based on user feedback

## Rollback Plan

### In Case of Critical Issues
- [ ] Document steps to rollback deployment
- [ ] Prepare emergency contact list for team members
- [ ] Have backup deployment scripts ready
- [ ] Coordinate with frontend team for quick updates

## Success Criteria

### Deployment Success
- [ ] All contracts deployed without errors
- [ ] All contracts verified on Etherscan
- [ ] All role assignments completed correctly
- [ ] Basic governance functionality working
- [ ] Frontend successfully integrated with contracts

### Testing Success
- [ ] All core functionality tested and working
- [ ] No critical security vulnerabilities identified
- [ ] Performance within acceptable limits
- [ ] User experience meets expectations

## Completion Checklist

### Final Verification
- [ ] All contracts deployed and verified
- [ ] All functionality tested
- [ ] Documentation updated
- [ ] Team briefed on deployment
- [ ] Monitoring in place
- [ ] Rollback plan documented