const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema({
  rfidTag: {
    type: String,
    required: true,
    unique: true,
  },
  fingerprintHash: {
    type: String,
    required: true,
  },
  walletDetails: {
    publicKey: {
      type: String,
      unique: true,
      sparse: true,
      validate: {
        validator: function (key) {
          return (
            typeof key === "string" &&
            key.length >= 32 &&
            /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(key)
          );
        },
        message: "Invalid Solana public key format",
      },
    },
    encryptedPrivateKey: {
      type: String,
      required: function () {
        return !!this.walletDetails?.publicKey;
      },
    },
    iv: {
      type: String,
      required: function () {
        return !!this.walletDetails?.publicKey;
      },
    },
    encryptionKey: {
      type: String,
      required: function () {
        return !!this.walletDetails?.publicKey;
      },
    },
    encryptionMethod: {
      type: String,
      enum: ["NACL_SECRETBOX", "AES-256-GCM"],
      default: "NACL_SECRETBOX",
    },
  },
  hasVoted: {
    type: Boolean,
    default: false,
  },
  votedAt: {
    type: Date,
  },
  votedFor: {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate'
    },
    candidateName: String,
    party: String,
    position: String,
    timestamp: Date
  }
}, {
  timestamps: true,
});

const Voter = mongoose.model('Voter', voterSchema);

module.exports = Voter;
