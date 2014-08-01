// TURISMO APP
// @package: turismo
// @location: /js
// @file: controller.js
// @author: elcoruco
// @url: elcoruco.com


define(function(require){
  //
  // L O A D   T H E   A S S E T S   A N D   L I B R A R I E S
  //
  var Backbone = require('backbone'),
      d3       = require('d3'),
      Data     = require('data/turismo');

  //
  // I N I T I A L I Z E   T H E   B A C K B O N E   V I E W
  //
  var controller = Backbone.View.extend({

    //
    // D E F I N E   T H E   E V E N T S
    // 
    events : {
      "change #year-select-map" : "render_map"
    },

    //
    // S E T   T H E   C O N T A I N E R
    //
    el : "#main.turismo",

    //
    // T H E   I N I T I A L I Z E   F U N C T I O N
    //
    initialize : function(){
      // setup the data into a collection
      this.collection = new Backbone.Collection(Data.turismo);

      // render the map
      this.render_map();
    },

    //
    // U P D A T E   M A P   F U N C T I O N
    //
    render_map : function(){
      // select the data
      var select      = this.$('#year-select-map'),
          index       = select.val(),
          year        = this.$('option[value="' + index + '"]').html(),
          collection  = this.collection,
          total_model = this.collection.findWhere({estado_id : 0, categoria_id : 3}),
          total       = total_model.get('data_1990_2013')[index];

      // render the TOTAL TOURIST LABEL
      this.$('#tourist-year-map-label').html(year);
      this.$('#tourist-total-map-label').html(total);

      // set the colors on the map

      var states = d3.select('#Mexico')
        .selectAll('path')
        .attr('style', function(){
          var id     = this.getAttribute('id'),
              models = collection.where({estado_id : Number(id)}),
              data   = _.map(models, function(d,i){
                return d.get('data_1990_2013')[index];
              }),
              total = d3.sum(data),
              fill  = '';

              if(total >= 12000000){
                fill = "#27769f";
              }
              else if(total >= 4000000){
                fill = "#4ea6d9";
              }
              else if(total >= 500000){
                fill = "#b1d8ee";
              }
              else if(total >= 2000){
                fill = "#d8ebf6";
              }
              else{
                fill = "#fff";
              }
          return 'fill: ' + fill + '; cursor: pointer';
        });
    }
  });

  return controller;
});
