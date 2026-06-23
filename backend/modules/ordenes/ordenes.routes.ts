import { Router } from "express";
import { OrdenesController } from "./ordenes.controller.ts";

const router = Router();
const controller = new OrdenesController();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);
router.patch("/:id/status", controller.updateStatus);

export default router;
