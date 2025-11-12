import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    userName: { type: String, required: [true, "username is required"] },
    email: { type: String, required: [true, "email is required"], unique: true },
    password: { type: String, required: [true, "password is required"] }
},
    { timestamp: true }
)


const User = mongoose.model('User', userSchema);

export default User


