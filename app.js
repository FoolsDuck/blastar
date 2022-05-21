const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Player = require("./model/Player");
const dotenv = require("dotenv");
const { sendFile } = require("express/lib/response");
const app = express();
dotenv.config();
const port = 5000;
const dev = app.get("env") !== "production";

// Connect to mongoDB with mongoose client
mongoose.connect(
  process.env.DB_CONNECT,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  },

  () => console.log("Connected To MongoDB")
);

// Add headers
app.use(function (req, res, next) {
  // Origin to allow
  res.setHeader(
    "Access-Control-Allow-Origin"
    "http://localhost:5000"
  );
  // Request methods
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  // Request headers
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,"
  );
  next();
});

var forceSsl = function (req, res, next) {
  if (req.headers["x-forwarded-proto"] !== "https") {
    return res.redirect(["https://", req.get("Host"), req.url].join(""));
  }
  return next();
};

if (!dev) {
  app.use(forceSsl);
}

app.use(express.static(__dirname + "/public"));

app.post("/save-score", async (req, res) => {
  const address = req.query.address;
  const score = Number(req.query.score);
  const existPlayer = await Player.findOne({ address: address });
  console.log(score);
  console.log(existPlayer);
  if (existPlayer) {
    await Player.updateOne(
      { address: address },
      {
        $inc: {
          score: score,
        },
      }
    );
  } else {
    const player = new Player({
      address: address,
      score: score,
      date: Date.now(),
    });
    const savedPlayer = new Player(player);

    try {
      // Save user in DB
      await savedPlayer.save();
      res.send(savedPlayer);
    } catch (err) {
      res.status(400).send(err);
    }
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/index.html"));
});

app.get("/get-user-score", async (req, res) => {
  const address = req.query.address;
  const existPlayer = await Player.findOne({ address: address });
  if (existPlayer) {
    res.send(existPlayer.score.toString());
  } else {
    res.send("0");
  }
});

app.listen(process.env.PORT || port, function () {
  console.log(`Server started on port ${port}`);
});
