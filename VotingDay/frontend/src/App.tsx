import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, Fingerprint, CreditCard, Vote } from 'lucide-react';
import { BASE_URL, BASE_CONFIG } from './api/config';
import { ApiTest } from './components/ApiTest';

// Types for verification
type RFIDData = {
  tag: string;
  objectId: string;
};

type FingerprintData = {
  template: string;
  hash: string;
};

type Candidate = {
  _id: string;
  fullName: string;
  party: string;
  position: string;
  votes: number;
  registrationStatus: string;
};

type Step = 'rfid' | 'fingerprint' | 'voting' | 'success';

// Dummy verification data (simulating database records)
const DUMMY_RFID: RFIDData = {
  tag: "04A5B9C2",
  objectId: "67b213d36d44b39bf19b464b" // Using the actual voter ID you provided
};

const DUMMY_FINGERPRINT: FingerprintData = {
  template: "AQEBAQECAgMDBAQFBQYGBwcICAgJCQoKCwsMDA0NDQ4ODw8QEBESERER",
  hash: "e7d81c95a647e3af3ecf36c7d2b5ba5f3"
};

// Utility functions for verification (to be replaced with real implementation)
const verifyRFID = async (scannedTag: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(scannedTag === DUMMY_RFID.tag);
    }, 1500);
  });
};

