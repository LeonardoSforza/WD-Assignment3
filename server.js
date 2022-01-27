const sqlite = require("sqlite3").verbose();
let db = my_database("./phones.db");

const express = require("express");
const app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.json());

app.get("/phone-list", function (req, res) {
  db.all("SELECT * FROM phones", (error, row) => {
    if (error) {
      return error;
    }
    return res.json(row);
  });
});

app.post("/new-entry/phone-list", function (req, res) {
  db.run(
    "INSERT INTO phones (brand, model, os, image, screensize) VALUES ($brand, $model, $os, $image, $screensize)",
    {
      $brand: req.body.brand,
      $model: req.body.model,
      $os: req.body.os,
      $image: req.body.image,
      $screensize: req.body.screensize,
    }
  );
  let ans = { job: "Added" };
  return res.json(ans);
});

app.get("/delete/2/phone-list", (req, res) => {
  db.run("DELETE FROM phones WHERE id = 2");
  let ans = { job: "deleted" };
  return res.json(ans);
});

app.listen(3000);
console.log(
  "Your Web server should be up and running, waiting for requests to come in. Try http://localhost:3000/hello"
);

function my_database(filename) {
  var db = new sqlite.Database(filename, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Connected to the phones database.");
  });
  db.serialize(() => {
    db.run(`
        	CREATE TABLE IF NOT EXISTS phones
        	(id 	INTEGER PRIMARY KEY,
        	brand	CHAR(100) NOT NULL,
        	model 	CHAR(100) NOT NULL,
        	os 	CHAR(10) NOT NULL,
        	image 	CHAR(254) NOT NULL,
        	screensize INTEGER NOT NULL
        	)`);
    db.all(`select count(*) as count from phones`, function (err, result) {
      if (result[0].count == 0) {
        db.run(
          `INSERT INTO phones (brand, model, os, image, screensize) VALUES (?, ?, ?, ?, ?)`,
          [
            "Fairphone",
            "FP3",
            "Android",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Fairphone_3_modules_on_display.jpg/320px-Fairphone_3_modules_on_display.jpg",
            "5.65",
          ]
        );
        console.log("Inserted dummy phone entry into empty database");
      } else {
        console.log(
          "Database already contains",
          result[0].count,
          " item(s) at startup."
        );
      }
    });
  });
  return db;
}
