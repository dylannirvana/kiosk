'use strict';

function testoutput (req, res) {
  res.writeHead(200, {"Content-Type": 'application/json'});
  res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output":"Test Method"}}));
};


exports.test = function(req, res) {
  testoutput(req,res);
};


exports.testdata = function(req, res) {
  var tdata = require('../models/testdata');
  tdata.get(req, res);
};


exports.filter_list = function(req, res) {
  var fdata = require('../models/filter_list');
  fdata.get(req, res);
};

exports.category = function(req, res) {
  var fdata = require('../models/category');
  fdata.get(req, res);
};

exports.products = function(req, res) {
  var fdata = require('../models/products');
  fdata.get(req, res);
};

exports.search = function(req, res) {
  var fdata = require('../models/search');
  fdata.get(req, res);
};


