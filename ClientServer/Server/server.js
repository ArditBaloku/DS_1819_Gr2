const server = require('dgram').createSocket('udp4');
const fs = require('fs');
const bcrypt = require('bcrypt');
const convert = require('xml-js');
const jwt = require('jsonwebtoken');
const privateKey = fs.readFileSync('private.key');

server.bind(3000);

server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  msg = JSON.parse(msg);
  switch(msg.request) {
    case 'register': createUser(msg, rinfo);
    break;
    case 'login': authenticate(msg, rinfo);
    break;
    default: server.send(Buffer.from(JSON.stringify({type: 'err', info: 'ERROR'})), rinfo.port, rinfo.address);
    break;
  }
});

function createUser(user, rinfo) {
  delete user['request'];
  let xmlDb = fs.readFileSync('database.xml', (err, data) => {
    if (err) console.log(err.stack);
  }).toString();

  const options = {compact: true, ignoreComment: true, spaces: 2};
  let jsonDb = convert.xml2js(xmlDb, options);
  const users = toArray(jsonDb.db.user);
  const usernames = users.map(u => u.username._text);

  for (let i = 0; i < usernames.length; i++) {
    if (usernames[i] == user.username) {
      server.send(Buffer.from(JSON.stringify({type: 'register_err', info: 'USERNAME ALREADY EXISTS'})), rinfo.port, rinfo.address);
      return;
    }
  }

  users.push(user);
  jsonDb.db.user = users;
  xmlDb = convert.js2xml(jsonDb, options);

  fs.writeFile("database.xml", xmlDb, (err) => {
    if (err) {
      server.send(Buffer.from(JSON.stringify({type: 'register_err', info: 'ERROR IN USER CREATION'})), rinfo.port, rinfo.address);
      return;
    }
  });
  server.send(Buffer.from(JSON.stringify({type: 'register_ok', info: 'USER CREATED'})), rinfo.port, rinfo.address);
}

function authenticate(user, rinfo) {
  const xmlDb = fs.readFileSync('database.xml', (err, data) => {
    if (err) console.log(err.stack);
  }).toString();

  const options = {compact: true, ignoreComment: true, spaces: 2};
  const jsonDb = convert.xml2js(xmlDb, options);

  const users = toArray(jsonDb.db.user);
  const usernames = users.map(u => u.username._text);
  const passwords = users.map(u => u.password._text);
  for (let i = 0; i < usernames.length; i++) {
    if (usernames[i] == user.username) {
      bcrypt.compare(user.password, passwords[i], function(err, res) {
        if (res) {
          delete users[i].password;
          const token = jwt.sign(users[i], privateKey, {algorithm: 'RS256'});
          server.send(Buffer.from(JSON.stringify({type: 'login_ok', info: token})), rinfo.port, rinfo.address);
        }
        else {
          server.send(Buffer.from(JSON.stringify({type: 'login_err', info: 'WRONG USERNAME OR PASSWORD'})), rinfo.port, rinfo.address);
        }
      });
      return;
    }
  }

  server.send(Buffer.from(JSON.stringify({type: 'login_err', info: 'WRONG USERNAME OR PASSWORD'})), rinfo.port, rinfo.address);
}

function toArray(arg) {
  if (Array.isArray(arg)) {
    return arg
  } else if (typeof arg !== 'undefined') {
    return [arg]
  } else {
    return []
  }
}
