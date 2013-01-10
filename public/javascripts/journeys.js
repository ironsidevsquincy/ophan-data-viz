require(['reqwest',  'modules/sankey-nodes', 'js!d3!order', 'js!sankey!order'], function(reqwest, SankeyNodes) {

  var currentTime = new Date().getTime();

  var esQuery = {
    "query": {
      "bool": {
        "must": [
          {
            "term": {
              "host": "m.guardian.co.uk"
            }
          }
        ]
      },
      "from": 0,
      "size": 500
    }
  }

  var referringHost = /referring-host=([^&]+)/.exec(window.location.search);
  if (referringHost) {
    esQuery.query.bool.must.push({"wildcard": {"referringHost": referringHost[1]}});
  }
  var size = /size=([\d]+)/.exec(window.location.search);
  if (size) {
    esQuery.query.size = size[1];
  }

  // make request to ophan
  reqwest({
    url: 'http://elasticsearch.ophan.co.uk:9200/_search',
    type: 'json',
    method: 'post',
    data: JSON.stringify(esQuery)
  })
    .then(function(resp) {

      var journeys = new SankeyNodes(resp.hits.hits).get();

      // NOTE: following lifted from http://bost.ocks.org/mike/sankey/
      var margin = {top: 1, right: 1, bottom: 6, left: 1},
        width = window.innerWidth - margin.left - margin.right - 100,
        height = window.innerHeight - margin.top - margin.bottom - 200;

      var formatNumber = d3.format(",.0f"),
        format = function(d) { return formatNumber(d) + " TWh"; },
        color = d3.scale.category20();

      var svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var sankey = d3.sankey()
        .nodeWidth(15)
        .nodePadding(10)
        .size([width, height]);

      var path = sankey.link();
      sankey.nodes(journeys.nodes)
        .links(journeys.links)
        .layout(32);

      var link = svg.append("g").selectAll(".link")
        .data(journeys.links)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", path)
        .style("stroke-width", function(d) { return Math.max(1, d.dy); })
        .sort(function(a, b) { return b.dy - a.dy; });

      link.append("title")
          .text(function(d) { return d.source.name + " → " + d.target.name + "\n" + format(d.value); });

      var node = svg.append("g").selectAll(".node")
        .data(journeys.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .call(d3.behavior.drag()
        .origin(function(d) { return d; })
        .on("dragstart", function() { this.parentNode.appendChild(this); })
        .on("drag", dragmove));

      node.append("rect")
        .attr("height", function(d) { return d.dy; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
        .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
        .append("title")
        .text(function(d) { return d.name + "\n" + format(d.value); });

      node.append("text")
        .attr("x", -6)
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { return d.name; })
        .filter(function(d) { return d.x < width / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");

      function dragmove(d) {
        d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
        sankey.relayout();
        link.attr("d", path);
      }

    })
    .fail(function(err, msg) {
      console.log([err, msg].join(' : '));
    })
})