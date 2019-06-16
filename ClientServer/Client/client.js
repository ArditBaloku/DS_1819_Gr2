const client = require('dgram').createSocket('udp4');
const fs = require('fs');
const convert = require('xml-js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const publicKey = fs.readFileSync('publickey.pem');
const saltRounds = 10;
const [node, file, command, ...args] = process.argv;

switch(command) {
  case 'register': register(args[0], args[1], args[2], args[3], args[4]);
  break;
  case 'login': login(args[0], args[1]);
  break;
  case 'help': help();
  break;
  default: console.log(`${command} is not a recognized command`);
  break;
}

function register(username, password, id, faculty, average) {
  if(!validate(username, password, id, faculty, average)) {
    console.log('Wrong parameters given');
    process.exit();
  }

  bcrypt.hash(password, saltRounds, function(err, hash) {
    let msg = Buffer
      .from(JSON.stringify({
        request: 'register',
        username,
        password: hash,
        id,
        faculty,
        average}));
    client.send(msg, 3000, 'localhost');
  });

}

function login(username, password) {
  if(!validate(username, password)) {
    console.log('Wrong parameters given');
    process.exit();
  }

  let msg = Buffer.from(JSON.stringify({request: 'login', username, password}));
  client.send(msg, 3000, 'localhost')
}

client.on('error', (err) => {
  console.log(`There was an error connecting:\n` + err.stack);
})

client.on('message', (msg) => {
  const message = JSON.parse(msg.toString('utf8'));
  if(message.type == 'login_ok') {
    jwt.verify(message.info, publicKey, function(err, decoded) {
      if (err) {
        console.log("JWT from the server is invalid");
      }
      else {
        const options = {compact: true, ignoreComment: true, spaces: 2};
        const userInfo = convert.js2xml(decoded, options);
        console.log("JWT is valid, message received:\n" + userInfo)
      }
    });
  } else {
    console.log('Message received:\n' + message.info);
  }
  process.exit();
})

function help() {
  console.log('register [username] [password] [id] [faculty] [average] - Creates a new user account');
  console.log('login [username] [password] - Logs in to an existing account');
  console.log('help - Lists commands');
  process.exit();
}

function validate(...args) {
  for (let i = 0; i < args.length; i++) {
    if(!args[i]) {
      return false;
    }
  }
  return true;
}
