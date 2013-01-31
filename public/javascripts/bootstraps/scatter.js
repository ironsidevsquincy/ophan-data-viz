require(['js!d3!order', 'js!contour!order'], function() {

    // create random points
    var width = 500,
        height = 500;
        companies = [],
        colors = d3.scale.category10();
    for(var i = 0; i < 10; i++) {
        var coffees = [];
        for(var j = 0; j < 5; j++) {
            coffees.push({x: Math.random() * (width / 2), y: Math.random() * (height / 2), households: (Math.random() * 4) + 1})
        }
        companies.push(coffees);
    }

    var svg = d3.select("#chart")
        .attr("width", width)
        .attr("height", height);

    // create scatter graph
    var scatter = svg.append("g")
        .attr("transform", "translate(" + (width / 2) + ", " + (height / 2) + ")");

    scatter.selectAll('g')
        .data(companies)
        .enter()
        .append('g')
        .selectAll('circle')
        .data(function(d, i) { return d; })
        .enter()
        .append('circle')
        .attr('cx', function(d) { return d.x; })
        .attr('cy', function(d) { return d.y; })
        .attr('r', function(d) { return d.households })
        .attr('fill', function(d, i, j) { return colors(j); });


    // create a streamgraph for the x axis
    var createStream = function (dim) {
        var stackGranularity = 10;

        var stack = d3.layout.stack().offset("zero"),
        layers = stack(d3.range(companies.length).map(function(i) {
            var stack = [];
            for(var j = 0; j <= stackGranularity; j++) {
                stack.push({x: j, y: 0});
            }
            var scale = d3.scale.linear()
                .domain([0, (dim === 'x') ? width / 2 : height / 2])
                .rangeRound((dim === 'x') ? [0, stackGranularity] : [stackGranularity, 0]);
            for(var k in companies[i]) {
                var x = scale(companies[i][k][dim]);
                stack[x].y += companies[i][k].households;
            }
            return stack;
        }));

        var x = d3.scale.linear()
            .domain([0, stackGranularity])
            .range([0, (dim === 'x') ? width / 2 : height / 2]);

        var y = d3.scale.linear()
            .domain([0, d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); })])
            .range([height / 2, 0]);

        var area = d3.svg.area()
            .x(function(d) { return x(d.x); })
            .y0(function(d) { return y(d.y0); })
            .y1(function(d) { return y(d.y0 + d.y); });

        var stream = svg.append('g')

        stream.selectAll("path")
            .data(layers)
            .enter().append("path")
            .attr("d", area)
            .style("fill", function(d, i) { return colors(i); });
        return stream;
    }

    createStream('x').attr('transform', 'translate(' + (width / 2) + ' 0)');
    createStream('y').attr('transform', 'rotate(-90 0 0) translate(-' + height + ' 0)');

})