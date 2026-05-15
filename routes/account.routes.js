const express = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const acccountController = require("../controllers/account.controller")

const router = express.Router()


router.post("/",authMiddleware.authMiddleware,acccountController.createAccountController)

// Get /api/accounts/
// Getting all the accounts of the logged-in user
// protected router

router.get("/",authMiddleware.authMiddleware,acccountController.getUserAccountController)


// Get Balance
 
router.get("/balance/:accountId",authMiddleware.authMiddleware,acccountController.getAccountBalanceController)

module.exports = router