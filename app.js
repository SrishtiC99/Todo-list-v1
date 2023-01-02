const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const date = require(__dirname + "/date.js");

const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set("view engine", "ejs");
app.use(express.static("public"));

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');
}

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = new mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your ToDo List!"
});
const item2 = new Item({
  name: "Hit this + button to add anew item"
});
const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defeaultItems = [item1, item2, item3];

app.get("/", function(req, res) {
  let day = date.getDate();
  Item.find(function(err, foundItems){
    if(err){
      console.log(err);
    }
    else{
      if(foundItems.length === 0){
        Item.insertMany(defeaultItems, function(err){
          if(err){
            console.log(err);
          }else{
            console.log("Successfully saved defaults item to DB");
          }
        })
      }
      res.render("list", {
        listTitle: day,
        newTodoItems: foundItems
      });
    }
  })
});

app.post("/", function(req, res) {
  const itemName = req.body.newTodoItem;
  const item = new Item({
    name: itemName
  })
  item.save();
  res.redirect("/");
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

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("Successfully deleted!");
    }
  })
  res.redirect("/");
})

app.listen(3000, function() {
  console.log("Server started at port 3000");
})
