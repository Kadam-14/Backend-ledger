// Iss Controller ka sirf itna kaam hai ki user ki id kay sath ek naya Acconut create karna

const accountModel = require("../models/account.model");
const authMiddleware = require("../middleware/auth.middleware");

async function createAccountController(req,res){
    
    const user = req.user;

    const account = await accountModel.create({
        user: user._id
    })

    res.status(201).json({
        message: "Account Created Successfully"
    })

}

async function getUserAccountController(req,res){
    
    const accounts = await accountModel.find({ user: req.user._id });

    res.status(200).json({
        accounts
    })
}

async function getAccountBalanceController(req,res){

    const { accountId } = req.params;

    const account = await accountModel.findById(req.params.accountId)

    if(!account){
        return res.status(400).json({
            message: "Account Not Found"
        })
    }

    const balance = await account.getBalance();

    res.status(200).json({
        accountId: account._id,
        balance: balance
    })
}

module.exports = {
    createAccountController,
    getUserAccountController,
    getAccountBalanceController
}