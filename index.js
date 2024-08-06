const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const cors = require('cors');
const uniqid = require('uniqid'); 
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

let users = []
let exercises = []
let log = []

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', (req, res) => {
  res.json(users)
});

app.post('/api/users', (req, res) => {
  const { username } = req.body
  const _id = uniqid()
  users.push({ username, _id})
  log.push({ username, _id, count: 0, log: []})
  res.json({ username, _id})
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const { description, duration, date } = req.body
  const { _id } = req.params
  const user = users.find(user => user._id === _id)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  const { username } = user
  const dateObj = date ? new Date(date) : new Date()
  const dateStr = dateObj.toDateString()
  const exercise = {
    username,
    _id: uniqid(),
    description,
    duration: Number(duration),
    date: dateStr
  }
  exercises.push(exercise)
  const userLog = log.find(log => log._id === _id);
  if (userLog) {
    userLog.log.push(exercise);
    userLog.count++;
  } else {
    log.push({ username, _id, count: 1, log: [exercise] });
  }
  res.json(exercise)
});   

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
