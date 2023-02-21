const mongoose = require('mongoose');

mongoose.set("strictQuery", true);

mongoose.connect("mongodb://localhost:27017/SheyChatApp")

const db = mongoose.connection;

db.on("connected", ()=>{
    console.log('MongoDB connection successfully');
})

db.on("error", (err)=> {
    console.log('MongoDB conection failed');
})

module.exports = db; 