(function() {
  "use strict";

  angular
    .module("spa-demo.subjects")
    .component("sdCurrentTripsMap", {
      template: "<div id='map'></div>",
      controller: CurrentTripsMapController,
      bindings: {
        zoom: "@"
      }
    });

  CurrentTripsMapController.$inject = ["$scope", "$q", "$element",
                                          "spa-demo.geoloc.currentOrigin",
                                          "spa-demo.geoloc.myLocation",
                                          "spa-demo.geoloc.Map",
                                          "spa-demo.subjects.tripsService",
                                          "spa-demo.config.APP_CONFIG"];
  function CurrentTripsMapController($scope, $q, $element, 
                                        currentOrigin, myLocation, Map, tripsService, 
                                        APP_CONFIG) {
    var vm=this;

    vm.$onInit = function() {
      console.log("CurrentTripsMapController",$scope);
    }
    vm.$postLink = function() {
      var element = $element.find('div')[0];
      getLocation().then(
        function(location){
          vm.location = location;
          initializeMap(element, location.position);
        });

      $scope.$watch(
        function(){ return tripsService.getTrips(); }, 
        function(trips) { 
          vm.trips = trips; 
          displayTrips(); 
        }); 
      $scope.$watch(
        function(){ return tripsService.getCurrentTrip(); }, 
        function(link) { 
          displayTrips();
        }); 
      $scope.$watch(
        function() { return currentOrigin.getLocation(); },
        function(location) { 
          vm.location = location;
          vm.updateOrigin(); 
        });       
    }

    return;
    //////////////
    function getLocation() {
      var deferred = $q.defer();

      //use current address if set
      var location = currentOrigin.getLocation();
      if (!location) {
        //try my location next
        myLocation.getCurrentLocation().then(
          function(location){
            deferred.resolve(location);
          },
          function(){
            deferred.resolve({ position: APP_CONFIG.default_position});
          });
      } else {
        deferred.resolve(location);
      }

      return deferred.promise;
    }

    function initializeMap(element, position) {
      vm.map = new Map(element, {
        center: position,        
        zoom: 5,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });
      displayTrips();  
    }

    function displayTrips(){
      if (!vm.map) { return; }
      vm.map.clearMarkers();
      vm.map.displayOriginMarker(vm.originInfoWindow(vm.location));

      angular.forEach(vm.trips, function(trip){
        if (trip.id == tripsService.getCurrentTrip().id) {
          displayTrip(trip);
        };
      });
    }

    function displayTrip(trip) {

      var thing_ids = trip.thing_ids;

      var promises = [];

      angular.forEach(thing_ids, function(id){
        var thing = tripsService.getThing(id);
        promises.push(thing.$promise);
      });

      $q.all(promises).then(function(things){

        console.log("All of the promises",things);
        var way_pts = [];

        var i;
        for (i = 0; i < things.length; i++) {

          if (i == 0) {
            var pos1 = things[i].position;
          } else if (i == things.length-1) {
            var pos2 = things[i].position;
          } else {
            way_pts.push(things[i].position);
          }
          displayThing(things[i],trip.id);
        }

        vm.map.displayRoute(pos1,pos2,way_pts);
      });

    }

    function displayThing(ti,trip_id) {
      var markerOptions = {
        position: {
          lng: ti.position.lng,
          lat: ti.position.lat
        },
        thing_id: ti.thing_id,
        image_id: ti.image_id          
      };
      markerOptions.title = ti.thing_name;

      if (trip_id == tripsService.getCurrentTrip().id) {
        markerOptions.icon = APP_CONFIG.thing_marker;
        markerOptions.zIndex =  100;
      } else {
        markerOptions.icon = APP_CONFIG.secondary_marker;
        markerOptions.size = 0;
        markerOptions.zIndex = 5;
      }
      markerOptions.content = vm.thingInfoWindow(ti);
    
      vm.map.displayMarker(markerOptions);  
    }

  }

  CurrentTripsMapController.prototype.updateOrigin = function() {
    if (this.map && this.location) {
      this.map.center({ 
        center: this.location.position
      });
      this.map.displayOriginMarker(this.originInfoWindow(this.location));
    }
  }

  CurrentTripsMapController.prototype.setActiveMarker = function(thing_id, image_id) {
    if (!this.map) { 
      return; 
    } else if (!thing_id && !image_id) {
      if (this.map.getCurrentMarker().title!=='origin') {
        this.map.setActiveMarker(null);
      }
    } else {
      var markers=this.map.getMarkers();
      for (var i=0; i<markers.length; i++) {
        var marker=markers[i];
        if (marker.thing_id === thing_id && marker.image_id === image_id) {
            this.map.setActiveMarker(marker);
            break;
        }
      }
    } 
  }

  CurrentTripsMapController.prototype.originInfoWindow = function(location) {
    console.log("originInfo", location);
    var full_address = location ? location.formatted_address : "";
    var lng = location && location.position ? location.position.lng : "";
    var lat = location && location.position ? location.position.lat : "";
    var html = [
      "<div class='origin'>",
        "<div class='full_address'>"+ full_address + "</div>",
        "<div class='position'>",
          "lng: <span class='lng'>"+ lng +"</span>",
          "lat: <span class='lat'>"+ lat +"</span>",
        "</div>",
      "</div>",
    ].join("\n");

    return html;
  }

  CurrentTripsMapController.prototype.thingInfoWindow = function(ti) {
    console.log("thingInfo", ti);
    var html ="<div class='thing-marker-info'><div>";
      html += "<span class='id ti_id'>"+ ti.id+"</span>";
      html += "<span class='id thing_id'>"+ ti.thing_id+"</span>";
      html += "<span class='id image_id'>"+ ti.image_id+"</span>";
      html += "<span class='thing-name'>"+ ti.thing_name + "</span>";
      if (ti.image_caption) {
        html += "<span class='image-caption'> ("+ ti.image_caption + ")</span>";      
      }
      if (ti.distance) {
        html += "<span class='distance'> ("+ Number(ti.distance).toFixed(1) +" mi)</span>";
      }
      html += "</div><img src='"+ ti.image_content_url+"?width=200'>";
      html += "</div>";
    return html;
  }

})();
