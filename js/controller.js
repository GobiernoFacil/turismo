// TURISMO APP
// @package: turismo
// @location: /js
// @file: controller.js
// @author: elcoruco
// @url: elcoruco.com


define(function(require){
  //
  // LOAD THE ASSETS AND LIBRARIES
  //
  var Backbone = require('backbone'),
      d3       = require('d3'),
      Data     = require('data/turismo');

  // INITIALIZE THE BACKBONE VIEW
  var controller = Backbone.View.extend({

    // DEFINE THE EVENTS
    events : {
      "change #year-select-map" : "render_map"
    },

    // SET THE CONTAINER
    el : "#main.turismo",

    // THE INITIALIZE FUNCTION
    initialize : function(){
      // setup the data into a collection
      this.collection = new Backbone.Collection(Data.turismo);

      // set the map base color; maybe this one must be don directly into the SVG
      var states = d3.select('#Mexico')
          .selectAll('path')
            .attr('style', 'fill: #fff; cursor: pointer');
    },

    // UPDATE MAP FUNCTION
    render_map : function(){

    }
  });

  return controller;
});
