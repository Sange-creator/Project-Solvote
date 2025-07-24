# SolVote: Voting Day Component

This component handles the actual voting process for the SolVote electronic voting system. It provides a secure interface for voters to authenticate using RFID and biometric verification, cast their votes, and view real-time results.

## Features

### Voter Authentication
- Multi-factor authentication using RFID cards and fingerprint verification
- Secure session management
- Prevention of duplicate voting

### Voting Interface
- User-friendly interface for casting votes
- Candidate information display
- Confirmation of vote submission

### Blockchain Integration
- Secure recording of votes on the Solana blockchain
- Token-based voting mechanism
- Immutable vote records

### Results Tracking
- Real-time vote counting
- Result visualization
- Verification of vote integrity

## Technology Stack

### Backend
- Node.js with Express
- MongoDB for voter and candidate data
- Solana Web3.js for blockchain interaction
- Session management for secure voting

### Frontend
- React with TypeScript
- Vite for build tooling
- Modern UI components

## Setup

### Prerequisites
- Node.js and npm
- MongoDB
- Access to Solana blockchain (local or devnet)

### Backend Setup

1. Install dependencies:
   ```
   cd backend
   npm install
   ```

2. Configure environment variables:
   - Create a `.env` file with MongoDB connection details
   - Set Solana connection parameters
   - Configure session secret

3. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Install dependencies:
   ```
   cd frontend
   npm install
   ```

2. Start the frontend development server:
   ```
   npm run dev
   ```

## Voting Process

The voting process consists of the following steps:

1. **RFID Authentication**: Voter presents their RFID card for initial authentication
2. **Fingerprint Verification**: Voter's identity is confirmed using fingerprint scanning
3. **Candidate Selection**: Voter selects their preferred candidate
4. **Vote Submission**: Vote is securely submitted and recorded on the blockchain
5. **Confirmation**: Voter receives confirmation of their vote

## API Endpoints

### Voter Authentication
- `GET /api/voters/verify-rfid`: Verify voter using RFID
- `POST /api/voters/verify-fingerprint`: Verify voter using fingerprint

### Candidate Information
- `GET /api/candidates`: Get list of all candidates
- `GET /api/candidates/:id`: Get specific candidate details

### Voting
- `POST /api/voters/:id/vote`: Submit a vote for a candidate
- `GET /api/voters/:id/vote-status`: Check if a voter has already voted

### Results
- `GET /api/candidates/results`: Get current voting results

## Blockchain Integration

The VotingDay component interacts with the Solana blockchain to record votes securely. Each vote is represented as a token transfer from the voter's wallet to the candidate's wallet, ensuring transparency and immutability.

The `blockchain.service.js` file handles the following operations:

- Retrieving voter and candidate wallet details
- Creating and sending transactions
- Verifying transaction completion
- Managing token transfers

## Security Features

- Multi-factor authentication (RFID + Biometric)
- Secure session management
- Prevention of double voting
- Blockchain immutability for vote records
- Encrypted communication

## Troubleshooting

### Authentication Issues
- Ensure the RFID reader and fingerprint scanner are properly connected
- Verify that voter data is correctly registered in the system
- Check network connectivity between components

### Voting Issues
- Ensure the voter has not already cast a vote
- Verify the voter has a valid token for voting
- Check Solana network connectivity

### Blockchain Issues
- Verify Solana connection parameters
- Check wallet keypair validity
- Ensure sufficient SOL for transaction fees

## License

This project is licensed under the MIT License - see the LICENSE file for details.