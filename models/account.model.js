const mongoose = require('mongoose')
const ledgerModel = require("./ledger.model")


const accountSchema = new mongoose.Schema({
    // Making a user field because we should always know this account belongs to which user
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [ true, "Acconut must be Associated with a User"],
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ["ACTIVE","FROZEN","CLOSED"],
            message: "Status can be either ACTIVE ,FROZEN, or CLOSED"
        },
            default: "ACTIVE"
        
    },
    currency:{
        type: String,
        required: [true, "currency is required to create a account"],
        default: "INR"
    },
    
},
    {
        timestamps: true
    })

accountSchema.index({ user : 1 , status : 1})

accountSchema.methods.getBalance = async function(){
    const balanceData = await ledgerModel.aggregate([
        {$match: {account: this._id}},
        {
            $group:{
                _id: null,
                totalDebit:{
                    $sum:{
                        $cond:[
                            { $eq: ["$type","DEBIT"] },
                            "$amount",
                            0
                        ]
                    }
                },
                totalCredit:{
                    $sum:{
                        $cond:[
                            { $eq: ["$type","CREDIT"] },
                            "$amount",
                            0
                        ]
                    }
                },
            }
        },
        {
            $project:{
                _id: 0,
                balance: { $subtract: [ "$totalCredit","$totalDebit"]}
            }
        }
    ])

    if(balanceData.length === 0){
        return 0
    }
    return balanceData[ 0 ].balance
}
  

const accountModel = mongoose.model("account",accountSchema)

module.exports = accountModel