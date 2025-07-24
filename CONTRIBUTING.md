# Contributing to SolVote

Thank you for your interest in contributing to SolVote! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with the following information:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, etc.)

### Suggesting Enhancements

For feature requests or enhancements, create an issue with:

- A clear, descriptive title
- Detailed description of the proposed feature
- Any relevant examples or mockups
- Explanation of why this feature would be useful

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Run tests if available
5. Commit your changes (`git commit -m 'Add some feature'`)
6. Push to the branch (`git push origin feature/your-feature-name`)
7. Open a Pull Request

#### Pull Request Guidelines

- Follow the existing code style
- Include tests for new features
- Update documentation as needed
- Keep pull requests focused on a single topic
- Reference any relevant issues

## Development Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB
- Solana CLI tools
- Raspberry Pi with fingerprint scanner and RFID reader (for hardware testing)

### Setting Up the Development Environment

1. Clone the repository
   ```
   git clone https://github.com/yourusername/solvote.git
   cd solvote
   ```

2. Install dependencies for each component
   ```
   # Registration Day
   cd "Registration Day"/backend
   npm install
   cd ../frontend
   npm install

   # Token Minting
   cd ../../TokenMinting/backend
   npm install
   cd ../frontend
   npm install

   # Voting Day
   cd ../../VotingDay/backend
   npm install
   cd ../frontend
   npm install
   ```

3. Configure environment variables for each component

4. Start the development servers

## Project Structure

The project is divided into three main components:

- **Registration Day**: Handles voter and candidate registration
- **Token Minting**: Manages token creation and distribution
- **Voting Day**: Facilitates the voting process

Each component has its own backend and frontend directories.

## Coding Standards

### JavaScript/TypeScript

- Use ES6+ features
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic

### React

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript for type safety

### Backend

- Follow RESTful API design principles
- Implement proper error handling
- Write clear documentation for API endpoints

## Testing

- Write unit tests for new features
- Ensure existing tests pass before submitting a pull request
- Include integration tests where appropriate

## Documentation

- Update README files as needed
- Document new features and API endpoints
- Include comments in code for complex logic

## License

By contributing to SolVote, you agree that your contributions will be licensed under the project's MIT License.