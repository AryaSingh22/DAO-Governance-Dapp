# ResearchDAO Testing Guide

This guide provides comprehensive information about testing the ResearchDAO project, including setup, execution, and coverage analysis.

## Test Suite Overview

The ResearchDAO project includes comprehensive test suites for all smart contracts, ensuring robust functionality and security.

### Test Categories

1. **Unit Tests**: Individual contract function testing
2. **Integration Tests**: Cross-contract interaction validation
3. **Edge Case Tests**: Boundary condition and error handling
4. **Security Tests**: Access control and vulnerability validation
5. **Performance Tests**: Gas optimization and efficiency

## Test Structure

```
test/
├── ResearchRegistry.test.ts      # Tests for ResearchRegistry contract
├── ReputationManager.test.ts     # Tests for ReputationManager contract
├── GovernanceToken.test.ts       # Tests for GovernanceToken contract
├── GovernanceIntegration.test.ts # Integration tests for governance workflow
└── ...
```

## Running Tests

### Prerequisites

Ensure you have the development environment set up:

```bash
# Install dependencies
npm install

# Navigate to frontend directory and install dependencies
cd dao-frontend
npm install
cd ..
```

### Test Execution Commands

#### Run All Tests
```bash
npm run test
# or
npx hardhat test
```

#### Run Specific Test Files
```bash
# Run ResearchRegistry tests only
npm run test:research
# or
npx hardhat test test/ResearchRegistry.test.ts

# Run ReputationManager tests only
npm run test:reputation
# or
npx hardhat test test/ReputationManager.test.ts

# Run Governance tests
npx hardhat test test/GovernanceIntegration.test.ts

# Run Token tests
npx hardhat test test/GovernanceToken.test.ts
```

#### Run Tests in Watch Mode
```bash
npm run test:watch
```

#### Run Tests with Gas Reporting
```bash
npx hardhat test --gas
```

## Test Coverage Analysis

### Generate Coverage Report
```bash
npm run test:coverage
# or
npx hardhat coverage
```

### Coverage Requirements

The ResearchDAO project maintains the following coverage standards:
- **New Contracts**: 100% coverage
- **Modified Contracts**: 95%+ coverage
- **All Contracts**: 90%+ overall coverage

### Coverage Report Location
After running coverage analysis, reports are generated in:
- `coverage/` directory (HTML report)
- Terminal output (summary)

## ResearchRegistry Test Coverage

### Key Test Areas
1. **Paper Submission**
   - Valid paper submission with fee payment
   - Invalid submission scenarios
   - Fee transfer verification
   - Event emission validation

2. **Paper Management**
   - Paper approval workflow
   - Paper rejection with reasons
   - Unauthorized access prevention
   - Status tracking validation

3. **Fee Management**
   - Submission fee updates
   - Owner-only access control
   - Fee collection verification

4. **View Functions**
   - Paper retrieval by ID
   - User paper listings
   - Total paper count

### Test Functions Covered
- `submitPaper()`
- `approvePaper()`
- `rejectPaper()`
- `linkProposal()`
- `setSubmissionFee()`
- `getPaperById()`
- `getPapersByUser()`
- `getTotalPapers()`

## ReputationManager Test Coverage

### Key Test Areas
1. **Badge Management**
   - Badge tier creation
   - Default badge initialization
   - Owner-only access control
   - Badge details retrieval

2. **Reputation Points**
   - Point allocation for various activities
   - Unauthorized access prevention
   - Point tracking accuracy
   - Event emission validation

3. **Specialized Point Functions**
   - Submission points (+50)
   - Voting points (+10)
   - Review points (+25)

4. **Badge Awarding**
   - Automatic badge awarding
   - Point threshold validation
   - Duplicate badge prevention
   - User badge tracking

5. **View Functions**
   - User reputation data retrieval
   - User badge listings
   - Badge details access
   - Leaderboard functionality

### Test Functions Covered
- `createBadgeTier()`
- `addPoints()`
- `addSubmissionPoints()`
- `addVotingPoints()`
- `addReviewPoints()`
- `getUserReputation()`
- `getUserBadges()`
- `getBadgeDetails()`
- `getLeaderboard()`

