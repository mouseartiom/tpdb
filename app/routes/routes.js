// const express = require('express');
const users = require('./user_routes');
const forums = require('./forum_routes');
const threads = require('./thread_routes');
const posts = require('./post_routes');

// const router = express.Router;

module.exports = (app) => {
  app.get('/api', (req, reply) => reply.code(200).send({}));
  app.post('/api/user/:nickname/create', users.createUser);
  app.get('/api/user/:nickname/profile', users.getUserInfo);
  app.post('/api/user/:nickname/profile', users.updateUserInfo);
  app.post('/api/forum/create', forums.createForum);
  app.get('/api/forum/:slug/details', forums.getForumInfo);
  app.post('/api/forum/:slug/create', threads.createThread);
  app.get('/api/forum/:slug/threads', threads.getThreads);
  app.post('/api/thread/:slug/create', posts.createPost);
};
