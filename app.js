const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI , { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

const Schema = mongoose.Schema;
const userSchema = new Schema({
  username: { type: String, required: [true, 'userName required']},
  exerciseLog : [{
        description: { type: String },
        duration: { type: Number },
        date: { type: String, required: false }
      }]
});

const User = mongoose.model("User", userSchema);
// setup end

// ============ for create new user ============
const addUser = (req, res) => {
  let username = req.body.username;

  //for invalid userName
  if (!username || username.length === 0) {
    res.json({ error: "Invalid username" });
  }

  //if not invalid userName
  let newUser = new User({
    username: username
  });

  const resObj = (data) => ({
    username: data.username,
    _id: data._id
  });

  let creatUser = (err, found, user, resObj) => {
    if(found){
      res.json("Username already taken")
    }else{
      user.save()
            .then(data => {
              res.json(resObj(data))
            })
    } 
  };

  User.exists({username: req.body.username},
                     (err, res) => creatUser(err, res, newUser, resObj));
}

// ============ for get all user list ============
const allUser = (req, res) => {
   User.find({}, (err, allUsers) => {
     if(err) {
        return console.log('getting allUser error: ', err);
      }
     res.json(allUsers)
   })
};

// ============ for log user exercise ============
const addExercise = (req, res) => {

  const defaultDate = () => new Date().toISOString().slice(0, 10);

  const userId = req.params.userId || req.body.userId; // userId from URL or from body
  
  const newExcercise = { 
    description: req.body.description,
    duration: Number(req.body.duration),
    date: req.body.date || defaultDate()
  }; // exrecise object to add

  const resObj = (user, excercise = newExcercise, id = userId) => ({
    username: user.username,
    description: excercise.description,
    duration: excercise.duration,
    _id: id,
    date: new Date(excercise.date).toDateString()
  });

  User.findByIdAndUpdate(
    userId, // find user by _id
    {$push: { exerciseLog: newExcercise } }, // add exObj to exercices[]
    {new: true},
    (err, updatedUser) => {
      if(err) {
        return console.log('update error:', err);
      }
      res.json(resObj(updatedUser));
    }
  );
}

// ============ for get user log ============
const userLogs = (req, res) => {
  const userId = req.params.userId;

  const allExercise = user => {
    const fromDate = req.query.from || '0000-00-00';
    const toDate = req.query.to || '9999-99-99';
    const limit = req.query.limit;

    if(user.exerciseLog === []){
      return user.exerciseLog
    }

    let customLog = user.exerciseLog.filter(exercise => 
                exercise.date >= fromDate && exercise.date <= toDate)
    return customLog.slice(0, limit||customLog.length)
  }

  const resObj = user => ({
    _id: user._id,
    username: user.username,
    count: user.exerciseLog.length,
    log: allExercise(user)
  });

  User.findOne({_id: userId}, (err, userinfo) => {
    if(err) {
        return console.log('getting allUser error: ', err);
    }
    res.json(resObj(userinfo))
  })
}

exports.addUser = addUser;
exports.allUser = allUser;
exports.addExercise = addExercise;
exports.userLogs = userLogs;