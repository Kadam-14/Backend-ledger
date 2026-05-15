const { Router } = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const transactionController = require("../controllers/transaction.controller")

const transactionRoutes = Router();
// POST api/transaction/
// Create a new transaction

transactionRoutes.post("/",authMiddleware.authMiddleware,transactionController.createTransaction);

// POST /api/transaction/system/initialFunds
// This api creates initial funds transaction from sysytem user

transactionRoutes.post("/system/initial-funds",authMiddleware.authSystemUserMiddleware,transactionController.createInitialFundsTransaction)

module.exports = transactionRoutes;