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
    vm.tripClicked = tripClicked;
    vm.isCurrentTrip = tripsService.isCurrentTripIndex;

    vm.$onInit = function() {
      console.log("CurrentImagesController",$scope);
    }
    vm.$postLink = function() {
      $scope.$watch(
        function() { return tripsService.getTrips(); }, 
        function(trips) { vm.trips = trips; }
      );
    }    
    return;
    //////////////
    function tripClicked(index) {
      tripsService.setCurrentTrip(index);
    }
  }

})();
