if(!NWC){
    var NWC = {};
}
/**
  * function to load a given css file 
  */ 
 NWC.loadCSS = function(href) {
     //check to see if the stylesheet has already been loaded
     var existingLink = $("link[href='" + href + "']");
     if(!existingLink.length){
         var cssLink = $("<link rel='stylesheet' type='text/css' href='"+href+"'>");
        $("head").append(cssLink); 
     }
 };
