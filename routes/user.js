const express = require('express');
const router = express.Router();
const { signup, login, logout, 
forgotPassword, resetPassword, 
getLoggedInUserDetails, passwordUpdate,
updateUser, 
adminAllUser, managerUsers, admingetOneUser, adminUpdateUser,admingetDeleteUser} = require('../controllers/userController');
const { isLoggedIn ,customRole } = require("../middleware/user");

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/forgotPassword').post(forgotPassword);
router.route('/password/reset/:token').post(resetPassword);
router.route('/dashboard').get(isLoggedIn, getLoggedInUserDetails);
router.route('/password/update').post(isLoggedIn, passwordUpdate);
router.route('/dashboard/update').post(isLoggedIn, updateUser);


//Manager routes
router.route("/manager/users").get(isLoggedIn, customRole('manager'),managerUsers)
//Admin routes
router.route("/admin/users").get(isLoggedIn, customRole('admin'),adminAllUser);
router.route("/admin/user/:id")
    .get(isLoggedIn, customRole('admin'),admingetOneUser)
    .put(isLoggedIn, customRole('admin'),adminUpdateUser)
    .delete(isLoggedIn, customRole('admin'),admingetDeleteUser)
module.exports = router;