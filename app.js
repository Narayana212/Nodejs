const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "userData.db");
const bcrypt = require("bcrypt");
app.use(express.json());
let db = null;
const initial = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3005, () => {
      console.log("Running.....");
    });
  } catch (e) {
    console.log(e.message);
  }
};
initial();

app.post("/register", async (req, res) => {
  const { username, name, password, gender, location } = req.body;
  console.log(req.body);
  const checkUserQuery = `select * from user where username ='${username}'`;
  const checkUser = await db.get(checkUserQuery);
  if (checkUser !== undefined) {
    res.status(400);
    res.send("User already exists");
  } else if (password.length < 5) {
    res.status(400);
    res.send("Password is too short");
  } else {
    const dePassword = await bcrypt.hash(password, 10);
    console.log(dePassword);
    const InsertUserQuery = `insert into user(username,name,password,gender,location)
      values('${username}','${name}','${dePassword}','${gender}','${location}')`;
    const InsertUser = await db.run(InsertUserQuery);
    res.status(200);
    res.send("User created successfully");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const checkUserQuery = `select * from user where username ='${username}'`;
  const checkUser = await db.get(checkUserQuery);
  if (checkUser === undefined) {
    res.status(400);
    res.send("Invalid user");
  } else {
    const PasswordQuery = `select password from user where username ='${username}'`;
    const { bPassword } = await db.get(PasswordQuery);
    const PasswordCheck = await bcrypt.compare(password, checkUser.password);
    if (PasswordCheck === true) {
      res.status(200);
      res.send("Login success!");
    } else {
      res.status(400);
      res.send("Invalid password");
    }
  }
});

app.put("/change-password", async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  const checkUserQuery = `select * from user where username ='${username}'`;
  const checkUser = await db.get(checkUserQuery);
  const hi = bcrypt.compare(checkUser.password, oldPassword);
  if (hi) {
    if (newPassword.length < 5) {
      res.status(400);
      res.send("Password is too short");
    } else {
      const newPassword1 = await bcrypt.hash(newPassword, 10);
      const updateQuery = `update user
        set 
          password='${newPassword1}'
          where username = '${username}'`;
      const update = await db.run(updateQuery);
      res.status(200);
      res.send("Password updated");
    }
  } else {
    res.status(400);
    res.send("Invalid current password");
  }
});
module.exports = app;
