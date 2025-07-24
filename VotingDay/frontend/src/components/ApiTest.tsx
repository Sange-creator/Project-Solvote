import { useEffect, useState } from 'react';
import { BASE_URL, BASE_CONFIG } from '../api/config';

export function ApiTest() {
  const [status, setStatus] = useState<string>('Testing connection...');

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch(`${BASE_URL}/test`, {
          ...BASE_CONFIG,
          method: 'GET'
        });
        const data = await response.json();
        setStatus(`Connected! Server says: ${data.message}`);
      } catch (err) {
        setStatus(`Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h2>API Connection Status:</h2>
      <p>{status}</p>
    </div>
  );
} 