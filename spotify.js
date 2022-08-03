  /* Load the HTTP library */
  var http = require("http");

  http.createServer(function(request, response) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World");
    response.end();
  }).listen(8888);

const APIController = (function() {
    const clientId = '';
    const clientSecret ='';
    /* https://www.soapui.org/learn/api/understanding-rest-headers-and-parameters/ */
    //getToken

    const _getToken = async () => {

        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : '',
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret) 
            },
            body: 'grant_type=client_credentials'
        });
        
        const data = await result.json();
        return data.access_token;
    }


    const _getGenres = async () => {

        const result = await fetch('TODO', {
            method: 'GET',
            headers: {
                'Authorization' : 'Bearer ' +  token
            }
        });
        
        const data = await result.json();
        return data.access_token;
    }


})();
  
  /*
  fetch("https://api.spotify.com/v1/audio-analysis/6EJiVf7U0p1BBfs0qqeb1f", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${userAccessToken}`
    }
  })
  .then(response => response.json())
  //
  .then(({beats}) => {
    beats.forEach((beat, index) => {
      console.log(`Beat ${index} starts at ${beat.start}`);
    })
  })
  */