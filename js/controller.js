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
      "click #map-type-selector a" : "set_type",
      "click #bar-type-selector a" : "set_type",
      "change #year-select-map"    : "render_map",
      "change #year-select-bar"    : "render_barchart",
      "change #place-selector"     : "update_linechart"
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
      this.map_type = this.bar_type = 3;

      // add a number format function
      this.format = d3.format(',');

      // render the project
      this.render_location_selector();
      this.render_map();
      this.render_barchart();
      this.render_linechart();
    },


    //
    // U P D A T E   M A P   F U N C T I O N
    //
    render_map : function(){
      
      // SELECT THE DATA
      var select      = this.$('#year-select-map'),
          year_index  = select.val(),
          year        = this.$('option[value="' + year_index + '"]', select).html(),
          collection  = this.collection,
          total_model = collection.findWhere({estado_id : 0, categoria_id : this.map_type}),
          total       = total_model.get('data_1990_2013')[year_index],
          // ADD A d3.scale
          colorScale = d3.scale.linear()
            .range(['#7ec8f2', '#bc1d78']) 
            .domain([750000, 8000000]),
          colorScale250 = d3.scale.linear()
            .range(['#cff3ff', '#7ec8f2']) 
            .domain([1, 750000]),
          that = this; // just for this time :P

      // RENDER THE TOTAL TOURIST LABEL
      this.$('#tourist-year-map-label').html(year);
      this.$('#tourist-total-map-label').html(this.format(total));

      // PREPARE THE DATA
      var data = [];
      for(var i = 1; i <= 32; i++){
        var models = collection.where({categoria_id : this.map_type, estado_id : i});
        data.push({
          name  : collection.findWhere({estado_id : i}).get('estado'),
          total : _.map(models, function(m){
            return m.get('data_1990_2013')[year_index];
          })
        });
      }

	 

      // SET THE COLORS ON THE MAP
      var states = d3.select('#Mexico')
        .selectAll('path')
        .attr('style', function(){
          var id = this.getAttribute('id'),
				  total  = d3.sum(data[id - 1].total),
          fill   = '';

          if(total > 8000000) {
            fill = "#990066";
          }
          else if(total > 750000){
            fill = colorScale(total);
          }
          else if(total > 0){
            fill = colorScale250(total);
          }
          else{
            fill = "#f2f2f2";
          }

          return 'fill: ' + fill + '; cursor: pointer';
        })

        // SHOW THE STATE LABEL ON MOUSEOVER
        .on('mouseover', function(){
          var bb = this.getBBox(),
              id = this.getAttribute('id'),
              d  = data[id - 1],
              t  = d3.sum(d.total),
              y  = bb.y + (bb.height/2)
              x  = bb.x + (bb.width/2);
              // ese coruco, solo dos estados truenan, por tiempo
              // mejor aplico a esos estados
              if ((id==23) || (id==31)) {
	              x = x - 80;  
              }			  
          // remove the previous labels
          d3.selectAll('#Mexico text').remove();
          d3.selectAll('#Mexico rect').remove();
		  
		  // esto es solo para calcular ancho
		  d3.select('#Mexico') 
            .append("text")
            	.attr('id','azul')
				.text(d.name + ':')
				.attr("x", (x +5))
                .attr("y", (y +15))
				.append("tspan")
					.attr("x", (x+5))
              		.attr("y", (y+10))
					.text(that.format(t));
          
          var widthS = document.getElementById('azul').offsetWidth;
		  //elimina text trazado solo para calcular
		  d3.selectAll('#Mexico text').remove();
          
          //agrega rectángulo    		
          d3.select('#Mexico')
          	.append("rect")
          		.attr("width", widthS + 10)
                .attr("height", 40)
             	.attr("x", (x))
                .attr("y", y)
                .attr('fill', '#282827')
                .attr('fill-opacity', 0.8);
                
           //agrega texto sobre rectángulo 
           d3.select('#Mexico') 
            .append("text")
				.text(d.name + ':')
				.attr("x", (x +5))
                .attr("y", (y +15))
				.append("tspan")
              		.attr("x", (x+5))
              		.attr("y", (y+10))
			  		.attr('dy', '1.5em')
              		.text(that.format(t));
        });
    },


    //
    // U P D A T E   B A R C H A R T   F U N C T I O N
    //
    render_barchart : function(){
      // CLEAN THE BARCHART
      this.$('#barchart').html('');
      // SELECT THE DATA
      var select       = this.$('#year-select-bar'),
          year_index   = select.val(),
          year         = this.$('option[value="' + year_index + '"]', select).html(),
          collection   = this.collection,
          destinos     = new Backbone.Collection(collection.where({categoria_id : this.bar_type})),
          destinos_num = 30,
          min_width    = 100,
          max_width    = 500;

      // get the most popular. The function sortBy orders the collection with an 'ASC' method
      // so, the collection must be reversed, and then, the first value must be removed,
      // because it's the total <slice(1,31)>
      var data = destinos.sortBy(function(m){
        return m.get('data_1990_2013')[year_index];
      }).reverse().slice(1,destinos_num + 1);

      // set the domain, range and scale for the bars
      var extent = d3.extent(data, function(d){
        return d.get('data_1990_2013')[year_index];
      });
      var scale = d3.scale.linear()
        .range([min_width, max_width])
        .domain(extent);
	  
	  //agrega escala para color
	  var colorScaleBar = d3.scale.linear()
		.range(['#369ad5', '#bc1d78']) 
		.domain(extent);
	  
	  
      // draw the bars container
      var bars = d3.select('#barchart')
        .selectAll('p')
        .data(data)
        .enter()
          .append('p');
      
      // draw the labels
      bars.append('span')
        .attr('class', 'label')
		.text(function(d,i){
				return  (i+1) + '. ';
		})
		//agrega strong para diferencia de index
		.append('strong')
		 	.text(function(d,i){
           return  d.get('destino') + ': ';
        });

      // draw the bars
      bars.append('span')
        .attr('class', 'bar')        
        .style('width', function(d){
          return scale(d.get('data_1990_2013')[year_index]) + 'px';
        })
        // agrega colorScaleBar
        .style('background', function(d){
		return colorScaleBar(d.get('data_1990_2013')[year_index]);
		})
		//metemos valor en span
		.append('span')
        	.attr('class','value')
			.text(function(d){
				var value 	= d.get('data_1990_2013')[year_index],
					//formato a valor
					valuef 	= value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				return valuef;
		});
    },

    //
    // U P D A T E   R A Y I T A S   G R A P H   F U N C T I O N
    //
    render_linechart : function(){
      // SET THE CONSTRUCTION VARS
      var location  = this.$('#place-selector').val(),
          values    = new Backbone.Collection(this.collection.where({destino : location}))
            .pluck('data_1990_2013'),
          container = {
            width  : 700,
            height : 500
          },
          margin = {
            top    : 10,
            right  : 20,
            bottom : 30,
            left   : 60
          };

      // GENERATE THE GRAPH CONTAINER
      var chart = d3.select('#line-graph-container')
        .append('svg')
          .attr('width', container.width)
          .attr('height', container.height)
          .append('g')
            .attr('transform', 'translate(' + margin.left +', '+ margin.top +')')
            .attr('id', 'chart');

      // SETUP THE SCALES
      var time_scale = d3.time.scale()
        .range([0, container.width - margin.left - margin.right])
        .domain([new Date(1990,0,1), new Date(2013,0,1)]);

      var visits_scale = d3.scale.linear()
        .range([container.height - margin.top - margin.bottom, 0])
        .domain(d3.extent(values[0].concat(values[1], values[2])));

      // SETUP THE AXIS
      var time_axis = d3.svg.axis()
        .scale(time_scale);

      var visits_axis = d3.svg.axis()
        .scale(visits_scale)
        .orient('left')
        .tickFormat(d3.format("s"));

      chart.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0, ' + (container.height - margin.top - margin.bottom) + ')')
        .call(time_axis);

      chart.append('g')
        .attr('class', 'y axis')
        .call(visits_axis);

      // draw the lines
      var line = d3.svg.line()
        .x(function(d,i){
          return time_scale(new Date(i + 1990, 0, 1));
        })
        .y(function(d){
          return visits_scale(d);
        });

      // LINE A
      chart.append('path')
        .attr('d', line(values[0]))
        .attr('class', 'all');

      // LINE B
      chart.append('path')
        .attr('d', line(values[1]))
        .attr('class', 'mexicans');

      // LINE C
      chart.append('path')
        .attr('d', line(values[2]))
        .attr('class', 'foreigners');


    },

    //
    // UPDATE THE LINE CHART
    //
    update_linechart : function(){
      // SET THE CONSTRUCTION VARS
      var location  = this.$('#place-selector').val(),
          values    = new Backbone.Collection(this.collection.where({destino : location}))
            .pluck('data_1990_2013'),
          container = {
            width  : 700,
            height : 500
          },
          margin = {
            top    : 10,
            right  : 20,
            bottom : 30,
            left   : 60
          };

      // SETUP THE SCALES
      var time_scale = d3.time.scale()
        .range([0, container.width - margin.left - margin.right])
        .domain([new Date(1990,0,1), new Date(2013,0,1)]);

      var visits_scale = d3.scale.linear()
        .range([container.height - margin.top - margin.bottom, 0])
        .domain(d3.extent(values[0].concat(values[1], values[2])));


      // SETUP THE AXIS
      var time_axis = d3.svg.axis()
        .scale(time_scale);

      var visits_axis = d3.svg.axis()
        .scale(visits_scale)
        .orient('left')
        .tickFormat(d3.format("s"));

      d3.select('g.y.axis')
        .call(visits_axis);


      // UPDATE THE LINES
      var line = d3.svg.line()
        .x(function(d,i){
          return time_scale(new Date(i + 1990, 0, 1));
        })
        .y(function(d){
          return visits_scale(d);
        });

      // LINE A
      d3.select('path.all')
        .transition()
        .attr('d', line(values[0]));

      // LINE B
      d3.select('path.mexicans')
        .transition()
        .attr('d', line(values[1]));

      // LINE C
      d3.select('path.foreigners')
        .transition()
        .attr('d', line(values[2]));
    },

    //
    // FILL THE PLACE SELECTOR
    //
    render_location_selector : function(){
      var selector = this.$('#place-selector'),
          models   = this.collection.where({categoria_id : 1}),
          names    = new Backbone.Collection(models).pluck('destino');

      // append the options!!!! n____n
      for(var i = 0; i < names.length - 1; i++){
        selector.append('<option>' + names[i] + '</option>');
      }
    },


    //
    // SET THE TYPE (all, mexicans, foreigners)
    //
    set_type : function(e){
      // master trick
      var item     = this.$(e.currentTarget),
          parent   = item.parent().parent(),
          graph    = parent.attr('id') == 'map-type-selector' ? 'map' : 'bar',
          old_type = graph == 'map' ? this.map_type : this.bar_type,
          type     = item.html().toLowerCase(),
          new_type = 0;

      // update the "selected" class
      parent.find('a').removeClass('selected');
      item.addClass('selected');

      // set the new type of map
      if(type === "todos"){
        new_type = 3;
      }
      else if(type === "nacionales"){
        new_type = 1;
      }
      else{
        new_type = 2;
      }

      // update the graph
      // MAP
      if(graph == 'map'){
        this.map_type = new_type;
        if(! (old_type === new_type) ){
          this.render_map();
        }
      }
      // BAR
      else{
        this.bar_type = new_type;
        if(! (old_type === new_type) ){
          this.render_barchart();
        }
      }

      return false;
    }
  });

  return controller;
});
