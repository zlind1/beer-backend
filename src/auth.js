const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const CryptoJS = require('crypto-js');

const createSalt = () => {
  return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Base64);
}

const hash = (baseHash, salt) => {
  return CryptoJS.SHA256(baseHash+salt).toString(CryptoJS.enc.Base64);
}

const secret = createSalt();

const createJwtMiddleware = () => {
  return expressJwt({
    secret: secret,
    algorithms: ['HS256'],
    getToken: req => req.cookies.JWT
  });
}

const createJwt = (user) => {
  return jwt.sign({
    userID: user.userid,
    admin: false
  }, secret, {
    expiresIn: 3600
  });
}

const saveCookies = (res, token) => {
  res.cookie('JWT', token, {
    maxAge: 3600000,
    httpOnly: true
  });
  res.cookie('validToken', 'true', {
    maxAge: 3600000,
    sameSite: 'none'
  });
}

const deleteCookies = (res) => {
  res.cookie('JWT', '', {
    maxAge: 0,
    httpOnly: true
  });
  res.cookie('validToken', '', {
    maxAge: 0,
    sameSite: 'none'
  });
}

module.exports = {
  createJwtMiddleware,
  createJwt,
  saveCookies,
  deleteCookies,
  createSalt,
  hash
};
