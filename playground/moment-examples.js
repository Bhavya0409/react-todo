var moment = require('moment');

console.log(moment().format());

var now = moment();

console.log('Current Time Stamp: ', now.unix());

var timestamp = 1475247210;
var currentMoment = moment.unix(timestamp);

console.log('current Moment: ', currentMoment.format('MMMM Do, YYYY @ hh:mm:ss A'));
