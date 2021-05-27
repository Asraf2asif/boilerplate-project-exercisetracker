const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require("body-parser");

require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: "false" }));

const {addUser, addExercise, allUser, userLogs} = require("./app.js")

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post("/api/users", addUser);

app.get("/api/users", allUser);

app.post("/api/users/:userId/exercises", addExercise);

app.get("/api/users/:userId/logs", userLogs);
 
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
