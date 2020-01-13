let shell = require('shelljs'),
		express = require('express'),
		app = express(),
		port = process.env.PORT || 3000,
		bodyParser = require('body-parser'),
		stdout = shell.exec('rm -rf ./var/tmp/product.json ./var/tmp/slideshows.json ./var/tmp/admin.json',{silent:true}).stdout;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.text({ type: 'text/html' }));

let routes = require('./code/local/routes/main');
routes(app);

app.use(express.static('media'))
app.use(function(req, res) {
  res.writeHead(404, {"Content-Type": 'application/json'});
  res.end(JSON.stringify({ code: 404, result : {"Type":"Error","Output":"Invaild Method"}}));
});

app.listen(port);

console.log('RESTful API server started on: ' + port);