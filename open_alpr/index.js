import express from "express";
import child_process from "child_process";
const app = express();
app.use(express.json());


const exec = child_process.exec
const port = 3001;

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

app.post("/files/entry/", (req, res) => {
  const lastUrl = req.body.url.substring(req.body.url.lastIndexOf("/") + 1);

  console.log(lastUrl);
  
  exec("alpr -c eu -j " + lastUrl, function (error, stdout, stderr) {
    console.log("Got info from alpr");
    console.log(stdout.toString());
    console.log("Parsing JSON");
    let plateOutput = JSON.parse(stdout.toString());
    console.log("Found number plate");
    console.log(plateOutput.results[0].plate);

    res.send(plateOutput.results[0].plate);
  });

  
});
