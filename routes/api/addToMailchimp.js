// To use this module - send over an email address and a source. Will send back either a 
// 'success' or 'error'. Checks to see if they're a subscriber, if not then adds them. 
// If you want to do anything (like update/add extra data) will have to write that in
// because it doesn't do it right now.

var async = require('async'),
	keystone = require('keystone');
var request = require("request");
var md5 = require('md5');

var data;
var body;
var email;
var memberID;

exports = module.exports = function(req, res) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

	body = req.body;

	email = (body.email).toLowerCase();
	memberID = (md5(email));
	console.log("Email: "+email+" submitted via "+(body.source || body.function));

	if (email) {
		createData()
	} else {
		res.apiResponse('error')
	}

	var getOptions = { method: 'GET',
		url: 'https://us12.api.mailchimp.com/3.0/lists/6256d8517b/members/'+memberID,
		qs: { 'content-header': '' },
		headers: 
			{ 'cache-control': 'no-cache',
			authorization: 'Basic '+keystone.get('mailchimp_api'),
			'content-type': 'application/json' } 
	};

	var postOptions = 
	{
		method: 'POST',
		url: 'https://us12.api.mailchimp.com/3.0/lists/6256d8517b/members/',
		headers: 
			{ 'cache-control': 'no-cache',
			authorization: 'Basic '+keystone.get('mailchimp_api'),
		 	'content-type': 'application/json' },
		body: data,
		json: true 
	};

	request(getOptions, function (error, response, body) {
		if (error) throw new Error(error);
		console.log("status code: "+response.statusCode);
		var body = JSON.parse(response.body);
		var status = body.status;
		// console.log(status);
		if (response.statusCode === 404) {
			request(postOptions, function(error, response, body){
				if (error) throw new Error(error);
				console.log(response.statusCode);
				//console.log(body);
				if (response.statusCode === 200) {
					console.log("INFO: Added "+email+" to mailchimp");
					res.apiResponse("success")
				} else if (response.statusCode === 400) {
					console.log("INFO: There was an error adding "+email+" to mailchimp");
					res.apiResponse('error')
				}
			})
		} else if (response.statusCode === 400) {
			console.log("INFO: There was an error adding "+email+" to mailchimp");
			res.apiResponse('error')
		} else {
			console.log("INFO: "+email+" already existed in mailchimp");
			//TODO: Add some way to update if they already exist
			res.apiResponse('success');
		}
	});
}

function createData() {
	if (body.function === 'digg') {
		data = {
			status : 'subscribed',
			email_address: email,
			"merge_fields": 
			{
			    "EMSOURCE": body.function,
			}
		}
	} else if (body.function === 'homebrewer') {
		data = {
			status : 'subscribed',
			email_address: email,
			"merge_fields": 
			{
			    "EMSOURCE": body.function,
			    "FNAME" : body.firstname,
			    "LNAME" : body.lastname,
			    "HOMEBREWER" : 'Yes',
			    "FULLNAME" : body.fullname
			}
		}
	} else if (body.function === 'email') {
		data = {
			status : 'subscribed',
			email_address: email
		}
	} else if (body.function === 'homebrewer_vote') {
		data = {
			status : 'subscribed',
			email_address: email,
			"merge_fields": 
			{
			    "EMSOURCE": body.function,
			}
		}
	} else if (body.function === 'registration') {
		data = {
			status : 'subscribed',
			email_address: email,
			"merge_fields": 
			{
			    "EMSOURCE": body.function,
			    "FNAME" : body.firstname,
			    "LNAME" : body.lastname,
			    "FULLNAME" : body.fullname
			}
		}
	} else if (body.function === 'dropahint') {
		data = {
			status : 'subscribed',
			email_address: email,
			"merge_fields": 
			{
			    "EMSOURCE": body.function,
			    "FNAME" : body.firstname,
			    "LNAME" : body.lastname,
			    "DROPAHINT" : 'Yes',
			    "FULLNAME" : body.fullname
			}
		}
	}
}