## Integration Testing

### Governance Workflow
1. **Proposal Creation**
   - Standard proposal creation
   - Proposal with metadata
   - Research proposal with paper linking

2. **Voting Process**
   - Token delegation
   - Vote casting
   - Vote counting

3. **Proposal Execution**
   - Queueing proposals
   - Timelock execution
   - Emergency cancellation

### Research Workflow
1. **Paper Submission to Funding**
   - Paper submission with fee
   - Paper approval process
   - Proposal creation linking paper
   - Community voting
   - Research funding execution

2. **Reputation System Integration**
   - Points allocation for submissions
   - Points allocation for voting
   - Badge awarding based on points
   - Reputation dashboard updates

## Performance Testing

### Gas Optimization
- Monitor gas costs for all user-facing functions
- Optimize storage patterns
- Minimize external calls
- Use efficient data structures

### Benchmarking
- Transaction gas costs
- Contract deployment costs
- Function call efficiency
- Storage access patterns

## Security Testing

### Access Control Validation
- Owner-only function protection
- Unauthorized access attempts
- Role-based permission testing
- Emergency function validation

### Data Integrity Testing
- Paper metadata storage
- SHA256 hash verification
- IPFS CID handling
- Reputation data consistency

### Fund Security Testing
- Fee collection mechanisms
- Fund distribution controls
- Streaming payment validation
- Emergency pause functionality

## Troubleshooting Common Test Issues

### Test Failures
1. **Compilation Errors**
   ```bash
   npx hardhat clean
   npx hardhat compile
   npm run test
   ```

2. **Network Connection Issues**
   ```bash
   npx hardhat node
   # In another terminal
   npm run test
   ```

3. **Insufficient Gas**
   ```bash
   # Check hardhat.config.ts for gas settings
   # Increase gas limit if needed
   ```

4. **Account Balance Issues**
   ```bash
   # Ensure test accounts have sufficient funds
   # Check token minting in test fixtures
   ```

### Coverage Issues
1. **Low Coverage Warnings**
   - Add tests for missing edge cases
   - Test error conditions
   - Validate event emissions
   - Check modifier coverage

2. **Coverage Report Generation Failures**
   ```bash
   npm run test:coverage
   # If issues persist:
   npx hardhat coverage --temp temp_coverage
   ```

## Best Practices for Testing

### Writing New Tests
1. **Use Fixtures**: Reuse setup code with `loadFixture`
2. **Test Both Success and Failure**: Validate expected behavior and error handling
3. **Check Events**: Verify correct event emission
4. **Validate State Changes**: Ensure contract state updates correctly
5. **Test Edge Cases**: Boundary conditions and unusual inputs

### Test Structure
```typescript
describe("ContractName", function () {
  async function deployFixture() {
    // Setup code
    return { contract, accounts };
  }

  describe("FunctionName", function () {
    it("should behave correctly under condition X", async function () {
      const { contract, accounts } = await loadFixture(deployFixture);
      // Test implementation
    });
  });
});
```

### Continuous Integration
- Run all tests before committing
- Ensure coverage requirements are met
- Validate gas optimizations
- Check for security vulnerabilities

## Test Environment Configuration

### Hardhat Network Settings
```typescript
// hardhat.config.ts
networks: {
  hardhat: {
    gas: "auto",
    gasPrice: "auto",
    initialBaseFeePerGas: 1000000000,
    allowUnlimitedContractSize: false
  }
}
```

### Test Configuration
- Use Hardhat's built-in accounts for testing
- Configure sufficient initial balances
- Set appropriate block gas limits
- Enable forking for mainnet testing if needed

## Monitoring and Reporting

### Test Results
- Review test output for failures
- Check gas reports for optimization opportunities
- Validate coverage reports
- Monitor execution times

### Logging
- Enable verbose logging for debugging
- Use console.log in tests when necessary
- Capture transaction details for analysis
- Document intermittent failures

This testing guide ensures comprehensive validation of the ResearchDAO functionality, security, and performance. Following these guidelines will help maintain the high quality and reliability of the ResearchDAO platform.