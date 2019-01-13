// import User from '../models/user';
const User = require('../models/user');
const dbConfig = require('../../config/db');

const db = dbConfig.db;
// const queries = require('../queries/user_queries');


async function createUser(req, reply, next) {
  const user = new User({
    nickname: req.params.nickname,
    fullname: req.body.fullname,
    email: req.body.email,
    about: req.body.about,
  });

  db.none({
    text: 'INSERT INTO users (nickname, fullname, email, about) '
    + 'VALUES ($1, $2, $3, $4)',
    // + ' RETURNING (about, email, fullname, nickname);',
    values: [user.nickname, user.fullname, user.email, user.about],
  })
    .then(() => {
      reply.code(201)
        .send(user.toJson());
    })
    .catch((err) => {
      // console.log(err);
      if (err.code === dbConfig.dataConflict) {
        db.any({
          text: 'SELECT * FROM users WHERE nickname=$1 OR email=$2',
          values: [user.nickname, user.email],
        })
          .then((data) => {
            console.log(data);
            const newUsers = data.map(existingUser => new User(existingUser));
            reply.code(409)
              .send(newUsers);
          })
          .catch((error) => {
            console.log(error);
            reply.code(500)
              .send(error);
          });
      }
    });
}

async function getUserInfo(req, reply) {
  db.any({
    text: 'SELECT about, email, nickname, fullname FROM users WHERE nickname=$1;',
    values: [req.params.nickname],
  })
    .then((data) => {
      if (data.length === 0) {
        reply.code(404)
          .send({
            message: `Can't find user by nickname ${req.params.nickname}`,
          });
      }
      const user = data.map(existingUser => new User(existingUser))[0];
      reply.code(200)
        .send(user);
    })
    .catch((err) => {
      console.log(err);
      if (err.code === 0) {
        reply.code(404)
          .send({
            message: "Can't find user with id #42",
          });
      }
    });
}

async function updateUserInfo(req, reply, next) {
  let query = 'UPDATE users SET ';
  if (req.body.fullname) {
    query += `fullname = '${req.body.fullname}', `;
  } else {
    query += 'fullname = fullname, ';
  }
  if (req.body.email) {
    query += `email = '${req.body.email}', `;
  } else {
    query += 'email = email, ';
  }
  if (req.body.about) {
    query += `about = '${req.body.about}' `;
  } else {
    query += 'about = about ';
  }
  query += `
    WHERE nickname = '${req.params.nickname}'
    RETURNING *`;

  db.any(query)
    .then((data) => {
      if (data.length === 0) {
        reply.code(404)
          .send({
            message: `Can't find user by nickname ${req.params.nickname}`,
          });
      }
      const user = data.map(existingUser => new User(existingUser))[0];
      reply.code(200)
        .send(user);
    })
    .catch((err) => {
      console.log(err);
      if (err.code === 0) {
        reply.code(404)
          .send({
            message: "Can't find user with id #42",
          });
      } else if (err.code === dbConfig.dataConflict) {
        reply.code(409)
          .send({
            message: "Can't find user with id #42",
          });
      }
    });
}

module.exports = {
  createUser,
  getUserInfo,
  updateUserInfo,
};