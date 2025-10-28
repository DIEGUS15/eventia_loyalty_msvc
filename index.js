import express from "express";
import dotenv from "dotenv";
import { sequelize, testConnection } from "./src/db.js";
import { connectRabbitMQ, closeConnection } from "./src/config/rabbitmq.js";
import { startClientCreatedConsumer } from "./src/events/consumers/clientCreatedConsumer.js";
import loyaltyRoutes from "./src/routes/loyaltyRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use("/api/loyalty", loyaltyRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Loyalty Service API working correctly" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

const startServer = async () => {
  try {
    // Conectar a la base de datos
    await testConnection();

    // Sincronizar modelos con la base de datos
    await sequelize.sync({ alter: true });
    console.log("Models synchronized with the database");

    // Conectar a RabbitMQ
    await connectRabbitMQ();

    // Iniciar consumidores de eventos
    await startClientCreatedConsumer();

    // Iniciar servidor HTTP
    app.listen(PORT, () => {
      console.log(`Loyalty Service running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

// Manejo de señales para cerrar conexiones gracefully
process.on("SIGINT", async () => {
  console.log("\nShutting down gracefully...");
  await closeConnection();
  await sequelize.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nShutting down gracefully...");
  await closeConnection();
  await sequelize.close();
  process.exit(0);
});

startServer();
