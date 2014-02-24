///////////////////////////////////////////////////////////////////////////////
//
//  AutobahnJS - http://autobahn.ws, http://wamp.ws
//
//  A JavaScript library for WAMP ("The Web Application Messaging Protocol").
//
//  Copyright (C) 2011-2014 Tavendo GmbH, http://tavendo.com
//
//  Licensed under the MIT License.
//  http://www.opensource.org/licenses/mit-license.php
//
///////////////////////////////////////////////////////////////////////////////


var RawWebSocket = function (url, protocols) {

   if ('window' in global) {

      //
      // running in browser
      //

      if ("WebSocket" in window) {
         // Chrome, MSIE, newer Firefox
         if (protocols) {
            return new window.WebSocket(url, protocols);
         } else {
            return new window.WebSocket(url);
         }
      } else if ("MozWebSocket" in window) {
         // older versions of Firefox prefix the WebSocket object
         if (protocols) {
            return new window.MozWebSocket(url, protocols);
         } else {
            return new window.MozWebSocket(url);
         }
      } else {
         return null;
      }

   } else {

      //
      // running on nodejs
      //

      // our WebSocket shim with W3C API
      var websocket = {};

      // these will get defined by the specific shim
      websocket.protocol = undefined;
      websocket.send = undefined;
      websocket.close = undefined;

      // these will get called by the shim.
      // in case user code doesn't override these, provide these NOPs
      websocket.onmessage = function () {};
      websocket.onopen = function () {};
      websocket.onclose = function () {};

      // https://github.com/Worlize/WebSocket-Node
      //
/*      
      (function() {

         //var WebSocketClient = require('websocket').client;
         var client = new WebSocketClient();

         client.on('connectFailed', function (error) {
            // https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
            websocket.onclose({code: 1000, reason: error.toString(), wasClean: false});
         });

         client.on('connect', function (connection) {

            websocket.protocol = connection.protocol;

            websocket.send = function (msg) {
               if (connection.connected) {
                  // sending a string that gets encoded as UTF8
                  // https://github.com/Worlize/WebSocket-Node/blob/master/lib/WebSocketConnection.js#L587
                  connection.sendUTF(msg);

                  // https://github.com/Worlize/WebSocket-Node/blob/master/lib/WebSocketConnection.js#L594
                  // sending a Node Buffer
                  //connection.sendBytes(msg);
               }
            };

            websocket.close = function (code, reason) {
               connection.close();
            };

            websocket.onopen();
       
            connection.on('error', function (error) {
               // https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
               websocket.onclose({code: 1000, reason: error.toString(), wasClean: true});
            });

            connection.on('close', function (code, reason) {
               // https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
               websocket.onclose({code: code, reason: reason, wasClean: true});
            });

            connection.on('message', function (message) {
               // https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent
               if (message.type === 'utf8') {
                  websocket.onmessage({data: message.utf8Data});
               }
            });

         });

         if (protocols) {
            client.connect(url, protocols);
         } else {
            client.connect(url);
         }
      })();
*/

      // https://github.com/einaros/ws
      //
      (function () {

         var WebSocket = require('ws');
         var client;
         if (protocols) {
            if (Array.isArray(protocols)) {
               protocols = protocols.join(',');
            }
            client = new WebSocket(url, {protocol: protocols});
         } else {
            client = new WebSocket(url);
         }

         websocket.send = function (msg) {
            client.send(msg, {binary: false});
         };

         websocket.close = function (code, reason) {
            client.close();
         };

         client.on('open', function () {
            websocket.onopen();
         });

         client.on('message', function (data, flags) {
            if (flags.binary) {

            } else {
               websocket.onmessage({data: data});
            }
         });

         client.on('close', function () {
         });

         client.on('error', function () {
         });

      })();

      return websocket;
   }
};


var _WebSocket = function (url, options) {
   var self = this;
   self._url = url;
   self._options = options;
};


_WebSocket.prototype.create = function () {
   var self = this;
   return new RawWebSocket(self._url, ['wamp.2.json']);
};

exports.WebSocket = _WebSocket;
