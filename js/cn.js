//Map dimensions (in pixels)
var width = 800,
    height = 600;

//Map projection
var projection = d3.geo.conicEqualArea()
    .scale(3420.601250615637)
    .center([-97.28064044616768,17.4805879762367]) //projection center
    .parallels([14.532098365452654,20.394556346467752]) //parallels for conic projection
    .rotate([97.28064044616768]) //rotation for conic projection
    .translate([-4911.883006659209,-1074.9119626224956]) //translate to center the map in view

//Generate paths based on projection
var path = d3.geo.path()
    .projection(projection);

//Create an SVG
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

//Group for the map features
var features = svg.append("g")
    .attr("class","features");

//Create choropleth scale
var color = d3.scale.quantize()
    .domain([0,893648.512])
    .range(d3.range(5).map(function(i) { return "q" + i + "-5"; }));

//Create a tooltip, hidden at the start
var tooltip = d3.select("body").append("div").attr("class","tooltip");

//Keeps track of currently zoomed feature
var centered;

function slider() {

  var propiedades = document.getElementById("status").value;
  d3.json("CN.topojson",function(error,geodata) {
    if (error) return console.log(error); //unknown error, check the console

    //Create a path for each map feature in the data
    var sld = features.selectAll("path")
      .data(topojson.feature(geodata,geodata.objects.collection).features) //generate features from TopoJSON
      sld.enter()
      .append("path")
      sld.attr("d",path)
      sld.attr("class", function(d) {
                      var valor = d.properties[propiedades];
                      return (typeof color(valor) == "string" ? color(valor) : "");
                    })

      .on("mouseover",showTooltip)
      .on("mousemove",moveTooltip)
      .on("mouseout",hideTooltip)
      .on("click",clicked)
      sld.exit().remove();
  });
}
window.onload = slider

// Zoom to feature on click
function clicked(d,i) {

  //Add any other onClick events here

  var x, y, k;

  if (d && centered !== d) {
    // Compute the new map center and scale to zoom to
    var centroid = path.centroid(d);
    var b = path.bounds(d);
    x = centroid[0];
    y = centroid[1];
    k = .8 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
    centered = d
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  // Highlight the new feature
  features.selectAll("path")
      .classed("highlighted",function(d) {
          return d === centered;
      })
      .style("stroke-width", 0.25 / k + "px"); // Keep the border width constant

  //Zoom and re-center the map
  //Uncomment .transition() and .duration() to make zoom gradual
  features
      //.transition()
      //.duration(500)
      .attr("transform","translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")");
}


//Position of the tooltip relative to the cursor
var tooltipOffset = {x: 5, y: -25};

//Create a tooltip, hidden at the start
function showTooltip(d) {
  moveTooltip();

  tooltip.style("display","block")
      .text(d.properties.NOM_MUN);
}

//Move the tooltip to track the mouse
function moveTooltip() {
  tooltip.style("top",(d3.event.pageY+tooltipOffset.y)+"px")
      .style("left",(d3.event.pageX+tooltipOffset.x)+"px");
}

//Create a tooltip, hidden at the start
function hideTooltip() {
  tooltip.style("display","none");
}
