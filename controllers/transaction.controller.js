const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");
const emailService = require("../services/email.service");
const mongoose = require("mongoose")


/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create transaction (PENDING)
 * 6. Create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction COMPLETED
 * 9. Commit MongoDB session
 * 10. Send email notification
 */

async function createTransaction(req, res) {

    // All these parameters are extremely important
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "fromAccount,toAccount,amount,idempotencyKey is required"
        })
    }
    // Checking whether the fromAccount and toAccount Actually Exists Or not

    const fromUserAccount = await accountModel.findOne({
       user: req.user._id
    })

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            message: "Invalid fromAccount or toAccount"
        })
    }

    // Validating idempotencyKey to check whether any other transaction is not using the
    // same idempotencyKey to prevent double payment from same transaction

    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })

    // If the transaction is engage with a idempotency key that means this transaction request
    // is Coming for the second time
    // Hence we are checking each and every condition why the request is coming for the second time 
    if (isTransactionAlreadyExists) {
        if (isTransactionAlreadyExists.status === "COMPLETE") {
            return res.status(200).json({
                message: "The Payment is already processed",
                transaction: isTransactionAlreadyExists
            })
        }
        if (isTransactionAlreadyExists.status === "PENDING") {
            return res.status(200).json({
                message: "The payment is still pending"
            })
        }
        if (isTransactionAlreadyExists.status === "FAILED") {
            return res.status(500).json({
                message: "The Previous Payment was Failed"
            })
        }
        if (isTransactionAlreadyExists.status === "REVERSE") {
            return res.status(500).json({
                message: "Transaction was reversed Please retry!! "
            })
        }

    }

    // Checking Account Status that whether both
    // toaccount and fromaccount both there status should be active

    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({
            message: "fromAccount and toAccount must be Active to process transaction"
        })
    }

    // Derive sender balance from ledger

    const balance = await fromUserAccount.getBalance()

    if (balance < amount) {
        return res.status(400).json({
            message: `Insufficient balance, Current Balance is ${balance}, Requested amount is ${amount}`
        })
    }

    // Creating Transaction
    let session
    let transaction
    try {
        session = await mongoose.startSession()
        session.startTransaction()

        transaction = new transactionModel({
             fromAccount,
            toAccount,
            amount,
            idempotencyKey
        })

    await transaction.save({ session })

        const debitLedgerEntry = await ledgerModel.create([{
            account: fromAccount,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session })

        const creditLedgerEntry = await ledgerModel.create([{
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session })

        transaction.status = "COMPLETE"

        await transaction.save({ session })

        await session.commitTransaction()
    }
    catch (error) {
        await session.abortTransaction()
    }
    finally {
        session.endSession()
    }
    // Sending Email notification

    await emailService.sendTransactionSuccessEmail(req.user.email, req.user.name, amount, toAccount, transaction._id)

    return res.status(201).json({
        message: "Transaction is Completed Successfully",
        transaction: transaction
    })
}

async function createInitialFundsTransaction(req, res) {

    const { toAccount, amount, idempotencyKey } = req.body

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(500).json({
            message: "Incomplte Parameters received"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount
    })

    if (!toUserAccount) {
        return res.status(400).json({
            message: "User Not Found"
        })
    }
    // Now in this case the from user account is of system user remember    
    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    })



    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System user account not found"
        })
    }

    const session = await mongoose.startSession()
    session.startTransaction()


    const transaction = await transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount: toUserAccount._id,
        amount,
        idempotencyKey,
        status: "PENDING"
    })

    await transaction.save({ session })

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount,
        transaction: transaction._id,
        type: "DEBIT"
    }], { session })

    const creditLedgerEntry = await ledgerModel.create([{
        account: toUserAccount._id,
        amount,
        transaction: transaction._id,
        type: "CREDIT"
    }], { session })

    

    transaction.status = "COMPLETE"

    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    return res.status(200).json({
        message: "Transaction Completed Successfully",
        transaction: transaction
    })
}

module.exports = {
    createTransaction,
    createInitialFundsTransaction
}
































