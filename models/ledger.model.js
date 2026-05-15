const { trusted } = require("mongoose")

const mongoose = require("mongoose")

const LedgerSchema = new mongoose.Schema({
    account:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"account",
        required: [true,"Ledger must be associated with a account"],
        index: true,
        immutable: true
    },
    amount: {
        type: Number,
        required: [true, "Ledger must be associated with a specific amount"],
        immutable: true
    },
    transaction:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"transaction",
        required: [true,"Ledger Must be assciated with a transaction"],
        index: true,
        immutable: true
    },
   type: {
    type: String,
    enum: ["CREDIT", "DEBIT"],
    required: [true, "Ledger type is required"],
    immutable: true
}
})

function preventLedgerModification() {
    throw new Error("Ledger entries are immutable cannot be Modified or Deleted");
}

LedgerSchema.pre('findOneAndUpdate', preventLedgerModification);
LedgerSchema.pre('updateOne',preventLedgerModification);
LedgerSchema.pre("deleteOne", preventLedgerModification);
LedgerSchema.pre("remove",preventLedgerModification);
LedgerSchema.pre("deleteMany",preventLedgerModification);
LedgerSchema.pre("updateMany",preventLedgerModification);
LedgerSchema.pre("findOneAndDelete",preventLedgerModification);
LedgerSchema.pre("findOneAndReplace",preventLedgerModification);


const ledgerModel = mongoose.model("ledger",LedgerSchema);
module.exports = ledgerModel;