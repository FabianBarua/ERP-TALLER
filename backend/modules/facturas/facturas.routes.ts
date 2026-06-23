import { Router } from "express";
import { FacturasController } from "./facturas.controller.ts";

const router = Router();
const controller = new FacturasController();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
