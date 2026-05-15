const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const tokenBlacklistModel = require("../models/blackList.model")


async function authMiddleware(req, res, next) {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                message: "No token found"
            });
        }

        const isBlacklisted = await tokenBlacklistModel.findOne({
        token
        })

        if(isBlacklisted){
            return res.status(401).json({
            message: "Unauthorized acces, token is missing"
                 })
            }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        req.user = user;

        next();

    } catch (err) {
        console.log("JWT ERROR:", err.message);
        return res.status(401).json({
            message: "Invalid token"
        });
    }
}

async function authSystemUserMiddleware(req, res, next) {
    
    const token = req.cookies.token || req.headers.authorization?.split(" ")[ 1 ]

    if(!token){
        return res.status(401).json({
            message: "Unauthorized access Token Not Found"
        })
    }

    const isBlacklisted = await tokenBlacklistModel.findOne({
        token
    })

    if(isBlacklisted){
        return res.status(401).json({
            message: "Unauthorized acces, token is missing"
        })
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await userModel.findById(decoded.userId).select("+systemUser")

        if(!user.systemUser){
            return res.status(403).json({
                message: "Forbidden access, not a system user"
            })
        }

        req.user = user

        return next()
    }
    catch(err){
        return res.status(401).json({
            message: "Invalid or expired token"
        })
    }

}

module.exports = { 
    authMiddleware,
    authSystemUserMiddleware
};