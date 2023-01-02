const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

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

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
})

const List = new mongoose.model("List", listSchema);

app.get("/", function(req, res) {
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
        listTitle: "Today",
        newTodoItems: foundItems
      });
    }
  })
});

app.get("/:customListName", function(req, res){
  const customListName = req.params.customListName;
  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defeaultItems
        });
        list.save();
        res.redirect("/" + customListName)
      }
      else{
        res.render("list", {
          listTitle: foundList.name,
          newTodoItems: foundList.items
        });
      }
    }
  })
})

app.get("/about", function(req, res) {
  res.render("about");
})

app.post("/", function(req, res) {
  const itemName = req.body.newTodoItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  })
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      if(!err){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      }
    })
  }
})

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName == "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Successfully deleted!");
      }
    })
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err) {
        res.redirect("/" + listName);
      }
    })
  }

})

app.listen(3000, function() {
  console.log("Server started at port 3000");
})
