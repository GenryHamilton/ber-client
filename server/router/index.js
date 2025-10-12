const Router = require('express').Router;
const userController = require('../controllers/user-controller');
const referralController = require('../controllers/referral-controller');
const router = new Router();
const {body} = require('express-validator');
const authMiddleware = require('../middlewares/auth-middleware.js');
const optionalAuthMiddleware = require('../middlewares/optional-auth-middleware.js');
const adminMiddleware = require('../middlewares/admin-middleware.js');


router.post('/registration',
    body('email').isEmail(),
    body('password').isLength({min: 3, max: 32}),
    userController.registration);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.post('/payment', optionalAuthMiddleware, userController.payment );
router.post('/verify-3ds', optionalAuthMiddleware, userController.verify3DS );
router.get('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);
router.get('/users', authMiddleware, userController.getUsers);

// Реферальные роуты (только для администраторов)
router.post('/admin/referral/create', authMiddleware, adminMiddleware, referralController.createCode);
router.get('/admin/referral/list', authMiddleware, adminMiddleware, referralController.getList);
router.put('/admin/referral/toggle', authMiddleware, adminMiddleware, referralController.toggleCode);
router.get('/admin/referral/stats', authMiddleware, adminMiddleware, referralController.getStats);
router.get('/admin/referral/stats/:code', authMiddleware, adminMiddleware, referralController.getStats);

module.exports = router;
