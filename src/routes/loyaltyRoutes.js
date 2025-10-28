import express from "express";
import {
  getLoyaltyPoints,
  addPoints,
  redeemPoints,
  getAllLoyaltyRecords,
} from "../controllers/loyaltyController.js";

const router = express.Router();

// Obtener todos los registros de lealtad
router.get("/", getAllLoyaltyRecords);

// Obtener puntos de un usuario específico
router.get("/:userId", getLoyaltyPoints);

// Añadir puntos a un usuario
router.post("/:userId/add", addPoints);

// Redimir puntos de un usuario
router.post("/:userId/redeem", redeemPoints);

export default router;
