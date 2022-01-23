import express from "express";
import multer from "multer";
import amqp from "amqplib";
import minio from "minio";

const queue = process.env.RABBITMQ_QUEUE;

const bucketName = process.env.MINIO_BUCKET_NAME;

const minioClient = new minio.Client({
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,

  // Use 'minio' for inter-container communication.
  // Use 'localhost' for host-container communication.
  endPoint: "minio",
  port: parseInt(process.env.MINIO_PORT),
  useSSL: false,
});

const rabbitMQClient = await amqp
  .connect(process.env.RABBITMQ_URL, "heartbeat=60")
  .catch((err) => {
    throw new Error(err);
  });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, "./uploads");
    },
    filename: (_req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
}).single("image");

const uploadHanlder = (req, res) => {
  return new Promise((resolve, reject) => {
    upload(req, res, (err) => {
      if (err) {
        if (
          err instanceof multer.MulterError &&
          err.code === "LIMIT_FILE_SIZE"
        ) {
          res.status(413).send("File too large");

          reject();
          return;
        }

        res.status(500).send(err);

        reject();
      }

      resolve();
    });
  });
};

const saveToMinio = async (req, res) => {
  try {
    await uploadHanlder(req, res);
  } catch (e) {
    return "";
  }

  const filename = req?.file?.originalname;

  if (!filename) {
    res.status(400).send("No file uploaded");

    return "";
  }

  minioClient
    .fPutObject(bucketName, filename, req.file.path)
    .then(() => console.log("File uploaded successfully"))
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });

  return filename;
};

const queueMessage = async (res, filename) => {
  const channel = await rabbitMQClient.createChannel().catch((err) => {
    res.status(500).send(err);
  });

  if (!channel) {
    return;
  }

  channel.assertQueue(queue, { durable: true });

  const data = JSON.stringify({ filename });

  channel.sendToQueue(queue, Buffer.from(data));

  console.log(`Enqueued ${data}`);
};

const entryHandler = async (req, res) => {
  const filename = await saveToMinio(req, res);
  if (!filename) {
    return;
  }

  queueMessage(res, filename);

  res.status(202).send("Processing image");
};

const app = express();

app.post("/entry", entryHandler);
app.post("/exit", entryHandler);

app.use((_req, res, _next) => res.status(404).send("Not found"));

app.listen(process.env.API_PORT, () => {
  minioClient
    .bucketExists(bucketName)
    .then((doesExist) => {
      if (!doesExist) {
        minioClient.makeBucket(bucketName).catch((err) => console.error(err));

        console.log(`Created '${bucketName}' bucket successfully`);
      }
    })
    .catch((err) => console.error(err));

  console.log(`REST API listening on port ${process.env.API_PORT}!`);
});
