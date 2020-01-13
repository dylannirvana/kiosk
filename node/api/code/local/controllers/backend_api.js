'use strict';

exports.pull_data = function(req, res) {
  var sync = require('../models/sync');
  sync.pull_data(req, res);
};

exports.pull_all = function(req, res) {
  var sync = require('../models/sync');
  sync.pull_all(req, res);
};

exports.get_admin = function(req, res) {
  var sync = require('../models/sync');
  sync.get_admin(req, res);
};

exports.pull_admin = function(req, res) {
  var sync = require('../models/sync');
  sync.pull_admin(req, res);
};

exports.get_images = function(req, res) {
  var sync = require('../models/sync');
  sync.get_images(req, res);
};

exports.pull_images = function(req, res) {
  var sync = require('../models/sync');
  sync.pull_images(req, res);
};

exports.get_slideshows = function(req, res) {
  var sync = require('../models/sync');
  sync.get_slideshows(req, res);
};

exports.pull_slideshows = function(req, res) {
  var sync = require('../models/sync');
  sync.pull_slideshows(req, res);
};

exports.get_products = function(req, res) {
  var sync = require('../models/sync');
  sync.get_products(req, res);
};

exports.pull_products = function(req, res) {
  var sync = require('../models/sync');
  sync.pull_products(req, res);
};

exports.sync_feed = function(req, res) {
  var feed = require('../models/feed');
  feed.processs(req, res);
};

exports.flush_log = function(req, res) {
  var log = require('../models/logger');
  log.flush(req, res);
};

exports.view_log = function(req, res) {
  var log = require('../models/logger');
  log.get(req, res);
};

exports.form_key_testing = function(req, res) {
  var users = require('../models/users');
  users.formkey_testing(req, res);
};

exports.users = function(req, res) {
  var users = require('../models/users');
  users.all_users(req, res);
};

exports.get_user = function(req, res) {
  var users = require('../models/users');
  users.get_user(req, res);
};

exports.del_user = function(req, res) {
  var users = require('../models/users');
  users.del_user(req, res);
};

exports.users_create = function(req, res) {
  var users = require('../models/users');
  users.create_user(req, res);
};

exports.users_update = function(req, res) {
  var users = require('../models/users');
  users.update_user(req, res);
};

exports.user_login = function(req, res) {
  var users = require('../models/users');
  users.user_login(req, res);
};

exports.user_login_local = function(req, res) {
  var users = require('../models/users');
  users.user_login_local(req, res);
};

exports.user_email = function(req, res) {
  var users = require('../models/users');
  users.user_email(req, res);
};

exports.uploader = function(req, res) {
  var slideshow = require('../models/slideshow');
  slideshow.uploader(req, res);
};

exports.upload = function(req, res) {
  var slideshow = require('../models/slideshow');
  slideshow.upload(req, res);
};

exports.create = function(req, res) {
  var slideshow = require('../models/slideshow');
  slideshow.create(req, res);
};

exports.update = function(req, res) {
  var slideshow = require('../models/slideshow');
  slideshow.update(req, res);
};

exports.get = function(req, res) {
  var slideshow = require('../models/slideshow');
  slideshow.get(req, res);
};

exports.delete = function(req, res) {
  var slideshow = require('../models/slideshow');
  slideshow.delete(req, res);
};

exports.get_image = function(req, res) {
  const images = require('../models/images');
  images.get(req, res);
}

