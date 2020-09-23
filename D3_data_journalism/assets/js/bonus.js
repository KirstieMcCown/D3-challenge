// SVG wrapper dimensions are determined by the current width
// and height of the browser window.
var svgWidth = 900;
var svgHeight = 600;

// Define the chart's margins as an object
var margin = {
  top: 20,
  right: 20,
  bottom: 100,
  left: 100,
};

// Define dimensions of the chart area
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Select body, append SVG area to it, and set the dimensions
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append a group to the SVG area and shift ('translate') it to the right and down to adhere
// to the margins set in the "margin" object.
var chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Parameters
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";
var xlabel;
var ylabel;

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // console.log(chosenXAxis)
  // create scales
  var xLinearScale = d3
    .scaleLinear()
    .domain([
      d3.min(data, (d) => d[chosenXAxis]) * 0.8,
      d3.max(data, (d) => d[chosenXAxis]) * 1.2,
    ])
    .range([0, width]);

  return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
  // console.log(chosenYAxis)
  // create scales
  var yLinearScale = d3
    .scaleLinear()
    .domain([
      d3.min(data, (d) => d[chosenYAxis]) * 0.8,
      d3.max(data, (d) => d[chosenYAxis]) * 1.2,
    ])
    .range([height, 0]);

  return yLinearScale;
}

// function used for updating X Axis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition().duration(1000).call(bottomAxis);

  return xAxis;
}

// function used for updating Y Axis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition().duration(1000).call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to new circles
function renderxCircles(circlesGroup, newXScale, chosenXAxis) {
  circlesGroup
    .transition()
    .duration(1000)
    .attr("cx", (d) => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group with a transition to new text
function renderxText(circleLabels, newXScale, chosenXAxis) {
  circleLabels
    .transition()
    .duration(1000)
    .attr("x", (d) => newXScale(d[chosenXAxis]));

  return circleLabels;
}

// function used for updating circles group with a transition to new circles
function renderyCircles(circlesGroup, newYScale, chosenYAxis) {
  circlesGroup
    .transition()
    .duration(1000)
    .attr("cy", (d) => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating circles group with a transition to new text
function renderyText(circleLabels, newYScale, chosenYAxis) {
  circleLabels
    .transition()
    .duration(1000)
    .attr("y", (d) => newYScale(d[chosenYAxis]));

  return circleLabels;
}

// function used for updating circles group and axes with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circleLabels) {
  if (chosenXAxis === "poverty") {
    xlabel = "In Poverty (%)";
  } else if (chosenXAxis === "age") {
    xlabel = "Age (Median)";
  } else {
    xlabel = "Household Income (Median)";
  }

  if (chosenYAxis === "healthcare") {
    ylabel = "Lacks Healthcare (%)";
  } else if (chosenYAxis === "smokes") {
    ylabel = "Smokes (%)";
  } else {
    ylabel = "Obese (%)";
  }

  var toolTip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function (d) {
      return `${d.state}<br>${xlabel}: ${d[chosenXAxis]}<br>${ylabel}: ${d[chosenYAxis]}`;
    });

  circleLabels.call(toolTip);

  //mouseover event
  circleLabels
    .on("mouseover", function (data) {
      toolTip.show(data);
    })
    // onmouseout event
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });

  return circleLabels;
}

// D3-challenge\D3_data_journalism\assets\data\data.csv

