var mainApp = angular.module('mainApp', ['ui.bootstrap', 'ui.router']);



mainApp.config(['$stateProvider', '$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  // For unmatched routes
  $urlRouterProvider.otherwise('/');

  // Application routes
  $stateProvider
  .state('statschart', {
    url: '/statschart',
    templateUrl: 'templates/stats_chart.html',
    controller : "chartCtrl"
  })
  .state('userentry', {
    url: '/userentry',
    templateUrl: 'templates/user_entry.html'
  });
}
]);



mainApp.controller('mainCtrl', function indexCtrl($scope, $http, $interval) {
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


mainApp.controller('chartCtrl', function indexCtrl($scope, $http, $interval, $compile) {

  $scope.changeResource = function(resourceType){
    $scope.resourceType = resourceType;
    var el = $compile('<chart-div class="graph"></chart-div>')($scope);
    var theChartDiv = angular.element(document.getElementById('the-chart-div'));
    theChartDiv.empty();
    theChartDiv.append(el[0]);
  }
});


mainApp.directive('chartDiv', function($window, $http, $interval){
  return{
    restrict:'EA',
    template:"<div></div>",
    link: function(scope, elem, attrs){

      var resourceType = scope.resourceType;

      //dynamic variables
      var chartTitle, xLabel, yLabel, yMax, dataTypeString;

      switch (resourceType) {
        case 1:
          chartTitle = "CPU Usage";
          xLabel = "Time (" + new Date().toDateString() + ")" ;
          yLabel = "CPU Usage (%)";
          yMax = 0.1;
          dataTypeString = "cpu_usage";
          break;
        case 2:
          chartTitle = "Memory Usage";
          xLabel = "Time (" + new Date().toDateString() + ")" ;
          yLabel = "Memory Usage (Mega Bytes)";
          yMax = 5000;
          dataTypeString = "memory_usage"
          break;
        case 3:
          chartTitle = "Memory Available";
          xLabel = "Time (" + new Date().toDateString() + ")" ;
          yLabel = "Memory Available (Mega Bytes)";
          yMax = 5000;
          dataTypeString = "memory_available"
          break;
        case 4:
          chartTitle = "Network Packet";
          xLabel = "Time (" + new Date().toDateString() + ")" ;
          yLabel = "Memory Usage (Mega Bytes)";
          yMax = 5000;
          dataTypeString = "network_packet"
          break;
        case 5:
          chartTitle = "CPU Usage";
          xLabel = "Time (" + new Date().toDateString() + ")" ;
          yLabel = "Memory Usage (Mega Bytes)";
          yMax = 5000;
          dataTypeString = "network_throughput"
          break;
        default:
      }

      var d3 = $window.d3;
      var rawSvg=elem.find('div');
      var svg = d3.select(rawSvg[0]).append('svg');


      var margin = {top: 40, right: 10, bottom: 80, left: 90},
      width = 1000 - margin.left - margin.right,
      height = 550 - margin.top - margin.bottom;


      var t = new Date().getTime();
      var n = 40000;
      var v = 0;
      var data = d3.range(n).map(initData);


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

      var line = d3.svg.line()
        .interpolate('basis')
        .x(function(d, i) { return x(d.time); })
        .y(function(d, i) { return y(d.value); });

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

      var path = graph.append("g")
        .append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", line);

      // now add titles to the axes
      svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ (margin.left/3) +","+(height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .text(yLabel);

      svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ ((width + margin.left + margin.right)/2) +","+(height+(margin.bottom))+")")  // centre below axis
        .text(xLabel);

      svg.append("text")
        .attr("x", ((width + margin.left + margin.right)/2))
        .attr("y", margin.top/2)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("text-decoration", "underline")
        .text(chartTitle);

      function tick(newDataJSON)
      {
        // push a new data point onto the back
        data.push(newDataJSON);
        var newTime = newDataJSON.time;
        var newValue = newDataJSON.value;

        // redraw path, shift path left
        path
          .attr("d", line)
          .transition()
          .duration(500)
          .ease("linear")
          .attr("transform", "translate(" + t - 1 + ")");
          //.each("end", tick);

        // update X domain
        x.domain([newTime - n, newTime]);

        // shift X axis left
        axis
          .transition()
          .duration(500)
          .ease("linear")
          .call(xAxis);

        // update Y domain and axis
        if(newValue > yMax){
          yMax = newValue;
          y.domain([0, yMax]);
          //Adjust y-axis
          yaxis.transition()
            .ease('linear')
            .call(yAxis);
        }

        // pop the old data point off the front
        data.shift();
      }

      var getData = function() {
        $http({
          method : "GET",
          url : '/server_stat'
        }).then(function(res) {
          if(res.status == 200){
            var resourceData = res.data.data[0][dataTypeString];
            var timestamp = res.data.data[0].timestamp;
            var dataJSON =  {
              time: timestamp,
              value: resourceData
            };
            tick(dataJSON);
          }
        },function(err) {
          console.log(err);
        });
      }
      $interval(getData, 1000);
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
