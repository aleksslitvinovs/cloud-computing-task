import axios from "axios";
import express from "express";

const app = express();

const port = 3000;

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.post("/files/entry/", async (req, res) => {
  //   const url = body.url;
  const { url } = req.body;

  if (!url) {
    res.status(400).send("Bad request");

    return;
  }

  //   console.log(url);
  console.log(req.body);

  console.log({ url });
  axios
    .post("localhost:3001/files/entry/", { url })
    .then((res) => console.log(res))
    .catch(() => {});

  res.send("ok");
});

app.post("/files/exit/", (req, res) => {});
//https://miro.medium.com/max/1200/1*mk1-6aYaf_Bes1E3Imhc0A.jpeg
/*curl -X POST localhost:3000/files/entry/ --data '{"url": "https://miro.medium.com/max/1200/1*mk1-6aYaf_Bes1E3Imhc0A.jpeg"}' -H "Content-Type: application/json"
 */
