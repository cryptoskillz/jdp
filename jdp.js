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
    //get the html element
    var html = document.documentElement.outerHTML
    //get the Dom elements
    var elems = document.body.getElementsByTagName("*");
    //this function checks to see if the element contains a reserved word if, else, for
    //note: this function is very much in Dev IE it does not work yet
    function checkElement(elementObj) {
        //note: we can clean up this process if we ever add more method for 3 it is fine.
        //create the patterns;
        var regexBrackets = new RegExp('\{%([^)]+)\%}');
        var regexFor = new RegExp(/\b(\w*for\w*)\b/);
        var regexIf = new RegExp(/\b(\w*if\w*)\b/);
        var regexElse = new RegExp(/\b(\w*else\w*)\b/);
        //look for a bracket {% to %}
        var isBracket = regexBrackets.test(elementObj.innerText);
        if (isBracket == true) {
            //now we found a bracket lets see if we can match it against a reserved word
            var isFor = regexFor.test(elementObj.innerText);
            if (isFor == true) return ("for")
            else {
                //check if it is an if
                var isIf = regexIf.test(elementObj.innerText);
                if (isIf == true) return ("if")
                else return (false)
            }
        } else return (false);
    }

    function replacePlaceHolderHTML(html, dataObj) {
        //loop through the key value pairs
        for (var key in dataObj) {
            //check we have a key
            if (dataObj.hasOwnProperty(key)) html = html.replace("{{" + key + "}}", dataObj[key])
        }
        return (html)
    }
    //this function replaces the place holder {{var}} with the data in the results obj
    function replacePlaceHolderData(elementObj, theElement, data) {
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
        //get the innet html 
        obj.innerHTML = theElement.innerHTML;
        //get the inner text and trim it
        obj.text = theElement.innerText.replace(/^\s+|\s+$/g, "").toString();
        //get the taganme and make it lowercase to make it easier to use
        obj.tagname = theElement.tagName.toLowerCase();
        return (obj);
    }

    function processFor(elementObj, theElement, data) {
        /*
        grab all the data between the for and the end for.
        Note:   as we have a really simple for loop here we can make all sorts of assumpations that allow us to 
                code it in a realtively simple way.  We assume it is for item in array as that is all we support 
                at present.  In the future as we make this a more functiom, rangers, increment counters etc we 
                will remove these assumpations
        */
        //get the data between the for and the end for
        var re = /(.*%}\s+)(.*)(\s+{% endfor %}.*)/;
        //replace it
        var tmpHtml = elementObj.innerHTML.replace(re, "$2");
        //replace and item. (again assumpations)
        tmpHtml = tmpHtml.replace(/item./g, "");
        //empty the innerHTML as we are going to replace it.
        //note: we will have to update this as we want to keep this HTML for soft refreh's
        elementObj.innerHTML = "";
        for (var i = 0; i < data.length; i++) {
            //get the data obj we are looking to replace
            var dataObj = data[i];
            var html = replacePlaceHolderHTML(tmpHtml, dataObj)
            elementObj.innerHTML = elementObj.innerHTML + html;
        }
        if ((theElement.style.display === 'none') && elementObj.innerHTML != "") {
            theElement.innerHTML = elementObj.innerHTML;
            theElement.style.display = "block";
        }
    }

    function processIf(elementObj, theElement, data) {
        //console.log(elementObj)
        //get the data between the if statement
        var re = /(.*{% if\s+)(.*)(\s+%}.*)/;
        var toChar = /^(.*?)%}/
        //get the if statement
        //note: this can be cleaner
        //let result0 = elementObj.innerHTML.match(/(.*{% if\s+)(.*)(\s+%}.*)/);
        let result = elementObj.innerHTML.match(/.+?(?=\%})/);
        //get the first result
        var ifStatement = result[0].trim();
        //remove the junk
        ifStatement = ifStatement.replace("{% endif", "");
        ifStatement = ifStatement.replace("{%", "");
        console.log(ifStatement);
    }

    function parseDom(data) {
        for (var i = 0; i < html.length; i++) {

            //look for {%
            if ((html.charAt(i) == '{') && (html.charAt(i+1) == "%")) {
                //it is a for or an if
                while (html.charAt(i) != "}") {
                    let statement="";
                    while (html.charAt(i) != "}") {
                        statement=statement+html.charAt(i)
                        //i2++;
                        i++;
                    }
                    if (statement != "")
                    {
                        //check if it is a for or an if
                        console.log(i)
                        console.log(statement)
                    }
                }
            }
            else
            {
                //look for vars
                if ((html.charAt(i) == '{') && (html.charAt(i+1) == "{")) {
                    i=i+2;
                    //let i2=;
                    let statement="";
                    console.log('in')
                    while (html.charAt(i) != "}") {
                        statement=statement+html.charAt(i)
                        //i2++;
                        i++;
                    }
                    if (statement != "")
                    {
                        console.log(i)
                        console.log(statement)
                    }
                }
                //console.log(html.charAt(i));
            }

            
        }
    }
    return {
        refreshDom: function(data) {
            parseDom(data)
            return;
            //loop through them
            for (var i = 0; i < elems.length; i++) {
                //process the element
                var elementObj = processElement(elems[i]);
                var res = checkElement(elementObj);
                //if we did not find a reserved word we just want to process it as normal
                if (res == false) {
                    replacePlaceHolderData(elementObj, elems[i], data)
                } else {
                    //process the commands
                    switch (res) {
                        case "for":
                            processFor(elementObj, elems[i], data)
                            break;
                        case "if":
                            processIf(elementObj, elems[i], data)
                            break;
                        default:
                            break;
                    }
                }
            }
        }
    };
})();