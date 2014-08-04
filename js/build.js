({
  baseUrl: "./",
  name : "main",
  out : "./main-built.js",
  paths : {
    jquery     : "./bower_components/jquery/dist/jquery",
    backbone   : "./bower_components/backbone/backbone",
    underscore : "./bower_components/underscore/underscore",
    text       : "./bower_components/text/text",
    d3         : "./bower_components/d3/d3",
    requireLib    : './bower_components/requirejs/require'
  },
  shim : {
    twttr :{
      exports : "twttr"
    },
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
  },
  include : 'requireLib'
})