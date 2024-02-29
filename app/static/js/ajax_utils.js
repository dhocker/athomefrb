/*
    AJAX utility functions
    Copyright © 2020, 2022  Dave Hocker (email: AtHomeX10@gmail.com)

    References
    https://javascript.info/async-await
    https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
*/

// import {URL, URLSearchParams} from "url";

// Send methods:
//  PUT: update resource, change its state
//  POST: create new resource
// Returns the fetch response
export async function ajaxSend(sourceURL, method= "PUT", data = null) {
    var args = {
      method: method
    };
    if (data !== null) {
        args["headers"] = {
          'Content-Type': 'application/json'
        };
        const data_to_be_sent = {"data": data};
        args["body"] = JSON.stringify(data_to_be_sent) // body data type must match "Content-Type" header
    }

    // The send request may or may not return something in the form of JSON
    let result = null;
    try {
        const response = await fetch(sourceURL, args);
        if (response.status === 200) {
            result = await response.text();
            if (result !== "") {
                result = JSON.parse(result);
            }
        } else {
            result = null;
        }
    } catch (e) {
        console.log("ajaxSend Exception: " + String(e));
        result = null;
    }

    // The result is either null or an object (dict)
    return result;
}

// Get with optional search arguments
// Returns the JSON payload wrapped in a Promise (must be called by an async function).
// The payload is an object whose key is "data". Thus, data.x will be the
// effective payload. Typically, data.x will be a list/array or an object (JSON).
//
// sourceURL - e.g. "/cpl/album/tracks"
// searchArgList - null, array of search arguments (e.g. album names)
//  or a key/value object of search arguments
export async function ajaxGet(sourceURL, searchArgList = null) {
    let targetURL = new URL(sourceURL, window.location.origin);

    let args = {
      method: "GET"
    };

    // Turn the search arg list into an key/value object
    // Here the key is the array index
    if (searchArgList !== null && Array.isArray(searchArgList)) {
        var search = {};
        for (var i = 0; i < searchArgList.length; i++) {
            search[i] = searchArgList[i];
        }
        targetURL.search = new URLSearchParams(search).toString();
    } else {
        // If the search arg is key/value object (this is far from fool proof)
        // Here the key is the object key
        if (searchArgList !== null && typeof (searchArgList) === "object") {
            targetURL.search = new URLSearchParams(searchArgList).toString();
        }
    }

    let result = null;
    try {
        const response = await fetch(targetURL, args);
        if (response.status === 200) {
            result = await response.json();
            // console.log("ajaxGet result: " + JSON.stringify(result));
        } else {
            result = null;
        }
    } catch (e) {
        console.log("ajaxGet Exception: " + String(e));
        result = null;
    }

    // The result will be wrapped in a Promise
    return result;
}
