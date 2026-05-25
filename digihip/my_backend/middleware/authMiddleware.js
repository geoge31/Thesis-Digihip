import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Παίρνουμε το token από το Authorization header

    if (!token) {
        return res.status(403).json({ success: false, message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid token' });
        }

        req.user = user; // Αποθηκεύουμε τις πληροφορίες του χρήστη στο request
        next(); // Συνεχίζουμε στο επόμενο middleware ή handler
    });
};

export default authenticateToken;
