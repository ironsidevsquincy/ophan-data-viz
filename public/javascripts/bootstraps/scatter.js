require(['js!d3!order', 'js!contour!order'], function() {

    // // create random points
    // var points = [];
    // for(var i = 100; i > 0; i--) {
    //     points.push({x: Math.random() * 500, y: Math.random() * 200, name: i, type: i % 10})
    // }

    // // create scatter graph
    // var svg = d3.select('#chart')
    //     .attr("width", 510)
    //     .attr("height", 210)    
    //     .append("g")
    //     .attr("transform", "translate(5, 5)");

    // var colors = d3.scale.category10();

    // svg.selectAll('circle')
    //     .data(points)
    //     .enter()
    //     .append('circle')
    //     .attr('cx', function(d) { return d.x; })
    //     .attr('cy', function(d) { return d.y; })
    //     .attr('r', 5)
    //     .attr('fill', function(d) { return colors(d.type); });

    var margin = {top: 20, right: 20, bottom: 30, left: 30},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.linear()
    .domain([95, 115, 135, 155, 175, 195])
    .range(["#0a0", "#6c0", "#ee0", "#eb4", "#eb9", "#fff"]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(20);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var svg = d3.select("#chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("data/readme-heatmap.json", function(error, heatmap) {
  var dx = heatmap[0].length,
      dy = heatmap.length;

  x.domain([0, dx]);
  y.domain([0, dy]);

  svg.selectAll(".isoline")
      .data(color.domain().map(isoline))
    .enter().append("path")
      .datum(function(d) { return d3.geom.contour(d).map(transform); })
      .attr("class", "isoline")
      .attr("d", function(d) { return "M" + d.join("L") + "Z"; })
      .style("fill", function(d, i) { return color.range()[i]; });

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  function isoline(min) {
    return function(x, y) {
      return x >= 0 && y >= 0 && x < dx && y < dy && heatmap[y][x] >= min;
    };
  }

  function transform(point) {
    return [point[0] * width / dx, point[1] * height / dy];
  }
});

})