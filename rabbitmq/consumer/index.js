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
    .post(`http://open-alpr:${process.env.OPEN_ALPR_PORT}/register`, {
      filename: data.filename,
    })
    .then(() => {})
    .catch((err) => console.error(err));
};

channel.assertQueue(process.env.RABBITMQ_QUEUE, { durable: true });

console.log("RabbitMQ consumer is ready");

channel.consume(process.env.RABBITMQ_QUEUE, handleMessage, { noAck: true });
