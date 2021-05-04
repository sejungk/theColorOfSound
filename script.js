 $.ajax({
          url: 'colornames.json',
          dataType: 'json',
          success: function(data) 
          {
            $.each(data, function (index, value) {
                // var random = Math.floor(Math.random() * 10000);
                // for (index = random; index < 100; index++){
                  // index = random;
                  // if (index > 0 && index < 1000){
                    if (index > 0 && index < 100){
                       $('.div-wrapper').append(
                         // '<div class = "song-wrapper" onClick="getColor(this)">' + 
                        '<div class = "song-wrapper" onmouseover="getColor(this)">' + 
                          '<a href = playlist.html></a>' +
                            '<div class="song-container">' +
                              '<div class = "color"></div>' +
                              '<div class = "color-name-wrapper">' +
                                '<p class = "color-name">'+ value.name +'</p>' +
                                '<p class = "color-hex">'+ value.hex +'</p>' +
                            '</div>' +
                          '</div>' +
                        '</div>')
                    }
                });
                $(".song-wrapper").click(function() {
                window.location = $(this).find("a").attr("href"); 
                return false;
              })
          }
})//end of ajax call

//add playlist color
function changeBackgroundColor() {
$('.div-wrapper').find('.song-container').each(function(){
    var hexCode = $(this).find('.color-hex')[0].innerHTML;
    $(this).find('.color').css('background-color', hexCode);
    });
}

$( document ).ajaxComplete(function() {
  changeBackgroundColor();
});

//SECOND PLAYLIST PAGE ==================================================
// if( window.innerWidth < 450 ) {
//     var heart = document.getElementsByClassName('fa');
//     var heart2 = document.getElementsByClassName('fa-heart');
//     var i = document.getElementsByClassName('fa-heart');
//         if (heart.length > 0) {
//             heart.remove();
//             heart2.remove();
//             $('i').remove();
//             // var elem = document.getElementsByClassName("fa");
//             $('div').remove();
//     }  
// $("#div1").remove();
// $("div.fa").remove();

// }

var redirect_uri = "https://localhost/log/playlist.html";
const client_id = 'fda5ec67523545f18b96a159dee8702b';
const client_secret = 'f64d5ec6866546659b08464bdb17307e';
var userId;

var access_token = null;
var refresh_token = null;
var allGenres = [];
var genres = [];
var randomGenre = [];

const RECOMMENDATIONS = "https://api.spotify.com/v1/recommendations?";
const AUTHORIZE = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";
const GENRES = "https://api.spotify.com/v1/recommendations/available-genre-seeds";
const USER = "https://api.spotify.com/v1/me";
const PLAYLIST = "https://api.spotify.com/v1/users/" + localStorage.getItem('userId') + "/playlists"
var URL;
var newPlaylistId;

//#1
//fetches client id/secret from id value
//stores to localstorage for local use
function requestAuthorization(){
//#2
//build url to redirect to
    let url = AUTHORIZE;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&show_dialog=true"
    url += "&scope=user-read-private user-read-email user-modify-playback-state streaming user-read-playback-state playlist-modify-private playlist-modify-public playlist-read-private";
    window.location.href = url; // Show Spotify's authorization screen
}

//#4
//identify are we being redirected with a code or is it the first time loading?
//if url has query params (key pairs to the right of ?) call handledirect
function onPageLoad(){
    if ( window.location.search.length > 0 ){
        handleRedirect();
    }
    else{
        access_token = localStorage.getItem("access_token");
        if ( access_token == null ){
            requestAuthorization();
        }
        else {
            getGenres();
            setPlaylistBg(); 
            showUser();
            // makePlaylist();
        }
    }
}

//#5
//look for and parse the code from the url
//call getCode which parses url
function handleRedirect(){
    let code = getCode();
    fetchAccessToken( code );
    //clear from redirect url so its clean when it refreshes
    window.history.pushState("", "", redirect_uri); // remove param from url
}

//#6 
//getCode grabs query string and checks that data is there.
//After search for param "code"
function getCode(){
    let code = null;
    //grab query string
    const queryString = window.location.search;
    //make sure theres data there and search for the param "code"
    if ( queryString.length > 0 ){
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get('code')
    }
    return code;
}

//#7
//fetch access token with https://accounts.spotify.com/api/ and json body with grant type, code, and redirect uri
function fetchAccessToken( code ){
    let body = "grant_type=authorization_code";
    body += "&code=" + code; 
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret;
    callAuthorizationApi(body);
}

