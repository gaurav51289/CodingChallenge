(function(angular) {
  'use strict';
var myBackEnd = angular.module('myBackEnd', ['mainApp', 'ngMockE2E']);

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
        et = parseInt(new Date().getTime() + 1000),
        serverName = "server1";
        console.log(st);
    var responseJSON = generateResponse(st, et, serverName);
    return responseJSON;
  }

  var responseGen = function(){
    var startTime = parseInt(new Date().getTime()),
        endTime = parseInt(new Date().getTime() + 1000),
        serverID = "server1";
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
            timestamp: ts,
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

    var resJSON = {
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

    return [200, resJSON];
  }
  // Returns server stats
  $httpBackend.whenGET('/server_stat').respond(responseGen);

  // adds stat
  $httpBackend.whenPOST('/user_entry').respond(function(method, url, data) {
    var phone = angular.fromJson(data);
    phones.push(phone);
    return [200, phone, {}];
  });

  //Pass through the requests for the template html pages
  $httpBackend.whenGET(/templates\/.*/).passThrough();
});
})(window.angular);
