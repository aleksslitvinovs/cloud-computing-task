import express from "express";
import multer from "multer";

import { saveFile, createDefaultBucket } from "./minio.js";
import { enqueueMessage } from "./rabbitmq.js";

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

  saveFile(filename, req, res);

  return filename;
};

const registerHandler = async (req, res) => {
  const filename = await saveToMinio(req, res);
  if (!filename) {
    return;
  }

  try {
    await enqueueMessage(filename);
  } catch (err) {
    res.status(500).send("Error occured proccessing file");
    console.log(err);
    return;
  }

  res.status(202).send("Processing image");
};

const app = express();

app.post("/register", registerHandler);

app.use((_req, res, _next) => res.status(404).send("Not found"));

app.listen(process.env.API_PORT, () => {
  createDefaultBucket();

  console.log(`REST API listening on port ${process.env.API_PORT}!`);
});
