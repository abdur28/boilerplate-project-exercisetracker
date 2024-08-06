const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const uniqid = require('uniqid'); 
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let users = [];
let exercises = [];
let log = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const _id = uniqid();
  users.push({ username, _id });
  log.push({ username, _id, count: 0, log: [] });
  res.json({ username, _id });
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const { description, duration, date } = req.body;
  const { _id } = req.params;
  const user = users.find(user => user._id === _id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const dateObj = date ? new Date(date) : new Date();
  const dateStr = dateObj.toDateString();
  const exercise = {
    description,
    duration: Number(duration),
    date: dateStr
  };
  exercises.push({ ...exercise, username: user.username, _id });
  const userLog = log.find(log => log._id === _id);
  userLog.log.push(exercise);
  userLog.count++;
  res.json({
    username: user.username,
    _id: user._id,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date
  });
});

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  const user = users.find(user => user._id === _id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const userLog = log.find(log => log._id === _id);
  if (!userLog) {
    return res.status(404).json({ error: 'User log not found' });
  }
  const fromDate = from ? new Date(from) : new Date(0);
  const toDate = to ? new Date(to) : new Date();
  let filteredLogs = userLog.log.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= fromDate && logDate <= toDate;
  });
  if (limit) {
    filteredLogs = filteredLogs.slice(0, limit);
  }
  res.json({
    username: user.username,
    count: filteredLogs.length,
    _id: user._id,
    log: filteredLogs
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
