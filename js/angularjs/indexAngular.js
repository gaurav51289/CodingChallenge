var indexApp = angular.module('indexApp', ['ngRoute','ngSanitize']);

indexApp.controller('indexCtrl',function($scope,$http){

  var startTime = new Date(),
      endTime = new Date(startTime.getTime() + 1000),
      queryParam = ["from=", startTime.getTime(), "&to=", endTime.getTime()].join("");

  var URL = ["/server_stat/", "server1", "?" + queryParam].join("");
  console.log(URL);

  $http({
    method : "GET",
    url : URL

  }).then(function(res) {
    console.log(res);
    if(res.status == 200){
      console.log(res.data);
    }
  },function(err) {
    console.log(err);
  });
});

indexApp.controller('MainCtrl', function MainCtrl($http, $interval) {

  var getData = function() {
    $http({
      method : "GET",
      url : '/server_stat'

    }).then(function(res) {
      if(res.status == 200){
        console.log(res.data);
      }
    },function(err) {
      console.log(err);
    });
  }

  var putData = function(phone) {
    $http.post('/phones', phone).then(function() {
      return ctrl.getPhones();
    });
  };
  
  $interval(getData, 2000);
});
