const getBackendUrl = () => {
  // For Vite, we use import.meta.env instead of process.env
  const isDevelopment = import.meta.env.MODE === 'development';
  const defaultPort = isDevelopment ? 5000 : 80;
  const apiUrl = import.meta.env.VITE_API_URL || `http://localhost:${defaultPort}/api`;
  
  console.log('Using API URL:', apiUrl);
  
  return {
    url: apiUrl,
    config: {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include'
    }
  };
};

export const { url: BASE_URL, config: BASE_CONFIG } = getBackendUrl(); 