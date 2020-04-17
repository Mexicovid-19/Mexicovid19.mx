// set the dimensions and margins of the graph
var estado; 
var maxy = [];
let max_edo = new Map();
var speed_lines = 150;
var speed_axis = 750;
var maxTemp;
var edosOnOff = [];
var my_array=[];
var topStates=[];

var margin = { top: 15, right: 80, bottom: 30, left: 50 },
  width =
    parseInt(d3.select("#chart").style("width")) - margin.left - margin.right,
  height =
    parseInt(d3.select("#chart").style("height")) - margin.top - margin.bottom;

// parse the date / time
var parseDate = d3.timeParse("%d-%b-%y");
var formatDate = d3.timeFormat("%Y-%m-%d");
var bisectDate = d3.bisector(d => d.date).left

// set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);
var color = d3.scaleOrdinal().range(d3.schemeCategory10);

// Define axes
var xAxis = d3.axisBottom().scale(x).tickFormat(d3.timeFormat("%d-%m")).ticks(d3.timeDay.every(3));
var yAxis = d3.axisLeft().scale(y);

 var formatDate = d3.timeFormat("%d-%m");

// Define lines
var line = d3
  .line()
  .curve(d3.curveCardinal)
  .x(function(d) {
    return x(d["date"]);
  })
  .x(d => x(d.date))
  .y(function(d) {
    return y(d["confirmado"]);
  });

  // Define svg canvas
var svg = d3
  .select("#chart")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Get the data
