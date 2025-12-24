import mongoose, {Schema} from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    fullName: {
        type: String,
        required: true
    },
    phone:{
        type: String,
        unique: true,
    },
    email: {
        type: String,
        unique: true,
    },
    password:{
        type: String,
        required: true
    },
    passwordChangedAt:{
        type: Date
    },
    passwordResetToken:{
        type: String
    },
    passwordResetExpires:{
        type: Date
    },
    passwordResetVerified:{
        type: Boolean,
        default: false
    },
    role:{
        type: String,
        enum: ["customer", "admin"],
        default: "customer"
    },
    refreshToken:{
        type: String
    },
    active:{
        type: Boolean,
        default: true
    },
    addresses: [
        {
            type: String
        }
    ],
    wishlist: [
        {
            type: Schema.Types.ObjectId,
            ref: "Product"
        }
    ]

},{timestamps: true})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function(candidatePassword){
    return await bcrypt.compare(candidatePassword, this.password);
}
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {userId: this._id, role: this.role},
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    );
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {userId: this._id, role: this.role},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    );
}

export const User = mongoose.model("User", userSchema)