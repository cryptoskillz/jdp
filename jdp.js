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
    var jdpSyntax = [];
    //get the Dom elements
    var elems = document.body.getElementsByTagName("*");
    //this function checks to see if the element contains a reserved word if, else, for
    //note: this function is very much in Dev IE it does not work yet
    function checkElement(statement) {
        //note: we can clean up this process if we ever add more method for 3 it is fine.
        //create the patterns;
        var regexFor = new RegExp(/\b(\w*endfor\w*)\b/);
        var regexIf = new RegExp(/\b(\w*endif\w*)\b/);
        var isFor = regexFor.test(statement);
        if (isFor == true) return ("for")
        else {
            //check if it is an if
            var isIf = regexIf.test(statement);
            if (isIf == true) return ("if")
            else return (false)
        }
    }

    function parseDom(data) {
        //check that we have not processed the HTML
        if (jdpSyntax.length == 0) {
            //get the html element
            var html = document.documentElement.outerHTML
            for (var i = 0; i < html.length; i++) {
                //look for {%
                if ((html.charAt(i) == '{') && (html.charAt(i + 1) == "%")) {
                    //set an exit boolean
                    var exitIt = false;
                    //srt a counter
                    var countIt = 0;
                    //set a var to hold the statement
                    let statement = "";
                    //loop until we hot the exit condition
                    while (exitIt == false) {
                        //checj the counter
                        if (countIt <= 3) {
                            //check we are not at the end
                            if (html.charAt(i) == "%") countIt++;
                        } else exitIt = true
                        //add the statmenet
                        statement = statement + html.charAt(i);
                        //inc the character counter
                        i++;
                    }
                    //add to the syntax array
                    let expression = checkElement(statement);
                    //build the object
                    let tmpObj = {
                        type: "condtion",
                        expression: expression,
                        raw: statement
                    }
                    jdpSyntax.push(tmpObj)
                } else {
                    //look for vars
                    if ((html.charAt(i) == '{') && (html.charAt(i + 1) == "{")) {
                        i = i + 2;
                        //let i2=;
                        let statement = "";
                        while (html.charAt(i) != "}") {
                            statement = statement + html.charAt(i)
                            //i2++;
                            i++;
                        }
                        if (statement != "") {
                            //add to the syntax array
                            let tmpObj = {
                                type: "var",
                                expression: "",
                                raw: statement
                            }
                            jdpSyntax.push(tmpObj)
                        }
                    }
                }
            }
        }
    }
    return {
        refreshDom: function(data) {
            parseDom(data)
            console.log(jdpSyntax)
            return;
            /*
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
            */
        }
    };
})();