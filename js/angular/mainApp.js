var mainApp = angular.module('mainApp', ['ui.bootstrap', 'ui.router']);



mainApp.config(['$stateProvider', '$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  // For unmatched routes
  $urlRouterProvider.otherwise('/');

  // Application routes
  $stateProvider
  .state('livechart', {
    url: '/livechart',
    templateUrl: 'templates/live_chart.html',
    controller : "liveChartCtrl"
  })
  .state('barchart', {
    url: '/barchart',
    templateUrl: 'templates/bar_chart.html',
    controller : "barChartCtrl"
  })
  .state('userentry', {
    url: '/userentry',
    templateUrl: 'templates/user_entry.html'
  });
}
]);



mainApp.controller('mainCtrl', function mainCtrl($scope, $http, $interval) {
  $scope.promise;
  $scope.title = "Server Monitor - Home";
  $scope.toggle = true;
  $scope.toggleSidebar = function() {
    $scope.toggle = !$scope.toggle;
  };


  var putData = function(phone) {
    $http.post('/phones', phone).then(function() {
      return ctrl.getPhones();
    });
  };
});


mainApp.controller('liveChartCtrl', function liveChartCtrl($scope, $http, $interval, $compile) {

  $scope.resourceType;

  $scope.loadConfiguredChart = function(){
    if(!$scope.resourceType){
      $scope.resourceType = 1;
    }
    $scope.configured = true;
    $interval.cancel($scope.promise);
    var el = $compile('<line-chart-div class="graph"></line-chart-div>')($scope);
    var lineChartDiv = angular.element(document.getElementById('line-chart-div'));
    lineChartDiv.empty();
    lineChartDiv.append(el[0]);
  }


  $scope.changeResource = function(resourceType){
    $scope.configured = false;
    $interval.cancel($scope.promise);
    $scope.resourceType = resourceType;
    var el = $compile('<line-chart-div class="graph"></line-chart-div>')($scope);
    var lineChartDiv = angular.element(document.getElementById('line-chart-div'));
    lineChartDiv.empty();
    lineChartDiv.append(el[0]);
  }
});


mainApp.controller('barChartCtrl', function barChartCtrl($scope, $http, $interval, $compile) {
  $interval.cancel($scope.promise);
  $scope.datePickerDate = new Date((new Date().getTime()-40000)) + " - " + new Date()
  $scope.resourceType;

  $scope.loadConfiguredChart = function(){
    if(!$scope.resourceType){
      $scope.resourceType = 1;
    }
    $scope.configured = true;
    var el = $compile('<line-chart-div class="graph"></line-chart-div>')($scope);
    var lineChartDiv = angular.element(document.getElementById('line-chart-div'));
    lineChartDiv.empty();
    lineChartDiv.append(el[0]);
  }


  $scope.changeResource = function(resourceType){
    $scope.configured = false;
    $interval.cancel($scope.promise);
    $scope.resourceType = resourceType;
    var el = $compile('<bar-chart-div></bar-chart-div>')($scope);
    var barChartDiv = angular.element(document.getElementById('bar-chart-div'));
    barChartDiv.empty();
    barChartDiv.append(el[0]);
  }
});




