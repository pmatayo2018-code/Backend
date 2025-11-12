import express from 'express';
import User from './models/usermodel.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config()

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;
const PORT = process.env.PORT || 3000;
const app = express();

// middleware 
app.use(express.json())
app.use(cors())
// NOTE BELOW
app.use('/', router)



// connecting to the database   
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });



// Register

router.post('/signup', async (req, res) => {
    const { userName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ userName, email, password: hashedPassword });
    await newUser.save();
    res.json({ message: 'User registered successfully' });

});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
        return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
        return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });

});



// protected route
router.get('/profile', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(403).json({ message: 'No token' });

    const token = authHeader.split(' ')[1];

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err)
            return res.status(401).json({ message: 'Invalid token' });

        res.json({ message: 'Access granted', user });

    });



});





app.listen(PORT, () => {
    console.log(`Server is runnign on http://localhost:${PORT}`)
})

export default router;

