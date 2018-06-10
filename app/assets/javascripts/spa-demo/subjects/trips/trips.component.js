(function() {
  "use strict";

  angular
    .module("spa-demo.subjects")
    .component("sdCurrentTrips", {
      templateUrl: tripsTemplateUrl,
      controller: CurrentTripsController,
    })
    ;

  tripsTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];
  function tripsTemplateUrl(APP_CONFIG) {
    return APP_CONFIG.trips_html;
  }    

  CurrentTripsController.$inject = ["$scope",
                                     "spa-demo.subjects.tripsService"];
  function CurrentTripsController($scope, tripsService) {
    var vm=this;
    vm.things = {};
    vm.tripClicked = tripClicked;
    vm.isCurrentTrip = tripsService.isCurrentTripIndex;
    vm.getThing = getThing;

    vm.$onInit = function() {
      console.log("CurrentImagesController",$scope);
    }
    vm.$postLink = function() {
      $scope.$watch(
        function() { return tripsService.getTrips(); }, 
        function(trips) { 
          vm.trips = trips; 

          
          console.log("BLARGO BLARGO",vm.trips)
        }
      );
    }    
    return;
    //////////////
    function tripClicked(index) {
      tripsService.setCurrentTrip(index);
    }

    function getThing(id) {
      if (id in vm.things) {
        return vm.things[id]
      } else {
        var result = tripsService.getThing(id);
        vm.things[id] = result
        console.log("MOTHER FUCKER",result);
        return vm.things[id]
      }
    }
  }

})();
