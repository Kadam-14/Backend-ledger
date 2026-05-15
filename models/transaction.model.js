const mongoose = require("mongoose")
const account = require("./account.model")

const transactionSchema = new mongoose.Schema({

    fromAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true,"Transaction must be associated with a from account"],
        index: true
    },
    toAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true,"Transaction must be associated with a to account"],
        index: true
    },
    status:{
        type: String,
        enum:{
            values: ["PENDING","COMPLETE","FAILED","REVERSE"],
            message: "Status can be either PENDING, COMPLETE, FAILED, REVERSED"
        },
        default: "PENDING"
    },
    amount: {
        type: Number,
        required: [true,"Amount is Required for creating a transaction"],
        min: [0,"Transaction amount cannot be negative"]
    },
    // idempotencyKey obstruct's the same payment to occur two times and it is always generated on the client side it should always be unique
    idempotencyKey:{
        type: String,
        required: [true,"idempotency key is required for ceating a transaction"],
        index: true,
        unique: true
    }
},
    {
        timestamps: true
})

const transactionModel = mongoose.model("transaction",transactionSchema)

module.exports = transactionModel