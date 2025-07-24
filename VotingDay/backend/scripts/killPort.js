const { exec } = require('child_process');

const killPort = (port) => {
  const isWin = process.platform === "win32";
  
  const command = isWin
    ? `netstat -ano | findstr :${port}`
    : `lsof -i :${port} -t`;

  exec(command, (error, stdout, stderr) => {
    if (stdout) {
      const pid = isWin 
        ? stdout.split('\n')[0].split(' ').filter(Boolean).pop()
        : stdout.trim();
        
      if (pid) {
        exec(isWin ? `taskkill /F /PID ${pid}` : `kill -9 ${pid}`);
        console.log(`Killed process ${pid} using port ${port}`);
      }
    }
  });
};

// Kill processes on common ports we might use
[5000, 5001, 5002].forEach(killPort); 