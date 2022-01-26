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

const handleExistingPlate = async (plate) => {
  const exitTime = moment(new Date().toISOString(), true);

  const entryTime = moment(
    await tedis.get(plate).catch((err) => console.error(err))
  );

  const duration = moment.duration(exitTime.diff(entryTime));

  return new Promise((resolve, reject) => {
    sendDurationEmail(plate, duration)
      .then(() => resolve())
      .catch((err) => reject(err))
      .finally(() =>
        tedis.del(plate).catch((err) => {
          console.error(err);
          reject(err);
        })
      );
  });
};

const savePlate = (plate) => {
  return new Promise(async (resolve, reject) => {
    tedis
      .exists(plate)
      .then((exists) => {
        if (exists === 1) {
          handleExistingPlate(plate)
            .then(() => resolve())
            .catch((err) => reject(err));

          return;
        }

        tedis.set(plate, new Date().toISOString()).catch((err) => reject(err));
      })
      .catch((err) => reject(err));
  });
};

const processPlate = async (error, stdout, stderr, res) => {
  if (error || stderr) {
    res.status(500).send("Error occured proccessing file");
    console.error(error || stderr);

    return;
  }

  let plateOutput;
  try {
    plateOutput = JSON.parse(stdout.toString());
  } catch (e) {
    res.status(500).send("Error processing plate");
    console.error(`Error parsing JSON: ${e}`);

    return;
  }

  if (!plateOutput?.results || plateOutput.results.length === 0) {
    res.status(500).send("No plates found");
    console.error("No plate found");

    return;
  }

  const { plate } = plateOutput.results[0];
  console.log(`Plate: ${plate}`);

  savePlate(plate)
    .then(() => res.status(200).send("Plate found and saved in record"))
    .catch((err) => {
      res.status(500).send("Error saving plate");
      console.error(err);
    });
};

const callOpenALPR = (filename, res) => {
  child_process.exec(
    `alpr -c eu -j ${path.join(downloadDir, filename)}`,
    (error, stdout, stderr) => processPlate(error, stdout, stderr, res)
  );
};

const registerHandler = async (req, res) => {
  const { filename } = req.body;

  if (!filename) {
    res.status(500).send("Could not process filename");
    console.error(`Received filename: ${filename}`);

    return;
  }

  try {
    await downloadFile(filename);
  } catch (err) {
    res.status(500).send("Error occured proccessing file");
    console.error(err);

    return;
  }

  callOpenALPR(filename, res);
};

const app = express();

app.use(express.json());
app.post("/register", registerHandler);
app.use((_req, res, _next) => res.status(404).send("Not found"));
app.listen(process.env.OPEN_ALPR_PORT, () =>
  console.log(`Example app listening on port ${process.env.OPEN_ALPR_PORT}!`)
);
