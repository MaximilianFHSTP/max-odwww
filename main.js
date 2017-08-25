/****************
*
* set up socket connection
*
*****************/
// TODO: check url
var socket = io('http://91.219.68.225/');
  socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
  });

/****************
*
* TODO: dynamic load of lookuptable, when registered
*
*****************/
var lookuptable = { 'exhibits' :
  [{
    'ID' : 'CFra',
    'type' : 'onExhibit',
    'major' : 10,
    'minor' : 100,
    'name' : 'Kerstin on'
  },{
    'ID' : 'eGQg',
    'type' : 'atExhibit',
    'major' : 10,
    'minor' : 101,
    'name' : 'Kerstin at'
  },{
    'ID' : 'IfGo',
    'type' : 'atExhibit',
    'major' : 10,
    'minor' : 1002,
    'name' : 'Stud Assi at'
  },{
    'ID' : 'FT45',
    'type' : 'atExhibit',
    'major' : 10,
    'minor' : 1000,
    'name' : 'Flo at'
  },{
    'ID' : 'D7Oj',
    'type' : 'atExhibit',
    'major' : 10,
    'minor' : 1001,
    'name' : 'Drucker at'
  },{
    'ID' : '7N9p',
    'type' : 'atExhibit',
    'major' : 10,
    'minor' : 10,
    'name' : 'Door office 1'
  }]
};
localStorage.setItem('lookuptable', JSON.stringify(lookuptable));

// UI elements
var headline = $("#headline");
var locationHeading =$("#location");

// handles new location
// gets major and minor of beacon in an array
// sets new location
function update_location(beacon){
  var lookuptable =  JSON.parse(localStorage.getItem('lookuptable'));

  var myexhibit;
  for(var i=0 ; i < lookuptable.exhibits.length ; i++){
      if (lookuptable.exhibits[i]['minor'] == beacon['minor']){
          myexhibit = lookuptable.exhibits[i];
      }
  }

  locationHeading.text(myexhibit.name);
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

if(web){
  webdevtools.show();
}

var testbeacon = {'major' : 10, 'minor' : 1002};

webdevtools.click(function() {
  update_location(testbeacon);
});


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
