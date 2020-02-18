let FILE_STRING; 
const LEVEL_SERVICE_URL = "http://localhost:5000/static/" 
const LEVEL_FILE_NAME = "test.txt";


function loadFile() {
  var result = null;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.addEventListener('load', interpretFile);
  xmlhttp.open("GET", LEVEL_SERVICE_URL + LEVEL_FILE_NAME, false);
  xmlhttp.send();
  // if (xmlhttp.status==200) {
  //   result = xmlhttp.responseText;
  // }

}
function interpretFile() {
  console.log(this.responseText);
}

