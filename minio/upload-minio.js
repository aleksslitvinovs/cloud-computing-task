import minio from "minio";

const minioClient = new minio.Client({
  endPoint: "127.0.0.1",
  port: 9000,
  useSSL: false,
  accessKey: "minioadmin",
  secretKey: "minioadmin",
});

// Make a bucket called europetrip.
minioClient.makeBucket("cars", function (err) {
  if (err) {
    return console.log(err);
  }

  console.log("Bucket created successfully");

  // Using fPutObject API upload your file to the bucket europetrip.
  // TODO: use dynamic object name
  minioClient.fPutObject("cars", "my-car.jpg", "./h786poj.jpg", (err, etag) => {
    if (err) {
      return console.log(err);
    }

    console.log("File uploaded successfully.");
  });
});
