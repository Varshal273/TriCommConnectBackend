const jwt = require("jsonwebtoken");

const JWT_SECRET = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5NDI3NTgwODQ1IiwiaWF0IjoxNzQyOTg5NzM1LCJleHAiOjE3NDI5OTMzMzV9.tLVXZbcKUtjynUsZQV0BVBNNJrFY-6590RAJWGt9Wk8"; // Use a strong secret in production

// 📌 **Middleware to authenticate user requests**
const authenticateUser = (req, res, next) => {
    try {
        console.log('hello in auth')
        const token = req.header("Authorization");

        if (!token) {
            return res.status(401).json({ message: "Access Denied. No token provided." });
        }

        // Verify and decode JWT
        const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
        req.user = decoded; // Attach user data to request

        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token", error });
    }
};

module.exports = authenticateUser;
