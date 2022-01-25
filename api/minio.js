import minio from "minio";

const bucketName = process.env.MINIO_BUCKET_NAME;

const minioClient = new minio.Client({
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
  endPoint: "minio",
  port: parseInt(process.env.MINIO_PORT),
  useSSL: false,
});

export const saveFile = (filename, req, res) => {
  minioClient
    .fPutObject(bucketName, filename, req.file.path)
    .then(() => console.log("File uploaded successfully"))
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
};

export const createDefaultBucket = () => {
  minioClient
    .bucketExists(bucketName)
    .then((doesExist) => {
      if (!doesExist) {
        minioClient.makeBucket(bucketName).catch((err) => console.error(err));

        console.log(`Created '${bucketName}' bucket successfully`);
      }
    })
    .catch((err) => console.error(err));
};
