import { Router } from "express";
import { PresupuestosController } from "./presupuestos.controller.ts";

const router = Router();
const controller = new PresupuestosController();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
