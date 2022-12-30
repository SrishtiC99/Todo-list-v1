const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
console.log(date);

const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set("view engine", "ejs");
app.use(express.static("public"));

const todoItems = ["Buy Food", "Cook Food", "Eat Food"];
let workItems = [];

app.get("/", function(req, res) {
  let day = date.getDate();
  res.render("list", {
    listTitle: day,
    newTodoItems: todoItems
  });
});

app.post("/", function(req, res) {
  item = req.body.newTodoItem;
  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    todoItems.push(item);
    res.redirect("/");
  }
})

app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work",
    newTodoItems: workItems
  })
})

app.get("/about", function(req, res) {
  res.render("about");
})

app.listen(3000, function() {
  console.log("Server started at port 3000");
})