mainApp.directive('lineChartDiv', function($window, $http, $interval){
  return{
    restrict:'EA',
    template:'<div class="row"><div class="col-lg-12"><form><button type="button" class="btn btn-primary pull-right" data-toggle="modal" data-target="#configModal"><span class="glyphicon glyphicon-wrench" aria-hidden="true"></span>&nbsp;Configure Chart</button></form></div></div><div></div>',
    link: function(scope, elem, attrs){

      var resourceType = scope.resourceType;

      //dynamic variables
      var chartTitle, xLabel, yLabel, yMax, dataTypeString, noOfLines, colorArr;

      switch (resourceType) {
        case 1:
        chartTitle = "CPU Usage";
        xLabel = "Time (" + new Date().toDateString() + ")" ;
        yLabel = "CPU Usage (%)";
        yMax = 0.1;
        dataTypeString = "cpu_usage";
        noOfLines = 1;
        colorArr =	[["CPU Usage", "#FF6F00"]];
        break;
        case 2:
        chartTitle = "Memory Usage";
        xLabel = "Time (" + new Date().toDateString() + ")" ;
        yLabel = "Memory Usage (Mega Bytes)";
        yMax = 5000;
        dataTypeString = "memory_usage";
        noOfLines = 1;
        colorArr =	[["Memory Usage", "#FF6F00"]];
        break;
        case 3:
        chartTitle = "Memory Available";
        xLabel = "Time (" + new Date().toDateString() + ")" ;
        yLabel = "Memory Available (Mega Bytes)";
        yMax = 5000;
        dataTypeString = "memory_available";
        noOfLines = 1;
        colorArr =	[["Memory Available", "#FF6F00"]];
        break;
        case 4:
        chartTitle = "Network Packet";
        xLabel = "Time (" + new Date().toDateString() + ")" ;
        yLabel = "Number of Packets";
        yMax = 1000;
        dataTypeString = "network_packet";
        noOfLines = 2;
        colorArr =	[["In", "#1976D2"], ["Out", "#2E7D32"]];
        break;
        case 5:
        chartTitle = "Network Throughput";
        xLabel = "Time (" + new Date().toDateString() + ")" ;
        yLabel = "Network Throughput (Mega Bytes)";
        yMax = 20000;
        dataTypeString = "network_throughput";
        noOfLines = 2;
        colorArr =	[["In", "#1976D2"], ["Out", "#2E7D32"]];
        break;
        case 6:
        chartTitle = "Errors";
        xLabel = "Time (" + new Date().toDateString() + ")" ;
        yLabel = "Number of Errors";
        yMax = 10;
        dataTypeString = "errors";
        noOfLines = 3;
        colorArr =	[["System", "#C2185B"], ["Sensor", "#303F9F"], ["Component", "#0097A7"]];
        break;
        default:
      }

      if(scope.configured){
        if(scope.chtit)
        chartTitle = scope.chtit;
        if(scope.xlab)
        xLabel = scope.xlab ;
        if(scope.ylab)
        yLabel = scope.ylab;
        if(scope.ccol){
          var tempArr = scope.ccol.split(",");
          for(i in tempArr){
            if(colorArr[i])
            colorArr[i][1] = tempArr[i].trim();
          }
        }

      }

      var d3 = $window.d3;
      var rawSvg=elem.find('div');
      var svg = d3.select(rawSvg[0]).append('svg');


      var margin = {top: 40, right: 210, bottom: 80, left: 90},
      width = 1200 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;


      var t = new Date().getTime();
      var n = 40000;
      var v = 0;

      var data = [];
      for(i = 0; i < noOfLines; i++){
        data[i] = d3.range(n).map(initData);
      }


      function initData () {
        return {
          time: t,
          value: v
        };
      }

      var tickFormat = "%H:%M:%S";
      var x = d3.time.scale()
      .domain([t-n, t])
      .range([0, width])
      .clamp(true);

      var y = d3.scale.linear()
      .domain([0, yMax])
      .range([height, 0]);

      var line = [];
      for(i = 0; i < noOfLines; i++){
        line[i] = d3.svg.line()
        .interpolate('basis')
        .x(function(d, i) { return x(d.time); })
        .y(function(d, i) { return y(d.value); });
      }


      svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

      var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var graph = g.append("svg")
      .attr("width", width)
      .attr("height", height + margin.top + margin.bottom);

      var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickFormat(d3.time.format(tickFormat)).tickSubdivide(true).tickSize(8).tickPadding(6);

      var yAxis = d3.svg.axis().scale(y).orient("left");
      var yaxis = g.append("g")
      .attr("class", "y axis")
      .call(yAxis);

      var axis = graph.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);


      var path = [];
      for(i = 0; i < noOfLines; i++){
        var color = colorArr[i][1];
        path[i] = graph.append("g")
        .append("path")
        .data([data[i]])
        .attr("class", "line")
        .attr('stroke', color)
        .attr("d", line[i]);
      }


      // now add titles to the axes
      svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate("+ (margin.left/3) +","+(height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
      .text(yLabel);

      svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate("+ ((width + margin.left)/2) +","+(height+(margin.bottom))+")")  // centre below axis
      .text(xLabel);

      svg.append("text")
      .attr("x", ((width + margin.left)/2))
      .attr("y", margin.top/2)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("text-decoration", "underline")
      .text(chartTitle);


      // add legend
      var legend = svg.append("g")
      .attr("class", "legend")
      //.attr("x", w - 65)
      //.attr("y", 50)
      .attr("height", 100)
      .attr("width", 100)
      .attr('transform', 'translate(-20,50)');

      var legendRect = legend.selectAll('rect').data(colorArr);

      legendRect.enter()
      .append("rect")
      .attr("x", width + margin.left + 30)
      .attr("width", 10)
      .attr("height", 10);

      legendRect
      .attr("y", function(d, i) {
        return i * 20;
      })
      .style("fill", function(d) {
        return d[1];
      });

      var legendText = legend.selectAll('text').data(colorArr);

      legendText.enter()
      .append("text")
      .attr("x", width + margin.left + 45);

      legendText
      .attr("y", function(d, i) {
        return i * 20 + 9;
      })
      .text(function(d) {
        return d[0];
      });

      function tick(newDataJSON)
      {
        var newTime = [];
        var newValue = [];
        for(i = 0; i < newDataJSON.length; i++){
          newTime[i] = newDataJSON[i].time;
          newValue[i] = newDataJSON[i].value;
        }

        // push a new data point onto the back
        for(i = 0; i < noOfLines; i++){
          data[i].push({ "time" : newTime[i], "value" : newValue[i] });
        }


        // redraw path, shift path left
        for(i = 0; i < noOfLines; i++){
          path[i]
          .attr("d", line[i])
          .transition()
          .duration(500)
          .ease("linear")
          .attr("transform", "translate(" + t - 1 + ")");
        }


        // update X domain
        x.domain([newTime[0] - n, newTime[0]]);

        // shift X axis left
        axis
        .transition()
        .duration(500)
        .ease("linear")
        .call(xAxis);

        // update Y domain and axis
        if(newValue[0] > yMax){
          yMax = newValue[0];
          y.domain([0, yMax]);
          //Adjust y-axis
          yaxis.transition()
          .ease('linear')
          .call(yAxis);
        }

        // pop the old data point off the front
        for(i = 0; i < noOfLines; i++){
          data[i].shift();
        }
      }

      var getData = function() {
        var st = new Date().getTime() - 40000;
        var et = new Date().getTime();
        $http({
          method : "GET",
          url : '/server_stat_live'
        }).then(function(res) {
          if(res.status == 200){
            var resourceData = res.data.data[0][dataTypeString];
            var timestamp = res.data.data[0].timestamp;
            var dataJSON =  [];
            console.log(resourceData);
            if(typeof resourceData == 'object'){
              var keysArr = Object.keys(resourceData);
              var JSONlength = keysArr.length;
              for(i in keysArr){
                dataJSON.push({
                  time: timestamp,
                  value: resourceData[keysArr[i]]
                });
              }
            }else{
              dataJSON.push({
                time: timestamp,
                value: resourceData
              });
            }
            console.log(dataJSON);
            tick(dataJSON);
          }
        },function(err) {
          console.log(err);
        });
      }
      scope.promise = $interval(getData, 1000);
    }
  };
});



