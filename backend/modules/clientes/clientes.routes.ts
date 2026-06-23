import { Router } from "express";
import { ClientesController } from "./clientes.controller.ts";

const router = Router();
const controller = new ClientesController();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