d3.csv("edos_date.csv").then(function(data) {

  // Set the color domain equal to the three product categories
  estado = d3.keys(data[0]).filter(function(key) {
    return key !== "date";
  });


  color.domain(estado);

    // Format the data field
  data.forEach(function(d) {
    d["date"] = parseDate(d["date"]);
  });


 var confirmados  = estado.map(function(category) {
      return {
        category: category,
        datapoints: data.map(function(d) {
          return {
            date: d["date"],
            confirmado: +d[category]};
        })
      };
    });

  // Scale the range of the data
var i,j;

for (i = 0; i < confirmados.length; i++) {
  var temp = [];
  for (j=0; j < confirmados[i].datapoints.length; j++){
    maxy.push(confirmados[i].datapoints[j].confirmado);
    temp.push(confirmados[i].datapoints[j].confirmado);
  }
  max_edo.set(estado[i],d3.max(temp));
}


const iterator1 = max_edo[Symbol.iterator]();

for (let item of iterator1) {
  my_array.push({key: item[0], value:item[1]});
}

my_array.sort((a, b) => (a.value < b.value) ? 1 : -1);
topStates.push(my_array[0].key);
topStates.push(my_array[1].key);
topStates.push(my_array[2].key);
topStates.push(my_array[3].key);
topStates.push(my_array[4].key);


  maxTemp = d3.max(maxy)
  x.domain(d3.extent(data, function(d) { return d["date"]; }));
  y.domain([0, maxTemp]);

    // Add the X Axis
  svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  // Add the Y Axis
  svg.append("g")
      .attr("class", "y-axis")
      .call(yAxis);

    // text label for the y axis
  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("class", "yAxisLabel")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Número de Confirmados Positivos (Tasa por 100,000 habitantes)");      


  var estados = svg
    .selectAll("#category")
    .data(confirmados)
    .enter()
    .append("g")
    .attr("class", "estados")
    .attr("id", function(d){
      return d.category;
    });

  // Add the valueline path.
  estados
    .append("path")
    .attr("class", "line")
    .attr("id", function(d){
      return "line_" + d.category;
    })
    .attr("d", function(d) {
      return line(d.datapoints);
    })
    .style("stroke", function(d) {
      return color(d.category);
    });

  estados    
    .append("text")
    .attr("class", "label")
    .attr("id", function(d){
      return "label_" + d.category;
    })
    .attr("transform", function(d) {
        return "translate(" + (width) + "," + y(d.datapoints[d.datapoints.length-1].confirmado) + ")";
      })
      .attr("x", 3)
      .attr("dy", ".35em")
      .text(function(d) {
        return d.category;
      })
      .style("fill", function(d) {
      return color(d.category);
    });


var focus = svg.append("g")
    .attr("class", "focus")
    .style("display", "none");

  focus.append("line").attr("class", "lineHover")
    .style("stroke", "#999")
    .attr("stroke-width", 1)
    .style("shape-rendering", "crispEdges")
    .style("opacity", 0.5)
    .attr("y1", -height)
    .attr("y2",0);

  focus.append("text").attr("class", "lineHoverDate")
    .attr("text-anchor", "middle")
    .attr("font-size", 12);

  var overlay = svg.append("rect")
    .attr("class", "overlay")
    .attr("x", margin.left)
    .attr("width", width-margin.left)
    .attr("height", height)


tooltip();


    svg.select("#label_NACIONAL")
      .style("fill", "black");

    svg.select("#line_NACIONAL")
      .style("stroke", "black")
      .style("stroke-dasharray", ("3, 3"))
      .style("stroke-width", "3");


var f = d3.format(".1f");

function tooltip() {
    
    var labels = focus.selectAll(".lineHoverText")
      .data(estado)

    labels.enter().append("text")
      .attr("class", "lineHoverText")
      .attr("id", function(d){
        return "lineHoverText_" + d;
      })
      .style("fill",  d => color(d))
      .attr("text-anchor", "start")
      .attr("font-size",12)
      .attr("dy", ".35em")
      //.attr("dy", (_, i) => 1 + i * 2 + "em");
      .merge(labels);

    var circles = focus.selectAll(".hoverCircle")
      .data(estado)

    circles.enter().append("circle")
      .attr("class", "hoverCircle")
      .attr("id", function(d){
        return "hoverCircle_" + d;
      })
      .style("fill", d => color(d))
      .attr("r", 5)
      .merge(circles);

    svg.selectAll(".overlay")
      .on("mouseover", function() { focus.style("display", null); })
      .on("mouseout", function() { focus.style("display", "none"); })
      .on("mousemove", mousemove);

    svg.select("#lineHoverText_NACIONAL")
      .style("fill", "black");

    svg.select("#hoverCircle_NACIONAL")
      .style("stroke", "black")
      .style("fill", "black")
      .style("stroke-dasharray", ("3, 3"))
      .style("stroke-width", "3");

    function mousemove() {

      var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.date > d1.date - x0 ? d1 : d0;

      focus.select(".lineHover")
        .attr("transform", "translate(" + x(d.date) + "," + height + ")");

      focus.select(".lineHoverDate")
        .attr("transform", 
          "translate(" + x(d.date) + "," + (height + margin.bottom) + ")")
        .text(formatDate(d.date));

      focus.selectAll(".hoverCircle")
        .attr("cy", function(e){
          return y(d[e]);
        })
        .attr("cx", x(d.date));

      focus.selectAll(".lineHoverText")
        .attr("transform", function(e){
          return "translate(" + (x(d.date)) + "," + y(d[e]) + ")";
        })
        .text(e => e + " " + f(d[e]));

      x(d.date) > (width - width / 4) 
        ? focus.selectAll("text.lineHoverText")
          .attr("text-anchor", "end")
          .attr("dx", -5)
        : focus.selectAll("text.lineHoverText")
          .attr("text-anchor", "start")
          .attr("dx", 5)
    }
  }



function updateOff(input) {
   edosOnOff.push(input);
    var i;
    var new_max = [];
    for (i = 0; i < max_edo.size; i++) {
      if (!edosOnOff.includes(estado[i])){
        new_max.push(max_edo.get(estado[i]));
      }
    }

    
    y.domain([0, d3.max(new_max)]);

    svg.selectAll(".y-axis").transition()
      .duration(speed_axis)
      .call(yAxis);
  
    svg.selectAll(".line")
    .transition()
    .duration(750)
    .attr("d", function(d) {
      return line(d.datapoints);
    });

    svg.selectAll(".label")
    .transition()
    .duration(speed_axis)
    .attr("transform", function(d) {
        return "translate(" + (width) + "," + y(d.datapoints[d.datapoints.length-1].confirmado) + ")";
    });

    svg.select("#"+input)
    .transition()
    .duration(speed_lines)
    .style("opacity", 0);

    svg.select("#lineHoverText_"+input)
    .transition()
    .duration(speed_lines)
    .style("opacity", 0);

     svg.select("#hoverCircle_"+input)
    .transition()
    .duration(speed_lines)
    .style("opacity", 0);

}


function updateOn(input) {
   var k = edosOnOff.indexOf(input);
   edosOnOff.splice(k, 1);
    var i;
    var new_max = [];
    for (i = 0; i < max_edo.size; i++) {
      if (!edosOnOff.includes(estado[i])){
        new_max.push(max_edo.get(estado[i]));
      }
    }
    
    y.domain([0, d3.max(new_max)]);

    svg.selectAll(".y-axis").transition()
      .duration(speed_axis)
      .call(yAxis);
  
    svg.selectAll(".line")
    .transition()
    .duration(750)
    .attr("d", function(d) {
      return line(d.datapoints);
    });

    svg.selectAll(".label")
    .transition()
    .duration(speed_axis)
    .attr("transform", function(d) {
        return "translate(" + (width) + "," + y(d.datapoints[d.datapoints.length-1].confirmado) + ")";
    });

    svg.select("#"+input)
    .transition()
    .duration(speed_lines)
    .style("opacity", 1);

    svg.select("#lineHoverText_"+input)
    .transition()
    .duration(speed_lines)
    .style("opacity", 1);

     svg.select("#hoverCircle_"+input)
    .transition()
    .duration(speed_lines)
    .style("opacity", 1);

}

var switch_AGS = document.querySelector("input[name=switch_AGS]");
var switch_BC = document.querySelector("input[name=switch_BC]");
var switch_BCS = document.querySelector("input[name=switch_BCS]");
var switch_CAMP = document.querySelector("input[name=switch_CAMP]");
var switch_CHIS = document.querySelector("input[name=switch_CHIS]");
var switch_CHIH = document.querySelector("input[name=switch_CHIH]");
var switch_CDMX = document.querySelector("input[name=switch_CDMX]");
var switch_COAH = document.querySelector("input[name=switch_COAH]");
var switch_COL = document.querySelector("input[name=switch_COL]");
var switch_DGO = document.querySelector("input[name=switch_DGO]");
var switch_GTO = document.querySelector("input[name=switch_GTO]");
var switch_GRO = document.querySelector("input[name=switch_GRO]");
var switch_HGO = document.querySelector("input[name=switch_HGO]");
var switch_JAL = document.querySelector("input[name=switch_JAL]");
var switch_MEX = document.querySelector("input[name=switch_MEX]");
var switch_MICH = document.querySelector("input[name=switch_MICH]");
var switch_MOR = document.querySelector("input[name=switch_MOR]");
var switch_NAY = document.querySelector("input[name=switch_NAY]");
var switch_NL = document.querySelector("input[name=switch_NL]");
var switch_OAX = document.querySelector("input[name=switch_OAX]");
var switch_PUE = document.querySelector("input[name=switch_PUE]");
var switch_QRO = document.querySelector("input[name=switch_QRO]");
var switch_QROO = document.querySelector("input[name=switch_QROO]");
var switch_SIN  = document.querySelector("input[name=switch_SIN]");
var switch_SLP = document.querySelector("input[name=switch_SLP]");
var switch_SON = document.querySelector("input[name=switch_SON]");
var switch_TAB = document.querySelector("input[name=switch_TAB]");
var switch_TAMP = document.querySelector("input[name=switch_TAMP]");
var switch_TLAX = document.querySelector("input[name=switch_TLAX]");
var switch_VER = document.querySelector("input[name=switch_VER]");
var switch_YUC = document.querySelector("input[name=switch_YUC]");
var switch_ZAC = document.querySelector("input[name=switch_ZAC]");
var switch_TODOS = document.querySelector("input[name=switch_TODOS]");
var switch_NACIONAL = document.querySelector("input[name=switch_NACIONAL]");


function arrayRemove(arr, value) { return arr.filter(function(ele){ return ele != value; });}

switch_AGS.addEventListener('change', function() {
  if (this.checked) {
    updateOn("AGS");
    topStates.push("AGS");
  }else{
    updateOff("AGS");
    topStates = arrayRemove(topStates, "AGS");
 }
});

switch_BC.addEventListener('change', function() {
  if (this.checked) {
    updateOn("BC");
    topStates.push("BC");
  }else{
    updateOff("BC");
    topStates = arrayRemove(topStates, "BC");
 }
});

switch_BCS.addEventListener('change', function() {
  if (this.checked) {
    updateOn("BCS");
    topStates.push("BCS");
  }else{
    updateOff("BCS");
    topStates = arrayRemove(topStates, "BCS");
 }
});

switch_CAMP.addEventListener('change', function() {
  if (this.checked) {
    updateOn("CAMP");
    topStates.push("CAMP");
  }else{
    updateOff("CAMP");
    topStates = arrayRemove(topStates, "CAMP");
 }
});

switch_CHIS.addEventListener('change', function() {
  if (this.checked) {
    updateOn("CHIS");
    topStates.push("CHIS");
  }else{
    updateOff("CHIS");
    topStates = arrayRemove(topStates, "CHIS");
 }
});

switch_CHIH.addEventListener('change', function() {
  if (this.checked) {
    updateOn("CHIH");
    topStates.push("CHIH");
  }else{
    updateOff("CHIH");
    topStates = arrayRemove(topStates, "CHIH");
 }
});

switch_CDMX.addEventListener('change', function() {
  if (this.checked) {
    updateOn("CDMX");
    topStates.push("CDMX");
  }else{
    updateOff("CDMX");
    $("#"+estado[i]+"_s").attr("checked", false);
     topStates = arrayRemove(topStates, "CDMX");
 }
});

switch_COAH.addEventListener('change', function() {
  if (this.checked) {
    updateOn("COAH");
    topStates.push("COAH");
  }else{
    updateOff("COAH");
    topStates = arrayRemove(topStates, "COAH");
 }
});

switch_COL.addEventListener('change', function() {
  if (this.checked) {
    updateOn("COL");
    topStates.push("COL");
  }else{
    updateOff("COL");
    topStates = arrayRemove(topStates, "COL");
 }
});

switch_DGO.addEventListener('change', function() {
  if (this.checked) {
    updateOn("DGO");
    topStates.push("DGO");
  }else{
    updateOff("DGO");
    topStates = arrayRemove(topStates, "DGO");
 }
});

switch_GTO.addEventListener('change', function() {
  if (this.checked) {
    updateOn("GTO");
    topStates.push("GTO");
  }else{
    updateOff("GTO");
    topStates = arrayRemove(topStates, "GTO");
 }
});

switch_GRO.addEventListener('change', function() {
  if (this.checked) {
    updateOn("GRO");
    topStates.push("GRO");
  }else{
    updateOff("GRO");
    topStates = arrayRemove(topStates, "GRO");
 }
});

switch_HGO.addEventListener('change', function() {
  if (this.checked) {
    updateOn("HGO");
    topStates.push("HGO");
  }else{
    updateOff("HGO");
    topStates = arrayRemove(topStates, "HGO");
 }
});

switch_JAL.addEventListener('change', function() {
  if (this.checked) {
    updateOn("JAL");
    topStates.push("JAL");
  }else{
    updateOff("JAL");
    topStates = arrayRemove(topStates, "JAL");
 }
});

switch_MEX.addEventListener('change', function() {
  if (this.checked) {
    updateOn("MEX");
    topStates.push("MEX");
  }else{
    updateOff("MEX");
    topStates = arrayRemove(topStates, "MEX");
 }
});

switch_MICH.addEventListener('change', function() {
  if (this.checked) {
    updateOn("MICH");
    topStates.push("MICH");
  }else{
    updateOff("MICH");
    topStates = arrayRemove(topStates, "MICH");
 }
});

switch_MOR.addEventListener('change', function() {
  if (this.checked) {
    updateOn("MOR");
    topStates.push("MOR");
  }else{
    updateOff("MOR");
    topStates = arrayRemove(topStates, "MOR");
 }
});

switch_NAY.addEventListener('change', function() {
  if (this.checked) {
    updateOn("NAY");
    topStates.push("NAY");
  }else{
    updateOff("NAY");
    topStates = arrayRemove(topStates, "NAY");
 }
});

switch_NL.addEventListener('change', function() {
  if (this.checked) {
    updateOn("NL");
    topStates.push("NL");
  }else{
    updateOff("NL");
    topStates = arrayRemove(topStates, "NL");
 }
});

switch_OAX.addEventListener('change', function() {
  if (this.checked) {
    updateOn("OAX");
    topStates.push("OAX");
  }else{
    updateOff("OAX");
    topStates = arrayRemove(topStates, "OAX");
 }
});

switch_PUE.addEventListener('change', function() {
  if (this.checked) {
    updateOn("PUE");
    topStates.push("PUE");
  }else{
    updateOff("PUE");
    topStates = arrayRemove(topStates, "PUE");
 }
});

switch_QRO.addEventListener('change', function() {
  if (this.checked) {
    updateOn("QRO");
    topStates.push("QRO");
  }else{
    updateOff("QRO");
    topStates = arrayRemove(topStates, "QRO");
 }
});

switch_QROO.addEventListener('change', function() {
  if (this.checked) {
    updateOn("QROO");
    topStates.push("QROO");
  }else{
    updateOff("QROO");
    topStates = arrayRemove(topStates, "QROO");
 }
});

switch_SIN.addEventListener('change', function() {
  if (this.checked) {
    updateOn("SIN");
    topStates.push("SIN");
  }else{
    updateOff("SIN");
    topStates = arrayRemove(topStates, "SIN");
 }
});

switch_SLP.addEventListener('change', function() {
  if (this.checked) {
    updateOn("SLP");
    topStates.push("SLP");
  }else{
    updateOff("SLP");
    topStates = arrayRemove(topStates, "SLP");
 }
});

switch_SON.addEventListener('change', function() {
  if (this.checked) {
    updateOn("SON");
    topStates.push("SON");
  }else{
    updateOff("SON");
    topStates = arrayRemove(topStates, "SON");
 }
});

switch_TAB.addEventListener('change', function() {
  if (this.checked) {
    updateOn("TAB");
    topStates.push("TAB");
  }else{
    updateOff("TAB");
    topStates = arrayRemove(topStates, "TAB");
 }
});

switch_TAMP.addEventListener('change', function() {
  if (this.checked) {
    updateOn("TAMP");
    topStates.push("TAMP");
  }else{
    updateOff("TAMP");
    topStates = arrayRemove(topStates, "TAMP");
 }
});

switch_TLAX.addEventListener('change', function() {
  if (this.checked) {
    updateOn("TLAX");
    topStates.push("TLAX");
  }else{
    updateOff("TLAX");
    topStates = arrayRemove(topStates, "TLAX");
 }
});

switch_VER.addEventListener('change', function() {
  if (this.checked) {
    updateOn("VER");
    topStates.push("VER");
  }else{
    updateOff("VER");
    topStates = arrayRemove(topStates, "VER");
 }
});

switch_YUC.addEventListener('change', function() {
  if (this.checked) {
    updateOn("YUC");
    topStates.push("YUC");
  }else{
    updateOff("YUC");
    topStates = arrayRemove(topStates, "YUC");
 }
});

switch_ZAC.addEventListener('change', function() {
  if (this.checked) {
    updateOn("ZAC");
    topStates.push("ZAC");
  }else{
    updateOff("ZAC");
    topStates = arrayRemove(topStates, "ZAC");
 }
});

switch_NACIONAL.addEventListener('change', function() {
  if (this.checked) {
    updateOn("NACIONAL");
    topStates.push("NACIONAL");
  }else{
    updateOff("NACIONAL");
    topStates = arrayRemove(topStates, "NACIONAL");
 }
});

TODOS_s.addEventListener('change', function() {
  if (this.checked) {
    for (i = 0; i < estado.length; i++) {
      if(!topStates.includes(estado[i])){
        console.log(estado[i]);
        $( "#"+estado[i]+"_s" ).prop("checked", true);
        updateOn(estado[i]);
      }
      }
    }else{
      $( "#TODOS_s" ).prop("checked", false)
    }
});


//$( "#CDMX_s" ).attr("checked", true);
//$("#CDMX_s").is(":checked")
//$( "#DGO_s" ).attr("checked", false)
topStates.push("NACIONAL");

for (i = 0; i < estado.length; i++) {
  if(!topStates.includes(estado[i])){
    //console.log(estado[i]);
    $( "#"+estado[i]+"_s" ).prop("checked", false);
    updateOff(estado[i]);
  }
}


});