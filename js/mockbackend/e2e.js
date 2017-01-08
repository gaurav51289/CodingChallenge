(function(angular) {
  'use strict';
var myBackEnd = angular.module('myBackEnd', ['indexApp', 'ngMockE2E']);

myBackEnd.run(function($httpBackend) {

  function generateResponse(startTime, endTime, serverID) {
      function getRandomNumber(upperBound) {
          return Math.floor(Math.random() * upperBound);
      }
      var records = [],
          memUpperBound = 40000,
          throughputUpperBound = 20000,
          packetUpperBound = 1000,
          errorUpperBound = 5;
      for (var ts = startTime; ts < endTime; ts += 1000) {
          records.push({
              timestamp: (new Date(ts)).toISOString(),
              memory_usage: getRandomNumber(memUpperBound),
              memory_available: getRandomNumber(memUpperBound),
              cpu_usage: Math.random().toFixed(2),
              network_throughput: {
                  "in": getRandomNumber(throughputUpperBound),
                  out: getRandomNumber(throughputUpperBound)
              },
              network_packet: {
                  "in": getRandomNumber(packetUpperBound),
                  out: getRandomNumber(packetUpperBound)
              },
              errors: {
                  system: getRandomNumber(errorUpperBound),
                  sensor: getRandomNumber(errorUpperBound),
                  component: getRandomNumber(errorUpperBound)
              }
          });
      }
      return {
          header: {
              target_name: serverID,
              time_range: {
                  start: new Date(startTime).toISOString(),
                  end: new Date(endTime).toISOString()
              },
              recordCount: records.length
          },
          data: records
      };
  }

  var callThis = function(){
    var st = parseInt(new Date().getTime()),
        et = parseInt(new Date().getTime() + 5000),
        serverName = "server1";
    var responseJSON = generateResponse(st, et, serverName);
    return responseJSON;
  }
  // returns the current list of phones
  $httpBackend.whenGET('/server_stat').respond(callThis());

  // adds a new phone to the phones array
  $httpBackend.whenPOST('/server_stat1').respond(function(method, url, data) {
    var phone = angular.fromJson(data);
    phones.push(phone);
    return [200, phone, {}];
  });
});
})(window.angular);
