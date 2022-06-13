//jshint esversion:6


// deployed at
// https://blooming-lake-70547.herokuapp.com/


const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { stringify } = require("nodemon/lib/utils");
const { find } = require("lodash");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://AjeetKumar:test01@cluster0.v91urqo.mongodb.net/todolistDB");
// mongoose.connect("mongodb://localhost:27017");
const itemsSchema = {
  name : String
};

const Item = mongoose.model("Item" , itemsSchema);

const item1 = new Item({
  name : "Welcome to do list."
});

const item2 = new Item({
  name : "Hit the + button to add a new item."
});

const item3 = new Item({
  name : "<-- Hit this to delete the item."
});

const items1 = [item1 , item2 , item3];

const listSchema = {
  name : String ,
  items : [itemsSchema]
};

const List = mongoose.model("List" , listSchema);

const items = [];
const workItems = [];

app.get("/", function(req, res) {

  Item.find({} , function(err , founditems){
      // console.log(founditems);
      if(founditems.length === 0){
        Item.insertMany(items1 , function(err){
          if(err){
            console.log(err);
          }
          else{
            console.log("success");
          }
        })
        res.redirect("/");
      }
      else{
        // const day = date.getDate();
        res.render("list", {listTitle: "Today" , newListItems: founditems});
      }
  })

  // res.render("list", {listTitle: day, newListItems: items});

});

app.get("/:customlistname" , function(req ,res){
  const customlistname = _.capitalize(req.params.customlistname);

  List.findOne({name : customlistname} , function(err , foundlist){
    if(!err){
      if(!foundlist){
        // create a new list
        const list = new List({
          name : customlistname ,
          items : items1
        });
        list.save();
        res.redirect("/" + customlistname);
      }
      else{
        // show an existing list
        res.render("list", {listTitle: foundlist.name , newListItems: foundlist.items});
      }
    }
  })

});

app.post("/", function(req, res){

  const itemname = req.body.newItem;
  const listName = req.body.listName;

  const item = new Item({
    name : itemname
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName} , function(err , foundlist){
      if(!err){
        foundlist.items.push(item);
        foundlist.save();
        res.redirect("/" + listName);
      }
    });
  }
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete" , function(req , res){
  const checkitemid  = req.body.checkname;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkitemid , function(err){
      if(!err){
        console.log("success");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name : listName} , {$pull: {items: {_id: checkitemid}}} , function(err , foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
  // res.redirect("/");
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT || 3000 ;

app.listen(port, function() {
  console.log("Server started successfully");
});