//#8 make API call and response will by handled by handleAuthorizationResponse
function callAuthorizationApi(body){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ":" + client_secret));
    xhr.send(body);
    xhr.onload = handleAuthorizationResponse;
}

// #9
function handleAuthorizationResponse(){
    if ( this.status == 200 ){
        //parse json and console log for debugging
        var data = JSON.parse(this.responseText);
        // console.log(data);
        var data = JSON.parse(this.responseText);

        //did we get access token? If yes, save to local storage
        if ( data.access_token != undefined ){
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
        }

        //did we get refresh token? If yes, save to local storage
        if ( data.refresh_token  != undefined ){
            refresh_token = data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        }
        onPageLoad();
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function getGenres() {
    callApi( "GET", GENRES, null, handleGenresResponse );
}

function handleGenresResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        allGenres.push(data.genres);
        var firstGenre = allGenres[0];
        firstGenre.splice(9, 7); 
        firstGenre.splice(12, 1); 
        firstGenre.splice(14, 5); 
        firstGenre.splice(15, 5); 
        firstGenre.splice(18, 9); 
        firstGenre.splice(26, 5); 
        firstGenre.splice(28, 6); 
        firstGenre.splice(29, 6); 
        firstGenre.splice(32, 7); 
        firstGenre.splice(30, 1); 
        firstGenre.splice(32, 1); 
        firstGenre.splice(35, 1); 
        firstGenre.splice(50, 8); 
        firstGenre.splice(52, 1); 
        firstGenre.splice(54, 7); 
        firstGenre.splice(5, 1);
        firstGenre.splice(35, 2);
        firstGenre.splice(1, 1);
        firstGenre.splice(38, 2);
        firstGenre.splice(41, 1);
        firstGenre.splice(5, 1);
        firstGenre.splice(19, 2);
        firstGenre.splice(11, 1);

        genres.push(firstGenre);
        // console.log(genres);
        // var secondGenre = allGenres[1];
        // console.log(secondGenre);
        for ( i = 0; i < 5; i++ ) {
        var random = allGenres[0][Math.floor(Math.random()*allGenres[0].length)];
        randomGenre.push(random);
        // console.log(randomGenre);

        //save playlist
        let genresString = randomGenre.join();
        localStorage.setItem('currentGenres', genresString);
        }
    }
    else if ( this.status == 401 ){
        refreshAccessToken();
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
    recommendationUrl();
}

var bgColor;
var finalColor;
var colorName;
var setColorName;
var rgbString;
var r;
var g;
var b;
var hsl;
var h;
var s;
var l;
// change text/background color to match selected playlist 
function getColor(elem) {
    bgColor = $(elem).find(".color").css('background-color');
    colorName = $(elem).find(".color-name")[0].innerHTML;
    localStorage.setItem('bgColor', bgColor);
    localStorage.setItem('colorName', colorName);
    // rgbString = bgColor.substring(3);
    rgbString = bgColor.replace(/[^\d,]/g, '').split(',');
    r = rgbString[0];
    g = rgbString[1];
    b = rgbString[2];
    rgbToHsl(r, g, b);
}

function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    // return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)];
    hsl = [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)];
    h = hsl[0];
    s = hsl[1];
    l = hsl[2];
    localStorage.setItem('h', h);
    localStorage.setItem('s', s);
    localStorage.setItem('l', l);
    console.log (s);
}

var values = {};
var audioFeatures;
var l = localStorage.getItem('l');
var h = localStorage.getItem('h');
var s = localStorage.getItem('s');
var target_energy = (s / 100);
var max_energy = 1;
var min_energy = 0;    
var target_key = 7;
var min_loudness = -40;
var max_loudness = 0;
var target_loudness = -1 * ( localStorage.getItem('l') / (5/3) );
var target_mode = 0;