//----------------------------------------------------BAR CHART DIRECTIVE-------------------------------------------------------//

mainApp.directive('barChartDiv', function($window, $http, $interval){
  return{
    restrict:'EA',
    template:"<div></div>",
    link: function(scope, elem, attrs){

      var resourceType = scope.resourceType;

      //dynamic variables
      var chartTitle, xLabel, yLabel, yMax, dataTypeString, noOfLines;

      switch (resourceType) {
        case 1:
        chartTitle = "CPU Usage";
        xLabel = "Time (" + new Date().toDateString() + ")" ;
        yLabel = "CPU Usage (%)";
        yMax = 0.1;
        dataTypeString = "cpu_usage";
        noOfLines = 1;
        break;
        case 2:
        chartTitle = "Memory Usage";
        xLabel = "Time (" + new Date().toDateString() + ")" ;
        yLabel = "Memory Usage (Mega Bytes)";
        yMax = 5000;
        dataTypeString = "memory_usage";
        noOfLines = 1;
        break;
        case 3:
        chartTitle = "Memory Available";
        xLabel = "Time (" + new Date().toDateString() + ")" ;
        yLabel = "Memory Available (Mega Bytes)";
        yMax = 5000;
        dataTypeString = "memory_available";
        noOfLines = 1;
        break;
        case 4:
        chartTitle = "Network Packet";
        xLabel = "Time (" + new Date().toDateString() + ")" ;
        yLabel = "Number of Packets";
        yMax = 1000;
        dataTypeString = "network_packet";
        noOfLines = 2;
        break;
        case 5:
        chartTitle = "Network Throughput";
        xLabel = "Time (" + new Date().toDateString() + ")" ;
        yLabel = "Network Throughput (Mega Bytes)";
        yMax = 20000;
        dataTypeString = "network_throughput";
        noOfLines = 2;
        break;
        case 6:
        chartTitle = "Errors";
        xLabel = "Time (" + new Date().toDateString() + ")" ;
        yLabel = "Number of Errors";
        yMax = 10;
        dataTypeString = "errors";
        noOfLines = 3;
        break;
        default:
      }

      var d3 = $window.d3;
      var rawSvg=elem.find('div');
      var svg = d3.select(rawSvg[0]).append('svg');


      var margin = {top: 40, right: 10, bottom: 80, left: 90},
      width = 1000 - margin.left - margin.right,
      height = 550 - margin.top - margin.bottom;


      // var data = [];
      // for(i = 0; i < noOfLines; i++){
      //   data[i] = d3.range(n).map(initData);
      // }

      var tickFormat = "%H:%M:%S";

      var n = 20, // number of samples
      m = 1; // number of series

      var data = d3.range(m).map(function() { return d3.range(n).map(Math.random); });
      function initData () {
        return {
          time: t,
          value: v
        };
      }

      var y = d3.scale.linear()
      .domain([0, 1])
      .range([height, 0]);

      // var t = new Date().getTime();
      // var tt = 40000;
      // var xScale = d3.scale.linear().domain([t-tt, t]);
      // var x0 = d3.scale.ordinal().domain(xScale.ticks(10)).rangeBands([0, width], .2);
      var x0 = d3.scale.ordinal()
      .domain(d3.range(n))
      .rangeBands([0, width], .2);

      var x1 = d3.scale.ordinal()
      .domain(d3.range(m))
      .rangeBands([0, x0.rangeBand()]);

      var z = d3.scale.category10();

      var xAxis = d3.svg.axis()
      .scale(x0)
      .orient("bottom")
      .tickFormat(d3.time.format("%Y-%m-%d"));

      var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");


      svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

      var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var graph = g.append("svg")
      .attr("width", width)
      .attr("height", height + margin.top + margin.bottom);


      var xAxis = d3.svg.axis()
      .scale(x0)
      .orient("bottom");

      var yAxis = d3.svg.axis().scale(y).orient("left");
      var yaxis = g.append("g")
      .attr("class", "y axis")
      .call(yAxis);

      var axis = graph.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

      svg.append("g").selectAll("g")
      .data(data)
      .enter().append("g")
      .style("fill", function(d, i) { return z(i); })
      .attr("transform", function(d, i) { return "translate(" + x1(i) + ",0)"; })
      .selectAll("rect")
      .data(function(d) { return d; })
      .enter().append("rect")
      .attr("width", x1.rangeBand())
      .attr("height", y)
      .attr("x", function(d, i) { return margin.left + x0(i); })
      .attr("y", function(d) { return height + margin.bottom - margin.top - y(d); });


      // now add titles to the axes
      svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "translate("+ (margin.left/3) +","+(height/2)+")rotate(-90)")
      .text(yLabel);

      svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "translate("+ ((width + margin.left + margin.right)/2) +","+(height+(margin.bottom))+")")
      .text(xLabel);

      svg.append("text")
      .attr("x", ((width + margin.left + margin.right)/2))
      .attr("y", margin.top/2)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("text-decoration", "underline")
      .text(chartTitle);


      // //add legend
      // var legend = svg.append("g")
      // .attr("class", "legend")
      // //.attr("x", w - 65)
      // //.attr("y", 50)
      // .attr("height", 100)
      // .attr("width", 100)
      // .attr('transform', 'translate(-20,50)');
      //
      // var legendRect = legend.selectAll('rect').data(colorArr);
      //
      // legendRect.enter()
      // .append("rect")
      // .attr("x", w - 65)
      // .attr("width", 10)
      // .attr("height", 10);
      //
      // legendRect
      // .attr("y", function(d, i) {
      //   return i * 20;
      // })
      // .style("fill", function(d) {
      //   return d[1];
      // });
      //
      // var legendText = legend.selectAll('text').data(colorArr);
      //
      // legendText.enter()
      // .append("text")
      // .attr("x", w - 52);
      //
      // legendText
      // .attr("y", function(d, i) {
      //   return i * 20 + 9;
      // })
      // .text(function(d) {
      //   return d[0];
      // });

      var getDataBar = function() {
        var st = new Date().getTime() - 40000;
        var et = new Date().getTime();
        $http({
          method : "GET",
          url : '/server_stat/server1?from=' + st + '&to=' + et
        }).then(function(res) {
          if(res.status == 200){
            console.log(res.data.data[0]);
            var resourceData = res.data.data[0][dataTypeString];
            var timestamp = res.data.data[0].timestamp;
            var dataJSON =  [];
          //  console.log(resourceData);
            if(typeof resourceData == 'object'){
              var keysArr = Object.keys(resourceData);
              var JSONlength = keysArr.length;
              for(i in keysArr){
                dataJSON.push({
                  time: timestamp,
                  value: resourceData[keysArr[i]]
                });
              }
            }else{
              dataJSON.push({
                time: timestamp,
                value: resourceData
              });
            }
          }
        },function(err) {
          console.log(err);
        });
      }
      getDataBar();
    }
  };
});





















