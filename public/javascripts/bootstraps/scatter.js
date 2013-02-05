require(['js!d3!order', 'js!conrec!order'], function() {

    // create random points
    var width = 250,
        height = 250;
        companies = [],
        colors = d3.scale.category10();
    for(var i = 0; i < 10; i++) {
        var coffees = [];
        for(var j = 0; j < 10; j++) {
            coffees.push({x: Math.random() * (width), y: Math.random() * (height), households: (Math.random() * 4) + 1})
        }
        companies.push(coffees);
    }

    var svg = d3.select("#chart")
        .attr("width", width * 2)
        .attr("height", height * 2);

    // create scatter graph
    var scatter = svg.append("g")
        .attr("transform", "translate(" + width + ", " + height + ")");

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

    // create data for conrec
    var conrecQuant = 20;
    var conrecData = [];
    for (var i = 0; i < conrecQuant; i++) {
        conrecData.push([]);
        for (var j = 0; j < conrecQuant; j++) {
            conrecData[i][j] = 0
        }
    }

    var contourScaleX = d3.scale.linear()
        .domain([0, width])
        .rangeRound([0, conrecQuant - 1]);
    var contourScaleY = d3.scale.linear()
        .domain([0, height])
        .rangeRound([0, conrecQuant - 1]);
    for (var i = 0; i < companies.length; i++) {
        for (var j = 0; j < companies[i].length; j++) {
            var company = companies[i][j];
            var x = contourScaleX(company.x);
            var y = contourScaleY(company.y)
            conrecData[x][y] += parseInt(company.households)
        }   
    }

    var c = new Conrec(),
        xs = d3.range(0, conrecData[0].length),
        ys = d3.range(0, conrecData.length),
        zs = d3.range(-5, 3, .5),
        x = d3.scale.linear().range([0, width]).domain([0, conrecData[0].length]),
        y = d3.scale.linear().range([0, height]).domain([0, conrecData.length]),
        colours = d3.scale.linear().domain([-5, 3]).range(["#fff", "red"]);

    c.contour(conrecData, 0, xs.length-1, 0, ys.length-1, xs, ys, zs.length, zs);

    var contour = svg.append("g")
        .attr("transform", "translate(" + width + ", " + height + ")");

    contour.selectAll("g")
        .data(d3.nest().key(function(d) { return d.level}).entries(c.contourList()))
        .enter()
        .append("g")
        .attr("class",function(d) { return "level_"+d.key})
        .style("fill",function(d) { return colours(d.key);})
        .style("stroke","black")
        .style("opacity",0.5)
        .selectAll("path")
            .data(function(d) { return d.values})
            .enter()
            .append("path")
            .attr("d",d3.svg.line()
                .x(function(d) { return x(d.x)})
                .y(function(d) { return y(d.y)})
            );


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
                .domain([0, (dim === 'x') ? width : height])
                .rangeRound((dim === 'x') ? [0, stackGranularity] : [stackGranularity, 0]);
            for(var k in companies[i]) {
                var x = scale(companies[i][k][dim]);
                stack[x].y += companies[i][k].households;
            }
            return stack;
        }));

        var x = d3.scale.linear()
            .domain([0, stackGranularity])
            .range([0, (dim === 'x') ? width : height]);

        var y = d3.scale.linear()
            .domain([0, d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); })])
            .range([height, 0]);

        var area = d3.svg.area()
            .x(function(d) { return x(d.x); })
            .y0(function(d) { return y(d.y0); })
            .y1(function(d) { return y(d.y0 + d.y); });

        var stream = svg.append('g')

        stream.selectAll("path")
            .data(layers)
            .enter()
            .append("path")
            .attr("d", area)
            .style("fill", function(d, i) { return colors(i); });
        return stream;
    }

    createStream('x').attr('transform', 'translate(' + width + ' 0)');
    createStream('y').attr('transform', 'rotate(-90 0 0) translate(-' + (height * 2) + ' 0)');

})