function recommendationUrl() {
    var limit = 25;

    if ( h > 309 && h < 355) {
        randomGenre.splice(0, 1);
        randomGenre.push("romantic");
    }
    if ( s < 40) {
        randomGenre.splice(0, 1);
        randomGenre.push("sad");
    }
    if (s < 10) {
        randomGenre.splice(0, 2);
        randomGenre.push("indie");
        randomGenre.push("grunge");
    }
     if ( s < 10 && l < 30) {
        randomGenre.splice(0, 3);
        randomGenre.push("black-metal");
        randomGenre.push("heavy-metal");
        randomGenre.push("metalcore");
    }
    if (l > 80 && s < 50 && h > 180 && h < 240) {
        randomGenre.splice(0, 3);
        randomGenre.push("blues");
        randomGenre.push("chill");
        randomGenre.push("rainy-day");
    }
    if (h > 340) {
        randomGenre.splice(0, 2);
        randomGenre.push("work-out");
        randomGenre.push("power-pop");
    }
    if (h > 50 && h < 75 && s > 70) {
        randomGenre.splice(0, 2);
        randomGenre.push("summer");
        randomGenre.push("happy");
    }
    if (l > 85) {
        randomGenre.splice(0, 1);
        randomGenre.push("acoustic");
    }
    if (s == 100 && l > 48) {
        randomGenre.splice(0, 1);
        randomGenre.push("pop");
    }

console.log(randomGenre);
    var seed_genres = randomGenre;
    target_energy = ('values', s / 100);
    // target_energy = ('values', target_energy);
    max_energy = ('values', 1);
    min_energy = ('values', 0);    
    target_key = ('values', 7);
    min_loudness = ('values', -40);
    max_loudness = ('values', 0);
     target_loudness =('values', -1 * ( l / (5/3) ));
    // target_loudness =('values', -1 * ( localStorage.getItem('l') / (5/3) ));
    // target_loudness = ('values', target_loudness);
    target_mode = ('values', 0);

    // console.log(target_energy);
    if (target_energy < .96){
        values['max_energy'] = target_energy + .05
    }
    if (target_energy > .04){
        values['min_energy'] = target_energy - .05
    }
    if (l < 50) {
        values['target_mode'] = 0.0;
    }
    if (l > 49) {
       values['target_mode'] = 1.0;
    }

    //assigning key of songs by color
    if (h > 355 && h < 10) {
        values['target_key'] = 0;
    }
    if (h > 11 && h < 20) {
        values['target_key'] = 8;
    }
    if (h > 21 && h < 40) {
        values['target_key'] = 7;
    }
    if (h > 41 && h < 50) {
        values['target_key'] = 2;
    }
    if (h > 61 && h < 80) {
        values['target_key'] = 3;
    }
    if (h > 81 && h < 140) {
        values['target_key'] = 4;
    }
    if (h > 141 && h < 169) {
        values['target_key'] = 4;
    }
    if (h > 170 && h < 200){
        values['target_key'] = 6;
    }
    if (h > 201 && h < 220) {
        values['target_key'] = 5;
    }
    if (h > 221 && h < 240) {
        values['target_key'] = 11;
    }
    if (h > 241 && h < 280) {
        values['target_key'] = 9;
    }
    if (h > 281 && h < 320) {
        values['target_key'] = 9;
    }
    if (h > 321 && h < 330) {
        values['target_key'] = 10;
    }
    if (h > 331 && h < 345) {
        values['target_key'] = 1;   
    }
    if (h > 346 && h < 355) {
        values['target_key'] = 0;
    }

    URL = RECOMMENDATIONS;
    URL += "limit=" + limit;
    URL += "&seed_genres=" + seed_genres;
    URL += "&max_energy=" + max_energy;
    URL += "&min_energy=" + min_energy;
    URL += "&target_energy=" + target_energy;
    URL += "&target_key=" + target_key;
    URL += "&min_loudness=" + min_loudness;
    URL += "&max_loudness=" + max_loudness;
    URL += "&target_loudness=" + target_loudness;
    URL += "&target_mode=" + target_mode;
    URL += "&target_valence=" + target_energy;
    getRecommendations();
}


// #10 api call to get recommendation list
function getRecommendations(){
    callApi( "GET", URL, null, handleRecommendationsResponse );
}
var trackIds = [];
var trackUris = [];
function handleRecommendationsResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);

        if(data.tracks) {
          if(data.tracks.length > 0) {
            data.tracks.forEach(function(track) {
              trackIds.push(track.id);
              trackUris.push(track.uri);
            });

            localStorage.setItem('saveTracks', trackUris.join());
            // console.log(trackIds);
          }
        }
        //removes preexisting items
        removeAllItems( "song-list" );

        //for each device item add html element with addDevice function
        data.tracks.forEach( (item, index) => addTrack(item, index));
    }
    else if ( this.status == 401 ){
        refreshAccessToken();
    }
    else {
        console.log(this.responseText);
    }
}

console.log()
//save playlist
var payload = {
  "name": localStorage.getItem('colorName'),
  "description": "Track Audio Features: " + "Target Energy: " + target_energy + ", Target Loudness: " + target_energy + ", Target Mode: " + target_mode + ", Target Valence: " + target_energy, 
  "public": false
}

var name = (JSON.stringify(payload));
var songIds = localStorage.getItem('saveTracks');
songIds = encodeURIComponent(songIds);
// console.log(songIds);

