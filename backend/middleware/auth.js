const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;


module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ msg: 'No token, authorization denied' });

  const token = authHeader.split(' ')[1]; // ✅ Extract the actual token part
  if (!token) return res.status(401).json({ msg: 'Token format invalid' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.userId; // Or decoded if you stored more info
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
