const sessionCheck = (req, res, next) => {
  if (req.path === '/initiate-voting') {
    return next(); // Skip session check for initial voting route
  }

  if (!req.session.votingData) {
    return res.status(401).json({ message: 'No active voting session' });
  }

  // Check if session hasn't expired (30 min limit)
  const { initiated } = req.session.votingData;
  if (Date.now() - initiated > 30 * 60 * 1000) {
    req.session.destroy();
    return res.status(401).json({ message: 'Voting session has expired' });
  }

  next();
};

module.exports = sessionCheck; 