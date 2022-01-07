import minio from "minio";

const minioClient = new minio.Client({
  endPoint: "127.0.0.1",
  port: 9000,
  useSSL: false,
  accessKey: "minioadmin",
  secretKey: "minioadmin",
});

// TODO: use dynamic object name
minioClient.fGetObject("cars", "my-car.jpg", "/tmp/photo.jpg", (err) => {
  if (err) {
    return console.log(err);
  }

  console.log("success");
});
