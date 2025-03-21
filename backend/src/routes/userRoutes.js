import { Router } from "express";
import { addToHistory, getUserHistory, login, register, validateSession } from "../controllers/user.js";
import authenticateToken from "../middleware/authenticateToken.js";

const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/addActivity").post(authenticateToken, addToHistory);
router.route("/getAllActivity").get(authenticateToken, getUserHistory);
router.route('/validateSession').get(authenticateToken, validateSession);

export default router;