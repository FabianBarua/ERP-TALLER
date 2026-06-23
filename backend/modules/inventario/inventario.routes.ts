import { Router } from "express";
import { InventarioController } from "./inventario.controller.ts";

const router = Router();
const controller = new InventarioController();

router.get("/", controller.getAll);
router.get("/stock-bajo", controller.getStockBajo);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
