const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(
  cors({
    origin: "*",
  })
);

var ip = require("ip");
//console.log(ip.address());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    const { originalname } = file;

    cb(null, originalname);
  },
});
const upload = multer({ storage });

app.post("/upload", upload.single("objectFile"), (req, res) => {
  res.json({ data: req.file.path });
});

app.get("/avatar", (req, res) => {
  res.sendFile(path.join(req.query.avatar));
});

app.listen(3001);
