// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Event listner for clicks on links in a browser action popup.
// Open the link in a new tab of the current window.
	var nodeList = [];
	var linkList = [];
	var refList = [];
	
	var processedVisitCalls = 0;
	var processedHistoryCalls = 0;
	var historyCount = 0;

	nodeList.push({
					name: "f",
					group: 2,
					url: "uu",
					title: "tt"
				});	
				
	var processVisit = function(historyItem){
	return function(visitItems) {	
		historyCount--;
		for (var j = 0; j < visitItems.length; j++) {
			
			if(visitItems[j].transition == "link"){
			nodeList.push({
					name: visitItems[j].visitId,
					group: parseInt(visitItems[j].id),
					url: historyItem.url,
					title: historyItem.title
				});	
			  
			refList.push(parseInt(visitItems[j].referringVisitId));
			}
		  }
		  if(historyCount == 0){
			afterHistory();
		  }
		}};
  
	function afterHistory(){
		var len = refList.length;
		for (var i = 0; i < len; i++) {	
		if(refList[i] != 0){
		for (var j = 0; j < len; j++) {
			if (nodeList[j].name == refList[i])
			break;
		}
		
		linkList.push({
                source: j,
                target: i,
				value: 1
            });
			}
		}
		doGraph();
	}
  
	var processHistory = function(historyItems) {
		// For each history item, get details on all visits. 
		historyCount = historyItems.length;
		
		for (var i = 0; i < historyItems.length; i++) {     
			var url = historyItems[i].url;        
			chrome.history.getVisits({url: url}, processVisit(historyItems[i]));
		}
}

var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
  var oneWeekAgo = (new Date).getTime() - microsecondsPerWeek;
  chrome.history.search({'text': '', 'startTime': 0},processHistory);

 var print_r = function (obj, t) {
 
    // define tab spacing
    var tab = t || '';
 
    // check if it's array
    var isArr = Object.prototype.toString.call(obj) === '[object Array]';
	
    // use {} for object, [] for array
    var str = isArr ? ('Array\n' + tab + '[\n') : ('Object\n' + tab + '{\n');
 
    // walk through it's properties
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            var val1 = obj[prop];
            var val2 = '';
            var type = Object.prototype.toString.call(val1);
            switch (type) {
                
                // recursive if object/array
                case '[object Array]':
                case '[object Object]':
                    val2 = print_r(val1, (tab + '\t'));
                    break;
					
                case '[object String]':
                    val2 = '\'' + val1 + '\'';
                    break;
					
                default:
                    val2 = val1;
            }
            str += tab + '\t' + prop + ' => ' + val2 + ',\n';
        }
    }
	
    // remove extra comma for last property
    str = str.substring(0, str.length - 2) + '\n' + tab;
	
    return isArr ? (str + ']') : (str + '}');
};

function doGraph(){
var width = 960,
    height = 500;

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-120)
    .linkDistance(30)
    .size([width, height]);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

  force
      .nodes(nodeList)
      .links(linkList)
      .start();

  var link = svg.selectAll(".link")
      .data(linkList)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return Math.sqrt(d.value); });

  var node = svg.selectAll(".node")
      .data(nodeList)
    .enter().append("circle")
      .attr("class", "node hastooltip")
      .attr("r", 5)
      .style("fill", function(d) { return color(d.group); })
      .call(force.drag);

 // node.append("title").text(function(d) { return d.name; });
 // inferior tooltip has been replaced by qTip2
  node.append("xhtml:div").html(function(d)
  { return "<a href='"+d.url+"'>"+d.title+"</a>"}); 
//{ return wsr_snapshot(d.url, 'lAiJzVkHumfW', 's')});
  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  });
   
  $('.hastooltip').each(function() { // Notice the .each() loop, discussed below
    $(this).qtip({
        content: {
            text: $(this).children('div') // Use the "div" element next to this for the content
        },
		hide: {
          fixed: true,
          delay: 500
     }
    });
});
}
