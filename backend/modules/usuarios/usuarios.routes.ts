import { Router } from "express";
import { UsuariosController } from "./usuarios.controller.ts";

const router = Router();
const controller = new UsuariosController();

router.get("/", controller.getUsuarios);
router.post("/", controller.createUsuario);

export default router;
