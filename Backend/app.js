const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');
const captainRoutes = require('./routes/captain.routes');
const connectToDb = require('./db/db');
const cookieParser = require('cookie-parser');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


connectToDb();



app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/users', userRoutes);
app.use('/captains', captainRoutes);

module.exports = app;
