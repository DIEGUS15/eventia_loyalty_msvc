import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const LoyaltyPoints = sequelize.define(
  "LoyaltyPoints",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: "user_id",
      comment: "Reference to user ID from client service (not a FK by design)",
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Denormalized from client service for autonomy",
    },
    fullname: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Denormalized from client service for autonomy",
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    totalEarned: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "total_earned",
    },
    totalRedeemed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "total_redeemed",
    },
  },
  {
    tableName: "loyalty_points",
    timestamps: true,
    underscored: true,
  }
);

export default LoyaltyPoints;
