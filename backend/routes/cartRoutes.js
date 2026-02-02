const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
// CHECK THESE NAMES: They must match the controller exactly
const { getAllCarts, getUserCart, addToCart, removeFromCart, clearCart } = require('../controllers/cartController');

// If line 11 was crashing, ensure the function name here matches the import above
router.get('/all', verifyToken, isAdmin, getAllCarts); // For Admin
router.get('/', verifyToken, getUserCart);            // For User

router.post('/add', verifyToken, addToCart);
router.post('/remove', verifyToken, removeFromCart);
router.delete("/clear", verifyToken, clearCart);

module.exports = router;