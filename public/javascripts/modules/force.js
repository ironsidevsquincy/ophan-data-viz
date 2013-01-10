define(['js!d3!order', 'js!sankey!order'], function() {

  var Force = function(graph) {

    this.graph = graph,

    this.render = function() {
      var width = window.innerWidth - 100,
          height = window.innerHeight - 300;

      var color = d3.scale.category20();

      var force = d3.layout.force()
          .charge(-120)
          .linkDistance(30)
          .size([width, height]);

      var svg = d3.select("body").append("svg")
          .attr("width", width)
          .attr("height", height);

      force
          .nodes(this.graph.nodes)
          .links(this.graph.links)
          .start();

      var link = svg.selectAll("line.link")
          .data(this.graph.links)
        .enter().append("line")
          .attr("class", "link")
          .style("stroke-width", function(d) { return Math.sqrt(d.value); });

      var node = svg.selectAll("circle.node")
          .data(this.graph.nodes)
        .enter().append("circle")
          .attr("class", "node")
          .attr("r", 5)
          .style("fill", function(d) { return color(d.group); })
          .call(force.drag);

      node.append("text")
          .text(function(d) { return d.name; });

      force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
      });

    }

  }

  return Force;

})