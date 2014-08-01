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
      "click #map-type-selector a" : "set_map_type",
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
      // set the default type:
      // all        -> 3
      // mexicans   -> 1
      // foreigners -> 2
      this.map_type = 3;

      // render the map
      this.render_map();
    },

    //
    // U P D A T E   M A P   F U N C T I O N
    //
    render_map : function(){
      
      // select the data
      var select      = this.$('#year-select-map'),
          year_index  = select.val(),
          year        = this.$('option[value="' + year_index + '"]').html(),
          collection  = this.collection,
          total_model = this.collection.findWhere({estado_id : 0, categoria_id : this.map_type}),
          total       = total_model.get('data_1990_2013')[year_index];

      // render the TOTAL TOURIST LABEL
      this.$('#tourist-year-map-label').html(year);
      this.$('#tourist-total-map-label').html(total);

      // prepare the data
      var data   = [];
      for(var i = 1; i <= 32; i++){
        var models = this.collection.where({categoria_id : this.map_type, estado_id : i});
        data.push({
          name  : this.collection.findWhere({estado_id : i}).get('estado'),
          total : _.map(models, function(m){
            return m.get('data_1990_2013')[year_index];
          })
        });
      }

      // set the colors on the map
      var states = d3.select('#Mexico')
        .selectAll('path')
        .attr('style', function(){
          var id    = this.getAttribute('id'),
              total = d3.sum(data[id - 1].total),
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


    },

    //
    // SET THE MAP TYPE (all, mexicans, foreigners)
    //
    set_map_type : function(e){
      // master trick
      var old_type = this.map_type;

      // update the "selected" class
      this.$('#map-type-selector a').removeClass('selected');
      this.$(e.currentTarget).addClass('selected');

      // set the new type of map
      var type = this.$(e.currentTarget).html().toLowerCase();
      if(type === "todos"){
        this.map_type = 3;
      }
      else if(type === "nacionales"){
        this.map_type = 1;
      }
      else{
        this.map_type = 2;
      }

      // render the map
      if(! (old_type === this.map_type) ){
        this.render_map();
      }

      return false;
    }
  });

  return controller;
});