const verifyFingerprint = async (
  scannedTemplate: string,
  storedTemplate: string,
  storedHash: string
): Promise<{ isMatch: boolean }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ isMatch: true });
    }, 1500);
  });
};

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('rfid');
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [voterId, setVoterId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      if (currentStep === 'voting') {
        setIsLoadingCandidates(true);
        setError(null);
        
        try {
          const url = `${BASE_URL}/candidates`;
          console.log('Fetching candidates from:', url);
          
          const response = await fetch(url, {
            ...BASE_CONFIG,
            method: 'GET'
          });

          if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
          }

          const data = await response.json();
          console.log('Response data:', data);

          if (data.success) {
            setCandidates(data.data);
          } else {
            throw new Error(data.message || 'Failed to fetch candidates');
          }
        } catch (err) {
          console.error('Error fetching candidates:', err);
          setError(err instanceof Error ? err.message : 'Error connecting to server');
        } finally {
          setIsLoadingCandidates(false);
          setIsLoading(false);
        }
      }
    };

    fetchCandidates();
  }, [currentStep]);

  const handleRFIDScan = async () => {
    setIsVerifying(true);
    setError(null);
    
    try {
      const scannedTag = DUMMY_RFID.tag;
      const isValid = await verifyRFID(scannedTag);
      
      if (isValid) {
        setVoterId(DUMMY_RFID.objectId);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setIsVerifying(false);
          setCurrentStep('fingerprint');
        }, 1500);
      } else {
        setError('Invalid RFID card. Please try again.');
        setIsVerifying(false);
      }
    } catch (err) {
      setError('Error reading RFID card. Please try again.');
      setIsVerifying(false);
    }
  };

  const handleFingerprintScan = async () => {
    setIsVerifying(true);
    setError(null);
    
    try {
      // Using dummy fingerprint hash for matching
      const dummyScannedHash = "e7d81c95a647e3af3ecf36c7d2b5ba5f3"; 
      
      // Verify fingerprint using dummy data
      const { isMatch } = await verifyFingerprint(
        DUMMY_FINGERPRINT.template,
        DUMMY_FINGERPRINT.template,
        dummyScannedHash
      );

      if (isMatch) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setIsVerifying(false);
          setCurrentStep('voting');
        }, 1500);
      } else {
        throw new Error('Fingerprint verification failed');
      }
    } catch (err) {
      setError('Error verifying fingerprint. Please try again.');
      console.error('Fingerprint verification error:', err);
      setIsVerifying(false);
    }
  };

  const handleVote = async () => {
    if (!selectedCandidate || !voterId) {
      setError('Please select a candidate first.');
      return;
    }

    setIsVerifying(true);
    setError(null);
    
    try {
      const candidate = candidates.find(c => c._id === selectedCandidate);
      if (!candidate) {
        throw new Error('Selected candidate not found');
      }

      // Submit vote through backend
      const response = await fetch('http://localhost:3000/api/voters/cast-vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          voterId,
          candidateId: selectedCandidate
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setIsVerifying(false);
          setCurrentStep('success');
          // Reset after showing success
          setTimeout(() => {
            setCurrentStep('rfid');
            setSelectedCandidate(null);
            setVoterId(null);
          }, 3000);
        }, 1500);
      } else {
        throw new Error(data.message || 'Vote submission failed');
      }
    } catch (err) {
      setError('Error recording vote. Please try again.');
      console.error('Vote error:', err);
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ApiTest />
      {/* Header */}
      <header className="bg-blue-600 text-white py-4 px-6 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Vote className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Secure Voting System</h1>
          </div>
          <div className="text-sm">Election Day 2025</div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="max-w-md mx-auto mb-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Authentication Steps */}
        {currentStep === 'rfid' && (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <CreditCard className="h-16 w-16 mx-auto mb-4 text-blue-600" />
            <h2 className="text-2xl font-bold mb-4">Place Your RFID Card</h2>
            <p className="text-gray-600 mb-6">Please place your RFID card on the reader to begin</p>
            {showSuccess ? (
              <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                <Check className="h-5 w-5" />
                <span>RFID verified successfully!</span>
              </div>
            ) : (
              <button
                onClick={handleRFIDScan}
                disabled={isVerifying}
                className={`bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors ${
                  isVerifying ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isVerifying ? 'Verifying...' : 'Scan RFID'}
              </button>
            )}
          </div>
        )}

        {currentStep === 'fingerprint' && (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <Fingerprint className="h-16 w-16 mx-auto mb-4 text-blue-600" />
            <h2 className="text-2xl font-bold mb-4">Fingerprint Verification</h2>
            <p className="text-gray-600 mb-6">Please place your finger on the scanner</p>
            {showSuccess ? (
              <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                <Check className="h-5 w-5" />
                <span>Fingerprint verified successfully!</span>
              </div>
            ) : (
              <button
                onClick={handleFingerprintScan}
                disabled={isVerifying}
                className={`bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors ${
                  isVerifying ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isVerifying ? 'Verifying...' : 'Scan Fingerprint'}
              </button>
            )}
          </div>
        )}

        {currentStep === 'voting' && (
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Select Your Candidate</h2>
            {isLoadingCandidates ? (
              <div className="text-center py-8">Loading candidates...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {candidates.map((candidate) => (
                  <div
                    key={candidate._id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedCandidate === candidate._id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => !isVerifying && setSelectedCandidate(candidate._id)}
                  >
                    <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-4xl">👤</span>
                    </div>
                    <h3 className="font-bold text-lg mb-1">{candidate.fullName}</h3>
                    <p className="text-gray-600">{candidate.party}</p>
                    <p className="text-sm text-gray-500">{candidate.position}</p>
                    {selectedCandidate === candidate._id && (
                      <div className="mt-2 text-blue-600 flex items-center gap-1">
                        <Check className="h-4 w-4" /> Selected
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-8 text-center">
              {showSuccess ? (
                <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                  <Check className="h-5 w-5" />
                  <span>Vote recorded successfully!</span>
                </div>
              ) : (
                <button
                  onClick={handleVote}
                  disabled={!selectedCandidate || isVerifying}
                  className={`px-8 py-3 rounded-lg text-white font-medium ${
                    selectedCandidate && !isVerifying
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isVerifying ? 'Recording Vote...' : 'Cast Vote'}
                </button>
              )}
            </div>
          </div>
        )}

        {currentStep === 'success' && (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-green-600">Vote Cast Successfully!</h2>
            <p className="text-gray-600">Thank you for participating in the election.</p>
          </div>
        )}

        {/* Status Indicator */}
        <div className="max-w-md mx-auto mt-8">
          <div className="flex justify-between items-center">
            {(['rfid', 'fingerprint', 'voting', 'success'] as Step[]).map((step, index) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep === step
                        ? 'bg-blue-600 text-white'
                        : ['success', 'voting', 'fingerprint'].includes(currentStep) &&
                          index < ['rfid', 'fingerprint', 'voting', 'success'].indexOf(currentStep)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-xs mt-1 text-gray-600">{step}</span>
                </div>
                {index < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      ['success', 'voting', 'fingerprint'].includes(currentStep) &&
                      index < ['rfid', 'fingerprint', 'voting', 'success'].indexOf(currentStep)
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;