function makePlaylist() {
   return fetch(PLAYLIST,
    {
      headers: {Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json'},
      method: 'POST',
      body: name
    }).then((response) => {
        getPlaylists();

    })
}

var playlistUrl;
var allPlaylistNames = "https://api.spotify.com/v1/users/" + localStorage.getItem('userId') + "/playlists"

function getPlaylists() {
    callApi( "GET", allPlaylistNames, null, getNewPlaylistId)
}

function getNewPlaylistId() {
     if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        // localStorage.setItem('userId', data.id);
        // userId = localStorage.getItem('userId');
        // userId = data.id;
        console.log(data);
        newPlaylistId = data.items[0].id;
        console.log(newPlaylistId);
    }
    playlistUrl = "https://api.spotify.com/v1/playlists/" + newPlaylistId + "/tracks";
    addNewSongs();
}

function addNewSongs() {

     return fetch(playlistUrl + "?uris=" + songIds,
    {
      headers: {Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json'},
      method: 'POST',
    })
}

function showUser() {
    callApi( "GET", USER, null, getUsers)
}

function getUsers(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        localStorage.setItem('userId', data.id);
        userId = localStorage.getItem('userId');
        // userId = data.id;
        // console.log(userId);
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

// #11 call function that was passed into here handleDevicesResponse
function callApi(method, url, body, callback){
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
    xhr.send(body);
    xhr.onload = callback;
}    

function setPlaylistBg() {

    finalColor = localStorage.getItem('bgColor');
    setColorName = localStorage.getItem('colorName');
    $(".playlist-wrapper").css("background-color", finalColor);
    $("h1").html(setColorName);

}
// #12 401 means access token has expired and needs to be refreshed
// else display any errors

function addTrack(item, index){
    let div = document.createElement('div');
    div.classList.add('song-item');
    div.value = index;
    var songName = item.name;
    var artistName = item.artists[0].name;
    var albumTitle = item.album.name;
    var songTime = item.duration_ms;
    var albumCover = item.album.images[0].url;
   
   //change milli to mins
    var minutes = Math.floor(songTime / 60000);
    var seconds = ((songTime % 60000) / 1000).toFixed(0);
    var time = minutes + ":" + (seconds < 10 ? '0' : '') + seconds;

  //truncate names
    if (songName.length > 40) {
      songName = songName.substring(0, 39) + "...";
    }
    if (artistName.length > 30) {
      artistName = artistName.substring(0, 29) + "...";
    }
     if (albumTitle.length > 30) {
      albumTitle = albumTitle.substring(0, 29) + "...";
    }

    // create track numbers
    var i = index + 1;
       if (i < 10) {
        i = "0" + i;
        }; 

    appendSongInfo();

    function appendSongInfo() {
         $(div).append(
        '<div class = "track-num">' + i + '</div>' + 
        '<i class="heart"></i>' +
        '<div class="song-title">' + songName + '</div>' + 
        '<div class="song-artist">' + artistName + '</div>' +
        '<div class="song-album">' + albumTitle + '</div>' + 
        '<div class="song-time">' + time + '</div>');
        document.getElementById("song-list").appendChild(div); 

    //change song labels to white
    var l = localStorage.getItem('l');
        if (l < 50) {
            var labelText = document.getElementsByClassName("song-info");
            $(labelText).css('color', 'white');

        }
    }
// });


        $('.save-button').on('click',function(){
        if($(this).attr('data-click-state') == 1) {
        $(this).attr('data-click-state', 0)
        $(this).css('color', 'black')
        $(this).css('background-color', 'transparent')
        $(this).css('mix-blend-mode', 'normal')
        $(this).css('border', 'solid')
        $(this).text('Save')
        } else {
        $(this).attr('data-click-state', 1)
        $(this).css('background-color', 'white')
        $(this).css('mix-blend-mode', 'exclusion')
        $(this).css('border', '0')
        $(this).text('Saved')
        }

    });     

    //toggle between songs and albums
    $('ul.tab-links li').click(function(){
            var tab_id = $(this).attr('data-tab');

            $('ul.tab-links li').removeClass('current');
            $('.tab-content').removeClass('current');

            $(this).addClass('current');
            $("#"+tab_id).addClass('current');
        })

    //add album covers
    $('.album-list').append('<img class = "album-cover" src=' + albumCover + ' alt=' + albumTitle + '>')
//close function
}

//#14 refresh token when it expires (expires every hour)
function refreshAccessToken(){
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_id;
    callAuthorizationApi(body);
}

//clears list so items arent being added on top of eachother
function removeAllItems( elementId ){
    let div = document.getElementById(elementId);
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
}

