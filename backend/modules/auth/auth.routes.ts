import { Router } from "express";
import { AuthController } from "./auth.controller.ts";

const router = Router();
const controller = new AuthController();

router.post("/login", controller.login);

export default router;
