const hardCodedMasterAdminAuth = (req, res, next) => {
    const { email, password } = req.body; // Extract email and password from the request body
  
    // Hardcoded credentials for the Master Admin
    const masterAdminCredentials = {
      email: 'pranshu@dpmatka.com',
      password: 'Pranshu@123',
    };
  
    if (email !== masterAdminCredentials.email || password !== masterAdminCredentials.password) {
      return res.status(403).json({ message: 'Access denied. Only Master Admin can access this resource.' });
    }
  
    next(); // Proceed to the next middleware or route handler
  };
  
  export default hardCodedMasterAdminAuth;
  