//--------------------------Widget Directives-----------------------------------//
mainApp.directive('rdWidget', rdWidget);
function rdWidget() {
  var directive = {
    transclude: true,
    template: '<div class="widget" ng-transclude></div>',
    restrict: 'EA'
  };
  return directive;
  function link(scope, element, attrs) {
    /* */
  }
};

mainApp.directive('rdWidgetHeader', rdWidgetTitle);
function rdWidgetTitle() {
  var directive = {
    requires: '^rdWidget',
    scope: {
      title: '@',
      icon: '@'
    },
    transclude: true,
    template: '<div class="widget-header"><div class="row"><div class="pull-left"><i class="fa" ng-class="icon"></i> {{title}} </div><div class="pull-right col-xs-6 col-sm-4" ng-transclude></div></div></div>',
    restrict: 'E'
  };
  return directive;
};

mainApp.directive('rdWidgetBody', rdWidgetBody);
function rdWidgetBody() {
  var directive = {
    requires: '^rdWidget',
    scope: {
      loading: '=?',
      classes: '@?'
    },
    transclude: true,
    template: '<div class="widget-body" ng-class="classes"><rd-loading ng-show="loading"></rd-loading><div ng-hide="loading" class="widget-content" ng-transclude></div></div>',
    restrict: 'E'
  };
  return directive;
};

mainApp.directive('rdWidgetFooter', rdWidgetFooter);
function rdWidgetFooter() {
  var directive = {
    requires: '^rdWidget',
    transclude: true,
    template: '<div class="widget-footer" ng-transclude></div>',
    restrict: 'E'
  };
  return directive;
};

mainApp.directive('rdLoading', rdLoading);
function rdLoading() {
  var directive = {
    restrict: 'AE',
    template: '<div class="loading"><div class="double-bounce1"></div><div class="double-bounce2"></div></div>'
  };
  return directive;
};
