
d3.dsv(",", "board_games.csv", function(d) {
    return {
        source: d.source,
        target: d.target,
        value: +d.value
    }
}).then(function(data) {


var links = data;
var nodes = {};
var inputDomain = [];

// compute the distinct nodes from the links.
links.forEach(function(link) {
    link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
    link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
});

var width = 1200;
var height = 700;
var margin = 20;
var padding = 30;
var adj = 40;

// we are appending SVG first
var svg = d3.select("body").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "-"
        + adj + " -"
        + adj + " "
        + (width + adj * 5) + " "
        + (height + adj * 3))
    .style("padding", padding)
    .style("margin", margin)


var force = d3.forceSimulation()
    .nodes(d3.values(nodes))
    .force("link", d3.forceLink(links).distance(100))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .force("charge", d3.forceManyBody().strength(-250))
    .alphaTarget(1)
    .on("tick", tick);


// add the links
var path = svg.append("g")
    .selectAll("path")
    .data(links)
    .enter()
    .append("path")
    .style('stroke-dasharray', function(d) {
        if (d.value == 1) {
            return '4';
        }
    })
    .style('stroke', function(d) {
        if (d.value == 1 ) {
            return 'green';
        }
    })
    .style('stroke-width', function(d) {
        if (d.value == 0) {
            return '3'
        }
    })
    .attr("class", function(d) { return "link " + d.type; });

// define the nodes
var node = svg.selectAll(".node")
    .data(force.nodes())
    .enter()
    .append("g")
    .attr("class", "node")
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
    .on('dblclick', releaseNode);


// add the nodes
node.append("circle")
    .attr("r",  function(d) {

        d.weight = links.filter(function(l) {
            return l.source.index == d.index || l.target.index == d.index
        }).length;

        inputDomain.push(d.weight);

        var minRadius = 10;
        return minRadius + (d.weight * 2);
    }).style("fill", function(d) {
            
        var colorScale = d3.scaleLinear()
                            .domain([d3.min(inputDomain, function(d) {return d;}),
                                     d3.max(inputDomain, function(d) {return d;})])
                            .range([250,50]);
                            
        d.weight = links.filter(function(l) {
            return l.source.index == d.index || l.target.index == d.index
        }).length;      
        
        return 'rgb(' + colorScale(d.weight) + ',0,' + colorScale(d.weight) + ')';
    });

// add node labels
node.append("text")
    .attr("dx", 12)
    .attr("dy", "-2em")
    .style("font-weight", "bolder")
    .text(function(d) {
        return d.name;
    });

// add the curvy lines
function tick() {
    path.attr("d", function(d) {
        var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy);
        return "M" +
            d.source.x + "," +
            d.source.y + "A" +
            dr + "," + dr + " 0 0,1 " +
            d.target.x + "," +
            d.target.y;
    });

    node.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")"; 
    });
};

function dragstarted(d) {
    if (!d3.event.active) force.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
};

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
};

function dragended(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;

    d3.select(this).select("circle")
        .style('fill','blue')
};

var colorScale = d3.scaleLinear()
                            .domain([d3.min(inputDomain, function(d) {return d;}),
                                     d3.max(inputDomain, function(d) {return d;})])
                            .range([250,50]);

function releaseNode(d) {
    d.fx = undefined;
    d.fy = undefined;

    d3.select(this).select("circle")
        .style('fill', function(d) {
            d.weight = links.filter(function(l) {
                return l.source.index == d.index || l.target.index == d.index
            }).length;      
        
        return 'rgb(' + colorScale(d.weight) + ',0,' + colorScale(d.weight) + ')';
        })
};


}).catch(function(error) {
console.log(error);
});