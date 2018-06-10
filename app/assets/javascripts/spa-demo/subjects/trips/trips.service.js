(function() {
  "use strict";

  angular
    .module("spa-demo.subjects")
    .service("spa-demo.subjects.tripsService", tripsService);

    tripsService.$inject = ["$rootScope","$q",
                             "$resource",
                             "spa-demo.geoloc.currentOrigin",
                             "spa-demo.config.APP_CONFIG"];

  function tripsService($rootScope, $q, $resource, currentOrigin, APP_CONFIG) {
    var tripsResource = $resource(APP_CONFIG.server_url + "/api/trips",{},{
      query: { cache:false, isArray:true }
    });

    var thingResource = $resource(APP_CONFIG.server_url + "/api/trip_things/:id", {id: '@id'},{
      query: { cache:false}
    });

    var service = this;
    service.version = 0;
    service.trips = [];
    service.tripIdx = null;
    service.refresh = refresh;
    service.isCurrentTripIndex = isCurrentTripIndex;
    service.getThing = getThing;

    //refresh();
    $rootScope.$watch(function(){ return currentOrigin.getVersion(); }, refresh);
    return;
    ////////////////
    function refresh() {      
      var params=currentOrigin.getPosition();
      if (!params || !params.lng || !params.lat) {
        params=angular.copy(APP_CONFIG.default_position);
      } else {
        params["distance"]=true;
      }

      if (currentOrigin.getDistance() >= 0) {
        params["miles"]=currentOrigin.getDistance();
      }
      params["order"]="ASC";
      console.log("refresh",params);

      var p1=refreshTrips(params);
      $q.all([p1]).then(
        function(){
          // service.setCurrentImageForCurrentThing();
          console.log("Refreshing done");
          console.log(service.trips);
        });      
    }

    function refreshTrips(params) {
      var result=tripsResource.query(params);
      result.$promise.then(
        function(trips){
          service.trips=trips;
          service.version += 1;
          if (!service.tripIdx || service.tripIdx > trips.length) {
            service.tripIdx=0;
          }
          console.log("refreshTrips", service);
        });
      return result.$promise;
    }

    function isCurrentTripIndex(index) {
      return service.tripIdx === index;
    }

    function getThing(id) {
      var result = thingResource.get({id: id});
      return result
    }
   
  }

  tripsService.prototype.getVersion = function() {
    return this.version;
  }
  tripsService.prototype.getTrips = function() {
    return this.trips;
  }
  
  tripsService.prototype.getCurrentTrip = function() {
    return this.trips.length > 0 ? this.trips[this.tripIdx] : null;
  }

  tripsService.prototype.getCurrentTripId = function() {
    var currentTrip = this.getCurrentTrip();
    return currentTrip ? currentTrip.trip_id : null;
  }

  tripsService.prototype.setCurrentTrip = function(index) {
    console.log(index);
    this.tripIdx = index;
    console.log("Current Trip",this.getCurrentTrip());
  }

  
  // tripsService.prototype.setCurrentSubjectId = function(thing_id, image_id) {
  //   console.log("setCurrentSubject", thing_id, image_id);
  //   this.setCurrentThingId(thing_id, true);
  //   this.setCurrentImageId(image_id, true);
  // }

  })();
