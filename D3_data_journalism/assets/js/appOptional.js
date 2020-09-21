// @TODO: YOUR CODE HERE!
// Define SVG area dimensions
var svgWidth = 700;
var svgHeight = 650;

// Define the chart's margins as an object
var chartMargin = {
  top: 30,
  right: 30,
  bottom: 100,
  left: 100
};

// Define dimensions of the chart area
var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

// Select body, append SVG area to it, and set the dimensions
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);

// Append a group to the SVG area and shift ('translate') it to the right and down to adhere
// to the margins set in the "chartMargin" object.
var chartGroup = svg.append("g")
  .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

// Initial Params
var chosenXAxis = "poverty";  
var chosenYAxis = "healthcare";  

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, chartWidth]);

  return xLinearScale;

}

function yScale(data, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
      d3.max(data, d => d[chosenYAxis]) * 1.2
    ])
    .range([chartHeight, 0]);

  return yLinearScale;

}

// function used for updating X and Y Axis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}


// function used for updating circles group and axes with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var label;

  if (chosenXAxis === "poverty") {
    label = "In Poverty (%)";
  }
  else if (chosenXAxis === "age") {
    label = "Age (Median)";
  }
  else {
    label = "Household Income (Median)";
  }

  if (chosenYAxis === "healthcare") {
    label = "Lacks Healthcare (%)";
  }
  else if (chosenXAxis === "smokes") {
    label = "Smokes (%)";
  }
  else {
    label = "Obese (%)";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${d[chosenXAxis]}<br>${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;

}

// Load data from data.csv
d3.csv("../D3_data_journalism/assets/data/data.csv").then(function(data, err) {
  if (err) throw err;
    // Print the Data to the Console
    // console.log(data);

    //  Parse Data/Cast as numbers
    data.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
      data.age = +data.age;
      data.income = +data.income;
      data.smokes = +data.smokes;
      data.obesity = +data.obesity;
    });

    // Create scale functions
    var xLinearScale = xScale(data, chosenXAxis);

    var yLinearScale = yScale(data, chosenYAxis);

    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append Axes to the chart
    chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // Append initial Circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", "10")
      .attr("fill", "#3288bd")
      .attr("opacity", ".5");


    // Add abbreviation labels to circles
    var circleLabels = chartGroup.selectAll(null).data(data).enter().append("text");
      
    circleLabels
        .attr("x", function(d) {
            return xLinearScale(d.poverty);
        })
        .attr("y", function(d) {
            return yLinearScale(d.healthcare);
        })
        .text(function(d) {
            return d.abbr;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .attr("text-anchor", "middle")
        .attr("fill", "white");

    // Create group for three x-axis labels
    var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${chartWidth}, ${chartHeight})`);

    // Create labels for each item on x axis
    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", -340)
        .attr("y", 35)
        .attr("value", "poverty") // value to grab for event listener
        .attr("font-family", "sans-serif")
        .text("In Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
      .attr("x", -340)
      .attr("y", 60)
      .attr("value", "age") // value to grab for event listener
      .attr("font-family", "sans-serif")
      .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
      .attr("x", -380)
      .attr("y", 85)
      .attr("value", "income") // value to grab for event listener
      .attr("font-family", "sans-serif")
      .text("Household Income (Median)");

    // Create group for three y-axis labels
    var ylabelsGroup = chartGroup.append("g")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - chartMargin.left)
      .attr("x", 0 - (chartHeight - 130));

    // Create labels for each item on y axis

    var healthcareLabel = ylabelsGroup.append("text")
      .attr("value", "income") 
      .attr("y", 0 - chartMargin.left + 50)
      .attr("x", 0 - (chartHeight - 180))
      .attr("dy", "1em")
      .classed("axis-text", true)
      .attr("font-family", "sans-serif")
      .text("Lacks Healthcare (%)");

    var smokesLabel = ylabelsGroup.append("text")
      .attr("value", "smokes") 
      .attr("y", 0 - chartMargin.left + 25)
      .attr("x", 0 - (chartHeight - 215))
      .attr("dy", "1em")
      .classed("axis-text", true)
      .attr("font-family", "sans-serif")
      .text("Smokes (%)");

    var obeseLabel = ylabelsGroup.append("text")
      .attr("value", "obese") 
      .attr("y", 0 - chartMargin.left)
      .attr("x", 0 - (chartHeight - 220))
      .attr("dy", "1em")
      .classed("axis-text", true)
      .attr("font-family", "sans-serif")
      .text("Obese (%)");


    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
    .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {

    // replaces chosenXAxis with value
    chosenXAxis = value;

    // t axis labels event listener
    ylabelsGroup.selectAll("text")
    .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

    // replaces chosenXAxis with value
    chosenYAxis = value;

    // console.log(chosenXAxis)

    // functions here found above csv import
    // updates x scale for new data
    xLinearScale = xScale(data, chosenXAxis);

    // updates x scale for new data
    yLinearScale = yScale(data, chosenYAxis);

    // updates x axis with transition
    xAxis = renderAxes(xLinearScale, xAxis);

    // updates y axis with transition
    yAxis = renderAxes(yLinearScale, yAxis);

    // updates circles with new x values
    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

    // updates tooltips with new info
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // changes classes to change bold text on X Axis
    if (chosenXAxis === "poverty") {
      povertyLabel
        .classed("active", true)
        .classed("inactive", false);
      ageLabel
        .classed("active", false)
        .classed("inactive", true);
      incomeLabel
        .classed("active", false)
        .classed("inactive", true);
    }
    else if (chosenXAxis === "age") {
      ageLabel
        .classed("active", true)
        .classed("inactive", false);
      incomeLabel
        .classed("active", false)
        .classed("inactive", true);
      povertyLabel
        .classed("active", false)
        .classed("inactive", true);
    }
    else {
      incomeLabel
        .classed("active", true)
        .classed("inactive", false);
      povertyLabel
        .classed("active", false)
        .classed("inactive", true);
      ageLabel
        .classed("active", false)
        .classed("inactive", true);
  }

  // changes classes to change bold text on Y Axis
  if (chosenYAxis === "healthcare") {
    healthcareLabel
      .classed("active", true)
      .classed("inactive", false);
    smokesLabel
      .classed("active", false)
      .classed("inactive", true);
    obeseLabel
      .classed("active", false)
      .classed("inactive", true);
  }
  else if (chosenYAxis === "smokes") {
    smokesLabel
      .classed("active", true)
      .classed("inactive", false);
    healthcareLabel
      .classed("active", false)
      .classed("inactive", true);
    obeseLabel
      .classed("active", false)
      .classed("inactive", true);
  }
  else {
    obeseLabel
      .classed("active", true)
      .classed("inactive", false);
    smokesLabel
      .classed("active", false)
      .classed("inactive", true);
    healthcareLabel
      .classed("active", false)
      .classed("inactive", true);
      }
    }
  });
}})});
