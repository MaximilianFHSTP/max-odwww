/****************
*
* set up socket connection
*
*****************/
// TODO: check url
var socket = io('http://god.meeteux.fhstp.ac.at/');

socket.on('registerODResult', function (data) {
    console.log('registerODResult');
    console.log(data);

    // get lookuptable back and store as exhibits in local storage
    var lookuptable = {'exhibits' : data};
    localStorage.setItem('lookuptable', JSON.stringify(lookuptable));
});

socket.on('registerLocationResult', function (data) {
    console.log('registerLocationResult');
    console.log(data);

    // TODO: save currentlocaction in localStorage - only possible at this point, if I know the exhibit ID
    /*localStorage.setItem('currentExhibit', JSON.stringify(myexhibit));
    locationHeading.text(myexhibit.description);*/
});

// UI elements
var headline = $("#headline");
var locationHeading =$("#location");

// handles new location
// gets major and minor of beacon in an array
// sets new location
function update_location(beacon){
  var myexhibit = get_exhibit_by_id(beacon['minor']);

  socket.emit('registerLocation', {user: 1, location: myexhibit.id});

  // TODO set in god response
  localStorage.setItem('currentExhibit', JSON.stringify(myexhibit));
  locationHeading.text(myexhibit.description);
}

// handles new location
// gets major and minor of beacon in an array
// sets new location
function register_od(deviceinfo){
  // deviceinfo['']
  socket.emit('registerOD', 'Niklas');
}

function get_exhibit_by_id(exhibitId){
  var lookuptable =  JSON.parse(localStorage.getItem('lookuptable'));
  for(var i=0 ; i < lookuptable.exhibits.length ; i++){
      if (lookuptable.exhibits[i]['id'] == exhibitId){
          myexhibit = lookuptable.exhibits[i];
      }
  }
  return myexhibit;
}

/****************
*
* Developer tools in web browser (Chrome, Safari)
*
*****************/

// Check if web browser or native web view
var userAgent = window.navigator.userAgent.toLowerCase(),
    safari = /safari/.test( userAgent ),
    //ios = /iphone|ipod|ipad/.test( userAgent ),
    chrome = /chrome/.test( userAgent );
var web = false;

//TODO: check for android native view
if(safari || chrome){
  console.log("you are in web browser");
  web = true;
}
var webdevtools = $("#webdevtools");
var registerODButton = $("#registerOD");
var sendBeaconInfoButton = $("#sendBeaconInfo");

if(web){
  webdevtools.show();
}

var testbeacon = {'major' : 10, 'minor' : 1002};
var testdevice = {'id' : 1, 'device' : 'iPhone', 'os' : 'OS10'}

sendBeaconInfoButton.click(function() {
  update_location(testbeacon);
});

registerODButton.click(function(){
  register_od(testdevice);
})


/****************
*
* Testfunctions if connection between web and native is working
*
*****************/
// be aware of upper and lower case --> case insensitive: only lower case is allowed for functionnames

// testfunction for calling native
// only parameter is possible for communicating between native and web
function set_headline(text){
  headline.text(text);
}

// testfunction for calling native
function call_native(){
  set_headline("asked for ");
  window.webkit.messageHandlers.observe.postMessage("hello");
}

setTimeout(call_native, 1000);


/*
var socket = io.connect('http://god.meeteux.fhstp.ac.at');
    socket.on('news', function (data) {
        console.log(data);
        socket.emit('registerOD', 'Niklas');
        socket.emit('registerLocation', {user: 1, location: 1, type: 1});

        socket.on('registerODResult', function (data) {
            console.log(data);
        });

        socket.on('registerLocationResult', function (data) {
            console.log(data);
        });
    });
    */
