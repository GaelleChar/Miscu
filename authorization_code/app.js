/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = '09d1c3abad5446278f3bfba82fd53ce4'; // Your client id
var client_secret = '3108a6923b274c2eabc5711ac6fcf82a'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});


/* 
  Get genres and playlist from user

*/

const APIController = (function() {
    const clientId = '';
    const clientSecret ='';
    /* https://www.soapui.org/learn/api/understanding-rest-headers-and-parameters/ */
    //getToken

    const _getToken = async () => {

        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret) 
            },
            body: 'grant_type=client_credentials'
        });
        
        const data = await result.json();
        return data.access_token;
    }

//pass token
    const _getGenres = async (token) => {
        //browse categories

        const result = await fetch('https://api.spotify.com/v1/browse/categories', {
            method: 'GET',
            headers: {
                'Authorization' : 'Bearer ' +  token
            }
        });
        
        const data = await result.json();
        return data.categories.items;
    }


    const _getPlaylistByGenre = async (token, genreId) => {
        const limit = 10;

        const result = await fetch(`https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`, {
            method: 'GET',
            headers: {
                'Authorization' : 'Bearer ' +  token
            }
        });
        
        const data = await result.json();
        return data.playlists.items;
    }

    return {
        getToken(){
            return _getToken();
        },
        getGenres(){
            return _getGenres(token);
        },
        getPlaylistByGenre(){
            return _getPlaylistByGenre(token, genreId);
        }
    }


})();

//UI Module

const UIController = (function() {

    //hold html selectors
    const DOMElements = {
        selectGenre: `#select_genre`,
        selectPlaylist: `#select_playlist`,

        //TODO: fix html
        buttonSubmit: `#btn_submit`,
        //hfToken = `#hidden_token`
    }
    return {

        InputField(){
            return{
                genre: document.querySelector(DOMElements.selectGenre),
                playlist: document.querySelector(DOMElements.selectPlaylist),
                submit: document.querySelector(DOMElements.buttonSubmit)
            }
        },
        //
        createGenre(text, value){
            const html = `<option value="${value}">${text}</option>`;
            //last child of parent field
            document.querySelector(DOMElements.selectGenre).insertAdjacentHTML('beforeend', html);
        },
        createPlaylist(text, value){
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectPlaylist).insertAdjacentHTML('beforeend', html);
        }

        
    }


})();
  

console.log('Listening on 8888');
app.listen(8888);
