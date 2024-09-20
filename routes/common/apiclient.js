'use strict';   

const request = require("request");

///////////////////////////////////////////////////////////////////////
/// Call the Rest API
///////////////////////////////////////////////////////////////////////
function apiClientCallAsync( requestMethod, url,  access_token, body=null ){
    return new Promise(function (resolve, reject) {

        var options = null;
        switch (requestMethod.toLowerCase()) {
            case 'get':
                options = {
                    method: requestMethod,
                    url: url,
                    headers: {
                        Authorization: 'Bearer ' + access_token,
                        'Content-Type': 'application/json'
                    }
                };
                break;
            case 'post':
            case 'patch':
                options = {
                    method: requestMethod,
                    url: url,
                    headers: {
                        Authorization: 'Bearer ' + access_token,
                        'Content-Type': 'application/json'
                    },
                    body: body
                    //json: true
                };
                break;
            case 'delete':
                options = {
                    method: requestMethod,
                    url: url,
                    headers: {
                        Authorization: 'Bearer ' + access_token,
                        'Content-Type': 'application/json'
                    },
                };
                break;
            default:
                reject({
                    statusCode: 400,
                    statusMessage: 'request method is not supported'
                });
                break;
        }
        request(options, function (error, response, body) {
            if (error) {
                reject(error);
            } else {
                let resp;
                try {
                    resp = JSON.parse(body)
                } catch (e) {
                    resp = body
                }
                if (response.statusCode >= 400) {
                    console.log('error code: ' + response.statusCode + ' response message: ' + response.statusMessage);
                    reject({
                        statusCode: response.statusCode,
                        statusMessage: response.statusMessage
                    });
                } else {
                    resolve({
                        statusCode: response.statusCode,
                        headers: response.headers,
                        body: resp
                    });
                }
            }
        });
    });    
}



// Format data for tree
function createTreeNode(_id, _text, _type, _cost_container, _children, _storage = null) {
    return { id: _id, text: _text, type: _type, cost_container: _cost_container, children: _children, storage: _storage };
}

module.exports = 
{ 
    createTreeNode,
    apiClientCallAsync
};
    