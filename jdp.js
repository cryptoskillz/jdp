/*

JDP (javascript data processor) is lightweight Dom parser that will take object and replace Dom elements that
match the data in the page.

It is inspired by riot.js, knockout.js and nunjucks with the following differences

It is super light weight, it processes the Dom and replaces vars (that is it)
It has the template data in the same page as the HTML as having a second file to hold it is an unnecessary overhead
It supports the nunjucks syntax and a subset of its command {{var}} {%for %} {%if%} {%else%} to offer client side handlebars processing

The use case is.  

1) Add the vars you want replace to the HTML file
2) Make an AJAX call
3) process the Dom and replace vars with the data in the ajax result


to-do
process for
process if
process else

*/
var jdp = (function() {
    //get the Dom elements
    var elems = document.body.getElementsByTagName("*");
    //this function checks to see if the element contains a reserved word if, else, for
    //note: this function is very much in Dev IE it does not work yet
    function checkElement(elementObj) {
        //create the patterns;
        var regexBrackets = new RegExp('\{%([^)]+)\%}');
        var regexFor = new RegExp(/\b(\w*for\w*)\b/);
        //look for a bracket {% to %}
        var isBracket = regexBrackets.test(elementObj.innerText);
        if (isBracket == true) {
            //now we found a bracket lets see if we can match it against a reserved word
            var isFor = regexFor.test(elementObj.innerText);
            //debug
            //console.log("isFor");
            //console.log(isFor);
            if (isFor == true) {
                //to-do: process for
                return (true)
            } else {
                //it is not a for loop so check or an if
                //to-do: process if 
                return (false);
            }
        } else {
            //it had no brackets do we do not care about it at this point
            return (false)
        }
        //return (false);
    }
    //this function replaces the place holder {{var}} with the data in the results obj
    function replacePlaceHolder(elementObj, theElement, data) {
        //loop throoguh the data element
        for (var i = 0; i < data.length; i++) {
            //get the data obj we are looking to replace
            var dataObj = data[i]
            //loop through the key value pairs
            for (var key in dataObj) {
                //check we have a key
                if (dataObj.hasOwnProperty(key)) {
                    //debug
                    //console.log(key + " -> " + dataObj[key]);
                    //check if the key matches what is in the element text
                    if (elementObj.text == '{{' + key + '}}') {
                        //set the value
                        theElement.innerText = dataObj[key];
                        //if it is hidden (which it always should be) display it
                        if (theElement.style.display === 'none') {
                            theElement.style.display = "block";
                        }
                    }
                }
            }
        }
    }
    //this function process the element and puts it into an object
    function processElement(theElement) {
        //get the object
        var obj = {}
        //get the inner text and store it as is
        obj.innerText = theElement.innerText;
        //get the inner text and trim it
        obj.text = theElement.innerText.replace(/^\s+|\s+$/g, "").toString();
        //get the taganme and make it lowercase to make it easier to use
        obj.tagname = theElement.tagName.toLowerCase();
        return (obj);
    }
    return {
        refreshDom: function(data) {
            //loop through them
            for (var i = 0; i < elems.length; i++) {
                //process the element
                var elementObj = processElement(elems[i]);
                //debug
                //console.log(elementObj)
                var res = checkElement(elementObj);
                //if we did not find a reserved word we just want to process it as normal
                console.log(res)
                if (res == false) {
                    replacePlaceHolder(elementObj, elems[i], data)
                }
            }
        }
    };
})();