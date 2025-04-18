var express = require('express');
var bodyParser = require('body-parser');
var OAuth2Server = require('oauth2-server');
var Request = OAuth2Server.Request;
var Response = OAuth2Server.Response;
const { Pool } = require('pg'); // ✅ CORRECT
const cors = require('cors');
// userroute = require('./routes/user');

const app = express();
const dotenv = require('dotenv');
dotenv.config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.get('/', function(req, res) {
    res.send('Hello World! system is running');
});
// app.use("/", userroute);

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to PostgreSQL:', err.stack);
    } else {
        console.log('Connected to PostgreSQL');
        release(); // Release the client after checking the connection
    }
});

app.get("/users", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM users");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;