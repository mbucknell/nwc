if(!NWC){
    var NWC = {};
}
/**
  * function to load a given css file 
  */ 
 NWC.loadCSS = function(href) {
     var cssLink = $("<link rel='stylesheet' type='text/css' href='"+href+"'>");
     $("head").append(cssLink); 
 };
