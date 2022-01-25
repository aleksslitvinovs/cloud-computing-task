import express from "express";
import child_process from "child_process";
import minio from "minio";
import path from "path";
import { Tedis } from "tedis";
import moment from "moment";

import { sendDurationEmail } from "./email.js";

const downloadDir = "tmp";

const tedis = new Tedis({
  port: process.env.REDIS_PORT,
  host: "redis",
});

const minioClient = new minio.Client({
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
  endPoint: "minio",
  port: parseInt(process.env.MINIO_PORT),
  useSSL: false,
});

const downloadFile = (filename) =>
  new Promise((resolve, reject) =>
    minioClient.fGetObject(
      process.env.MINIO_BUCKET_NAME,
      filename,
      path.join(downloadDir, filename),
      (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      }
    )
  );

// TODO: Delete plate if it is found
const handleExistingPlate = async (plate, res) => {
  const exitTime = moment(new Date().toISOString(), true);

  const entryTime = moment(
    await tedis.get(plate).catch((err) => console.error(err))
  );

  const duration = moment.duration(exitTime.diff(entryTime));

  // TODO: Use better duration format
  console.log(
    `Duration: ${duration.asHours()} h ${duration.asMinutes()} m ${duration.asSeconds()} s`
  );

  sendDurationEmail(plate, duration);
};

// TODO: Clean up this function
const processPlate = (filename, res) => {
  child_process.exec(
    `alpr -c eu -j ${path.join(downloadDir, filename)}`,
    (error, stdout, stderr) => {
      if (error) {
        res.status(500).send(error);
        return;
      }

      console.log(stderr);

      console.log("Got info from alpr");
      console.log(stdout.toString());
      console.log("Parsing JSON");

      let plateOutput;
      try {
        plateOutput = JSON.parse(stdout.toString());
      } catch (e) {
        console.log(`Error parsing JSON: ${e}`);

        return;
      }

      console.log(plateOutput);

      if (!plateOutput?.results || plateOutput.results.length === 0) {
        console.log("No plate found");
        res.send(plateOutput.results);

        return;
      }

      console.log("Found number plate");

      const { plate } = plateOutput.results[0];

      console.log(plate);

      tedis.exists(plate).then((exists) => {
        if (exists === 1) {
          handleExistingPlate(plate, res);
        }

        console.log("Saving plate");

        tedis
          .set(plate, new Date().toISOString())
          .then((value) => console.log(value))
          .catch((err) => console.error(err));
      });

      res.status(200).send("Plate found and saved in record");
    }
  );
};

const entryHanlder = async (req, res) => {
  const { filename } = req.body;

  if (!filename) {
    res.status(500).send("Could not process filename");
    console.error(`Received filename: ${filename}`);

    return;
  }

  try {
    await downloadFile(filename);
  } catch (err) {
    res.status(500).send("Error occurd proccessing file");
    console.error(err);

    return;
  }

  processPlate(filename, res);
};

const app = express();

app.use(express.json());
// TODO: If we are creating a separate RabbitMQ queue, most likely we need a
// a similar endpoint for this
app.post("/entry", entryHanlder);
app.use((_req, res, _next) => res.status(404).send("Not found"));
app.listen(process.env.OPEN_ALPR_PORT, () =>
  console.log(`Example app listening on port ${process.env.OPEN_ALPR_PORT}!`)
);
