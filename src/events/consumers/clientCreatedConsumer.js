import { getChannel } from "../../config/rabbitmq.js";
import LoyaltyPoints from "../../models/LoyaltyPoints.js";

export const startClientCreatedConsumer = async () => {
  const channel = getChannel();

  // Declarar la cola para el servicio de loyalty
  const queue = "loyalty.client.created";

  await channel.assertQueue(queue, {
    durable: true,
  });

  // Bind de la cola al exchange con el routing key
  await channel.bindQueue(queue, "eventia.events", "client.created");

  console.log(`Waiting for messages in queue: ${queue}`);

  // Consumir mensajes
  channel.consume(
    queue,
    async (msg) => {
      if (msg !== null) {
        try {
          const clientData = JSON.parse(msg.content.toString());
          console.log("Received client.created event:", clientData);

          // Verificar si ya existe registro para este usuario
          const existingRecord = await LoyaltyPoints.findOne({
            where: { userId: clientData.id },
          });

          if (existingRecord) {
            console.log(
              `Loyalty points already exist for user ${clientData.id}`
            );
            channel.ack(msg);
            return;
          }

          // Crear registro de puntos de lealtad iniciando en 0
          const loyaltyRecord = await LoyaltyPoints.create({
            userId: clientData.id,
            email: clientData.email,
            fullname: clientData.fullname,
            points: 0,
            totalEarned: 0,
            totalRedeemed: 0,
          });

          console.log(
            `Loyalty points created for user ${clientData.id}:`,
            loyaltyRecord.toJSON()
          );

          // Acknowledge del mensaje
          channel.ack(msg);
        } catch (error) {
          console.error("Error processing client.created event:", error);

          // Rechazar el mensaje y re-encolarlo si hubo un error
          // En producción, podrías implementar una dead letter queue aquí
          channel.nack(msg, false, true);
        }
      }
    },
    {
      noAck: false, // Requerimos confirmación manual
    }
  );
};
