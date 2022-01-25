import amqp from "amqplib";
import axios from "axios";

const rabbitMQ = await amqp.connect(process.env.RABBITMQ_URL).catch((err) => {
  throw new Error(err);
});

const channel = await rabbitMQ.createChannel().catch((err) => {
  throw new Error(err);
});

const handleMessage = (msg) => {
  const data = JSON.parse(msg.content);

  console.log(`Filename is: ${data.filename}`);

  axios
    .post(`http://open-alpr:${process.env.OPEN_ALPR_PORT}/entry`, {
      filename: data.filename,
    })
    .then(() => {})
    .catch((err) => console.error(err));
};

channel.assertQueue(process.env.RABBITMQ_QUEUE, { durable: true });

console.log("RabbitMQ consumer is ready");

// TODO: If we add a new RabbitMQ queue, we need to add a new handler for it,
// siimlar to this one
channel.consume(process.env.RABBITMQ_QUEUE, handleMessage, { noAck: true });
