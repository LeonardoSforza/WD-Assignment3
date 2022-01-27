const sqlite = require("sqlite3").verbose();
let db = my_database("./phones.db");

var express = require("express");
var app = express();

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

app.get("/new-entry/phone-list", (req, res) => {
  db.run(
    "INSERT INTO phones (brand, model, os, image, screensize) VALUES (?, ?, ?, ?, ?)",
    ["Google", "Pixel 6", "Android", "www.pixel6.com", "12"]
  );
  let ans = { job: "done" };
  return res.json(ans);
});

app.get("/delete/2/phone-list", (req, res) => {
  db.run("DELETE FROM phones WHERE id = 2");
  let ans = { job: "deleted" };
  return res.json(ans);
});

// This route responds to http://localhost:3000/db-example by selecting some data from the
// database and return it as JSON object.
// Please test if this works on your own device before you make any changes.
app.get("/db-example", function (req, res) {
  // Example SQL statement to select the name of all products from a specific brand
  db.all(
    `SELECT * FROM phones WHERE brand=?`,
    ["Fairphone"],
    function (err, rows) {
      // TODO: add code that checks for errors so you know what went wrong if anything went wrong
      // TODO: set the appropriate HTTP response headers and HTTP response codes here.

      // # Return db response as JSON
      return res.json(rows);
    }
  );
});

app.post("/post-example", function (req, res) {
  // This is just to check if there is any data posted in the body of the HTTP request:
  console.log(req.body);
  return res.json(req.body);
});

// ###############################################################################
// This should start the server, after the routes have been defined, at port 3000:

app.listen(3000);
console.log(
  "Your Web server should be up and running, waiting for requests to come in. Try http://localhost:3000/hello"
);

// ###############################################################################
// Some helper functions called above
function my_database(filename) {
  // Conncect to db by opening filename, create filename if it does not exist:
  var db = new sqlite.Database(filename, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Connected to the phones database.");
  });
  // Create our phones table if it does not exist already:
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