// Load data from data.csv
d3.csv("D3_data_journalism/assets/data/data.csv")
  .then(function (data, err) {
    if (err) throw err;
    // Print the Data to the Console
    console.log(data);

    //  Parse Data/Cast as numbers
    data.forEach(function (data) {
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
    // append x axis
    var xAxis = chartGroup
      .append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g").call(leftAxis);

    // Append initial Circles
    var circlesGroup = chartGroup
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => xLinearScale(d[chosenXAxis]))
      .attr("cy", (d) => yLinearScale(d[chosenYAxis]))
      .attr("r", "10")
      .attr("fill", "#3288bd")
      .attr("opacity", ".5")
      .attr("class", "stateCircle");

    // Add abbreviation labels to circles
    var circleLabels = chartGroup
      .append("g")
      .selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .attr("x", (d) => xLinearScale(d[chosenXAxis]))
      .attr("y", (d) => yLinearScale(d[chosenYAxis] - 0.25))
      .attr("class", "stateText")
      .style("fill", "black")
      .attr("text-anchor", "middle")
      .text((d) => d.abbr);

    // Create group for three x-axis labels
    var xlabelsGroup = chartGroup
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    // Create labels for each item on x axis
    var povertyLabel = xlabelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .classed("aText", true)
      .text("In Poverty (%)");

    var ageLabel = xlabelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .classed("aText", true)
      .text("Age (Median)");

    var incomeLabel = xlabelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .classed("aText", true)
      .text("Household Income (Median)");

    // Create group for three y-axis labels
    var ylabelsGroup = chartGroup
      .append("g")
      .attr("transform", `translate(${width + 20}, ${height / 2})`);

    // Create labels for each item on y axis
    var healthcareLabel = ylabelsGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("value", "healthcare")
      .attr("y", -840)
      .attr("x", 0)
      .classed("active", true)
      .classed("aText", true)
      .text("Lacks Healthcare (%)");

    var smokesLabel = ylabelsGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("value", "smokes")
      .attr("y", -860)
      .attr("x", 0)
      .classed("inactive", true)
      .classed("aText", true)
      .text("Smokes (%)");

    var obeseLabel = ylabelsGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("value", "obesity")
      .attr("y", -880)
      .attr("x", 0)
      .classed("inactive", true)
      .classed("aText", true)
      .text("Obese (%)");

    // call updateToolTip to update the tooltip information
    var circleLabels = updateToolTip(chosenXAxis, chosenYAxis, circleLabels);

    // x axis labels event listener
    xlabelsGroup.selectAll("text").on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
        // replaces chosenXAxis with value
        chosenXAxis = value;

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxis(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderxCircles(circlesGroup, xLinearScale, chosenXAxis);

        // update circles text with new x values
        circleLabels = renderxText(circleLabels, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circleLabels = updateToolTip(chosenXAxis, chosenYAxis, circleLabels);

        // changes classes to change bold text on X Axis
        if (chosenXAxis === "poverty") {
          povertyLabel.classed("active", true).classed("inactive", false);
          ageLabel.classed("active", false).classed("inactive", true);
          incomeLabel.classed("active", false).classed("inactive", true);
          xlabel = "In Poverty (%)";
        } else if (chosenXAxis === "age") {
          povertyLabel.classed("active", false).classed("inactive", true);
          ageLabel.classed("active", true).classed("inactive", false);
          incomeLabel.classed("active", false).classed("inactive", true);
          xlabel = "Age (Median)";
        } else {
          povertyLabel.classed("active", false).classed("inactive", true);
          ageLabel.classed("active", false).classed("inactive", true);
          incomeLabel.classed("active", true).classed("inactive", false);
          xlabel = "Household Income (Median)";
        }
      }
    });

    // y axis labels event listener
    ylabelsGroup.selectAll("text").on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {
        // replaces chosenXAxis with value
        chosenYAxis = value;

        // updates x scale for new data
        yLinearScale = yScale(data, chosenYAxis);

        // updates y axis with transition
        yAxis = renderYAxis(yLinearScale, yAxis);

        // updates circles with new y values
        circlesGroup = renderyCircles(circlesGroup, yLinearScale, chosenYAxis);

        // update circles text with new y values
        circleLabels = renderyText(circleLabels, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circleLabels = updateToolTip(chosenXAxis, chosenYAxis, circleLabels);

        // changes classes to change bold text on Y Axis
        if (chosenYAxis === "healthcare") {
          healthcareLabel.classed("active", true).classed("inactive", false);
          smokesLabel.classed("active", false).classed("inactive", true);
          obeseLabel.classed("active", false).classed("inactive", true);
          ylabel = "Lacks Healthcare (%)";
        } else if (chosenYAxis === "smokes") {
          healthcareLabel.classed("active", false).classed("inactive", true);
          smokesLabel.classed("active", true).classed("inactive", false);
          obeseLabel.classed("active", false).classed("inactive", true);
          ylabel = "Smokes (%)";
        } else {
          healthcareLabel.classed("active", false).classed("inactive", true);
          smokesLabel.classed("active", false).classed("inactive", true);
          obeseLabel.classed("active", true).classed("inactive", false);
          ylabel = "Obese (%)";
        }
      }
    });
  })
  .catch(function (error) {
    console.log(error);
  });
