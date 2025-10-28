import LoyaltyPoints from "../models/LoyaltyPoints.js";

export const getLoyaltyPoints = async (req, res) => {
  try {
    const { userId } = req.params;

    const loyaltyRecord = await LoyaltyPoints.findOne({
      where: { userId },
    });

    if (!loyaltyRecord) {
      return res.status(404).json({
        success: false,
        message: "Loyalty points record not found for this user.",
      });
    }

    res.status(200).json({
      success: true,
      data: loyaltyRecord,
    });
  } catch (error) {
    console.error("Error fetching loyalty points:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching loyalty points",
      error: error.message,
    });
  }
};

export const addPoints = async (req, res) => {
  try {
    const { userId } = req.params;
    const { points, reason } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({
        success: false,
        message: "Points must be a positive number.",
      });
    }

    const loyaltyRecord = await LoyaltyPoints.findOne({
      where: { userId },
    });

    if (!loyaltyRecord) {
      return res.status(404).json({
        success: false,
        message: "Loyalty points record not found for this user.",
      });
    }

    // Actualizar puntos
    loyaltyRecord.points += points;
    loyaltyRecord.totalEarned += points;
    await loyaltyRecord.save();

    console.log(`Added ${points} points to user ${userId}. Reason: ${reason}`);

    res.status(200).json({
      success: true,
      message: "Points added successfully.",
      data: loyaltyRecord,
    });
  } catch (error) {
    console.error("Error adding points:", error);
    res.status(500).json({
      success: false,
      message: "Error adding points",
      error: error.message,
    });
  }
};

export const redeemPoints = async (req, res) => {
  try {
    const { userId } = req.params;
    const { points, reason } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({
        success: false,
        message: "Points must be a positive number.",
      });
    }

    const loyaltyRecord = await LoyaltyPoints.findOne({
      where: { userId },
    });

    if (!loyaltyRecord) {
      return res.status(404).json({
        success: false,
        message: "Loyalty points record not found for this user.",
      });
    }

    if (loyaltyRecord.points < points) {
      return res.status(400).json({
        success: false,
        message: "Insufficient points.",
        availablePoints: loyaltyRecord.points,
        requestedPoints: points,
      });
    }

    // Redimir puntos
    loyaltyRecord.points -= points;
    loyaltyRecord.totalRedeemed += points;
    await loyaltyRecord.save();

    console.log(
      `Redeemed ${points} points from user ${userId}. Reason: ${reason}`
    );

    res.status(200).json({
      success: true,
      message: "Points redeemed successfully.",
      data: loyaltyRecord,
    });
  } catch (error) {
    console.error("Error redeeming points:", error);
    res.status(500).json({
      success: false,
      message: "Error redeeming points",
      error: error.message,
    });
  }
};

export const getAllLoyaltyRecords = async (req, res) => {
  try {
    const records = await LoyaltyPoints.findAll({
      order: [["points", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: records,
      count: records.length,
    });
  } catch (error) {
    console.error("Error fetching all loyalty records:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching loyalty records",
      error: error.message,
    });
  }
};
