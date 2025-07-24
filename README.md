# SolVote: Blockchain-Based Electronic Voting System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

SolVote is a comprehensive blockchain-based electronic voting system built on the Solana blockchain. It provides a secure, transparent, and efficient way to conduct elections with biometric verification, RFID authentication, and blockchain immutability.

## Project Overview

SolVote consists of three main components that handle different stages of the voting process:

1. **Registration Day**: Handles voter and candidate registration with biometric authentication
2. **Token Minting**: Manages the creation and distribution of voting tokens on the Solana blockchain
3. **Voting Day**: Facilitates the actual voting process with secure authentication and real-time results

## Features

### Registration Day
- Voter and candidate registration with personal information collection
- Biometric authentication using fingerprint scanning
- RFID card issuance and management
- Secure wallet creation for blockchain interaction
- Admin dashboard for managing registrations

### Token Minting
- Creation of custom voting tokens on Solana blockchain
- Token metadata management
- Secure token distribution to registered voters
- Supply management for election integrity

### Voting Day
- Multi-factor authentication (RFID + Fingerprint)
- Secure and private voting interface
- Real-time vote counting and results
- Blockchain verification of votes

## Technology Stack

### Backend
- Node.js with Express
- MongoDB for database
- Solana Web3.js for blockchain interaction
- Raspberry Pi integration for biometric hardware

### Frontend
- React with TypeScript
- Vite for build tooling
- TailwindCSS for styling

### Hardware
- Raspberry Pi (3 or 4)
- Fingerprint scanner module
- MFRC522 RFID reader/writer module

## Setup and Installation

### Prerequisites
- Node.js and npm
- MongoDB
- Solana CLI tools
- Raspberry Pi with fingerprint scanner and RFID reader (for hardware integration)

### Registration Day Setup

1. Navigate to the Registration Day directory:
   ```
   cd "Registration Day"
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update with your MongoDB connection string and other settings

4. Start the backend server:
   ```
   npm run dev
   ```

5. Install frontend dependencies:
   ```
   cd ../frontend
   npm install
   ```

6. Start the frontend development server:
   ```
   npm run dev
   ```

### Token Minting Setup

1. Navigate to the TokenMinting directory:
   ```
   cd ../TokenMinting
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Configure environment variables for Solana connection

4. Initialize the local Solana validator (for development):
   ```
   npm run init:localnet
   ```

5. Deploy the token programs:
   ```
   npm run deploy:programs
   ```

6. Start the backend server:
   ```
   npm run dev
   ```

7. Install frontend dependencies:
   ```
   cd ../frontend
   npm install
   ```

8. Start the frontend development server:
   ```
   npm start
   ```

### Voting Day Setup

1. Navigate to the VotingDay directory:
   ```
   cd ../VotingDay
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Configure environment variables

4. Start the backend server:
   ```
   npm run dev
   ```

5. Install frontend dependencies:
   ```
   cd ../frontend
   npm install
   ```

6. Start the frontend development server:
   ```
   npm run dev
   ```

## Hardware Setup

### Raspberry Pi Configuration

1. Install required Python packages on the Raspberry Pi:
   ```
   pip install flask flask-cors pyfingerprint RPi.GPIO mfrc522 requests
   ```

2. Copy the hardware interface script to your Raspberry Pi

3. Make it executable:
   ```
   chmod +x hardware_interface.py
   ```

4. Run the script:
   ```
   ./hardware_interface.py
   ```

## Usage

### Registration Process

1. Admin logs in to the Registration Day system
2. Register voters with personal information
3. Capture fingerprint data for biometric verification
4. Issue RFID cards to voters
5. Create blockchain wallets for voters

### Token Minting Process

1. Create a new token mint on the Solana blockchain
2. Add metadata to the token
3. Mint the required supply of tokens
4. Distribute tokens to registered voters

### Voting Process

1. Voter authenticates using RFID card
2. Verify identity with fingerprint scan
3. Cast vote for preferred candidate
4. Vote is recorded on the blockchain
5. Real-time results are updated

## Security Features

- Multi-factor authentication (RFID + Biometric)
- Blockchain immutability for vote records
- Secure wallet management
- Encrypted data storage
- Hardware-based security with Raspberry Pi

## Project Structure

```
├── Registration Day/
│   ├── backend/         # Express server for registration
│   │   ├── src/         # Backend source code
│   │   └── hardware/    # Hardware integration scripts
│   └── frontend/        # React frontend for registration
│       └── src/         # Frontend source code
├── TokenMinting/
│   ├── backend/         # Token creation and management server
│   │   └── src/         # Backend source code
│   └── frontend/        # Token management interface
│       └── src/         # Frontend source code
└── VotingDay/
    ├── backend/         # Voting process server
    │   └── src/         # Backend source code
    └── frontend/        # Voting interface
        └── src/         # Frontend source code
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Solana blockchain for providing the infrastructure
- Metaplex for NFT and token standards
- The open-source community for various libraries and tools used in this project