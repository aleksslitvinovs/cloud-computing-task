import amqp from "amqplib";

const queue = process.env.RABBITMQ_QUEUE;

const rabbitMQClient = await amqp
  .connect(process.env.RABBITMQ_URL, "heartbeat=60")
  .catch((err) => {
    throw new Error(err);
  });

export const enqueueMessage = (filename) => {
  return new Promise(async (resolve, reject) => {
    let channel;

    try {
      channel = await rabbitMQClient.createChannel();
    } catch (err) {
      reject(err);
      return;
    }

    channel.assertQueue(queue, { durable: true });

    const data = JSON.stringify({ filename });

    channel.sendToQueue(queue, Buffer.from(data));

    console.log(`Enqueued ${data}`);
    resolve();
  });
};
