// Function to get the backend URL
const getBackendUrl = () => {
  const defaultPort = 5000;
  const apiUrl = process.env.REACT_APP_API_URL || `http://localhost:${defaultPort}/api`;
  
  return {
    url: apiUrl,
    config: {
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Important for cookies
    }
  };
};

export const { url: BASE_URL, config: BASE_CONFIG } = getBackendUrl();