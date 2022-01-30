const sqlite = require("sqlite3").verbose();
let db = my_database("./phones.db");

const express = require("express");
const app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.json());

let ans = [];

const return404Error = (message, res) => {
  ans = [];
  ans.push({
    status: "404",
    errorMessage: message,
  });
  return res.json(ans);
};

const returnSpecificRow = (row) => {
  return row;
};

const deleteID = (id, req, res) => {
  db.run("DELETE FROM phones WHERE id = ?", [id]);
  ans = [];
  ans.push({
    status: "200",
    action: "deleted",
    contentID: req.params.id,
  });
  return res.json(ans);
};

const updateID = (id, model, brand, os, image, screen, res) => {
  if (model) {
    db.run("UPDATE phones SET model = ? WHERE id = ?", [model, id]);
  }
  if (brand) {
    db.run("UPDATE phones SET brand = ? WHERE id = ?", [brand, id]);
  }
  if (os) {
    db.run("UPDATE phones SET os = ? WHERE id = ?", [os, id]);
  }
  if (image) {
    db.run("UPDATE phones SET image = ? WHERE id = ?", [image, id]);
  }
  if (screen) {
    db.run("UPDATE phones SET screensize = ? WHERE id = ?", [screen, id]);
  }
  ans = [];
  ans.push({
    status: "200",
    action: "Updated, Here is the new content: ",
    contentID: id,
    brand: brand,
    model: model,
    os: os,
    image: image,
    screensize: screen,
  });
  return res.json(ans);
};

app.get("/phone-list", function (req, res) {
  db.all("SELECT * FROM phones", (error, row) => {
    if (error) {
      return error;
    }
    if (row.length === 0) {
      ans = [];
      ans = {
        status: "204",
        messageError: "No items in database",
      };
      return res.json(ans);
    } else {
      return res.json(row);
    }
  });
});

app.get("/:id/phone-list", (req, res) => {
  db.get("SELECT * FROM phones WHERE id = ?", [req.params.id], (err, row) => {
    if (err) {
      return res.json(err.message);
    }
    return row
      ? returnSpecificRow(res.json(row))
      : return404Error(`Phone with ID ${req.params.id} not found`, res);
  });
});

app.post("/new-entry/phone-list", function (req, res) {
  if (
    req.body.brand &&
    req.body.model &&
    req.body.os &&
    req.body.image &&
    req.body.screensize
  ) {
    db.run(
      "INSERT INTO phones (brand, model, os, image, screensize) VALUES (?, ?, ?, ?, ?)",
      [
        req.body.brand,
        req.body.model,
        req.body.os,
        req.body.image,
        req.body.screensize,
      ],
      (err, row) => {
        if (err) {
          return res.json(err.message);
        } else {
          ans = [];
          ans.push({
            status: "201",
            action: "Created new item",
            brand: req.body.brand,
            model: req.body.model,
            os: req.body.os,
            image: req.body.image,
            screensize: req.body.screensize,
          });
          return res.json(ans);
        }
      }
    );
  } else {
    ans = [];
    ans.push({
      status: "400",
      messageError: "You are missing one or more requirements",
    });
    return res.json(ans);
  }
});

app.delete("/delete/:id/phone-list", (req, res) => {
  db.get("SELECT * FROM phones WHERE id = ?", [req.params.id], (err, row) => {
    if (err) {
      return res.json(err.message);
    }
    return row
      ? deleteID(req.params.id, req, res)
      : return404Error(`Phone with ID ${req.params.id} not found`, res);
  });
});

app.patch("/change/:id/phone-list", (req, res) => {
  db.get("SELECT * FROM phones WHERE id = ?", [req.params.id], (err, row) => {
    if (err) {
      return res.json(err.message);
    }
    return row
      ? updateID(
          req.params.id,
          req.body.model,
          req.body.brand,
          req.body.os,
          req.body.image,
          req.body.screensize,
          res
        )
      : return404Error(`Phone with ID ${req.params.id} not found`, res);
  });
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
