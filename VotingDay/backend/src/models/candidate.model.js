const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  nationalId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true,
    validate: {
      validator: function (dob) {
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        return age >= 18;
      },
      message: function (props) {
        const today = new Date();
        let age = today.getFullYear() - props.value.getFullYear();
        const monthDiff = today.getMonth() - props.value.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < props.value.getDate())) {
          age--;
        }
        return `Candidate must be at least 18 years old. Current age: ${age}`;
      }
    }
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function (email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: "Invalid email format"
    }
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (phone) {
        return /^\+?[\d\s-]{10,}$/.test(phone);
      },
      message: "Invalid phone number format"
    }
  },
  party: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  fingerprintData: {
    hash: {
      type: Buffer,
      required: function () {
        return this.registrationStatus === "biometric" || this.registrationStatus === "completed";
      }
    },
    template: {
      type: Buffer,
      required: function () {
        return this.registrationStatus === "biometric" || this.registrationStatus === "completed";
      }
    }
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
  timestamp: {
      type: Date,
      default: Date.now
    },
  votes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'candidates'
});

candidateSchema.index({ fullName: 1 });

const Candidate = mongoose.model('Candidate', candidateSchema);

module.exports = Candidate; 