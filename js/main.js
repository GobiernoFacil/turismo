// TURISMO APP
// date     : 30/7/2014
// @package : turismo
// @file    : main.js
// @version : 1.0
// @author  : elcoruco
// @url     : http://elcoruco.com

require.config({
  baseUrl : "/js",
  paths : {
    jquery     : "bower_components/jquery/dist/jquery",
    backbone   : "bower_components/backbone/backbone",
    underscore : "bower_components/underscore/underscore",
    text       : "bower_components/text/text",
    d3         : "bower_components/d3/d3"
  },
  shim : {
    d3 :{
      exports : "d3"
    },
    underscore :{
      exports : "_"
    },
    backbone : {
      deps    : ["jquery", "underscore"],
      exports : "Backbone"
    }
  }
});

var app;

require(["controller"], function(controller){
  app = new controller();
});

