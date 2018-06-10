(function() {
  "use strict";

  angular
    .module("spa-demo.geoloc")
    .factory("spa-demo.geoloc.Map", GeolocMapFactory);

  GeolocMapFactory.$inject = ["$timeout","spa-demo.config.APP_CONFIG"];
  function GeolocMapFactory($timeout, APP_CONFIG) {

    function GeolocMap(element, mapOptions) {
      var service=this;
      service.options = {}
      service.markers = [];
      service.currentMarker = null;
      service.options = service.normalizeMapOptions(mapOptions);
      service.map = new google.maps.Map(element, service.options);    
      service.directionsService = new google.maps.DirectionsService;
      service.directionsDisplay = new google.maps.DirectionsRenderer({map : service.map})
    }

    GeolocMap.prototype.normalizeMapOptions = function(mapOptions) {
      if (mapOptions.center) {
        var lng = parseFloat(mapOptions.center.lng);
        var lat = parseFloat(mapOptions.center.lat);
        mapOptions.center = new google.maps.LatLng(lat, lng);
      }
      return mapOptions;
    };

    GeolocMap.prototype.center = function(mapOptions) {
      if (this.map && mapOptions) {
        this.normalizeMapOptions(mapOptions);
        if (mapOptions.center) {
          this.options.center=mapOptions.center;
          this.map.setCenter(this.options.center);
        }
        if (mapOptions.zoom) {
          this.options.zoom = mapOptions.zoom;
          this.map.setZoom(this.options.zoom);
        }
        if (mapOptions.mapTypeId) {
          this.options.mapTypeId = mapOptions.mapTypeId;
          this.map.setMapTypeId(this.options.mapTypeId);
        }        
      }
    };

    GeolocMap.prototype.displayRoute = function(pos1,pos2,waypts) {

      // var pos1_ = new google.maps.LatLng(pos1.lat, pos1.lng);
      // var pos2_ = new google.maps.LatLng(pos2.lat, pos2.lng);

      var directionsService = this.directionsService;
      var directionsDisplay = this.directionsDisplay;

      console.log("THE FUCKIN WAY POINTS",waypts);

      var formatted_waypts = []

      var i;
      for (i=0;i < waypts.length;i++) {

        formatted_waypts.push({
          location: new google.maps.LatLng(waypts[i].lat, waypts[i].lng),
          stopover: true
        });
      }

      directionsService.route({
        origin: new google.maps.LatLng(pos1.lat, pos1.lng),
        destination: new google.maps.LatLng(pos2.lat, pos2.lng),
        waypoints: formatted_waypts,
        optimizeWaypoints: true,
        travelMode: 'DRIVING'
      }, function(response,status) {

        if (status=== 'OK') {
          console.log("YAYAYA")
          directionsDisplay.setOptions( { suppressMarkers: true } );
          directionsDisplay.setDirections(response);
        } else {
          window.alert('Directions request failed due to ' + status);
        }
      });
    }

    GeolocMap.prototype.getMarkers = function() {
      return this.markers;
    }
    GeolocMap.prototype.getCurrentMarker = function() {
      return this.currentMarker;
    }

    GeolocMap.prototype.clearMarkers = function() {
      angular.forEach(this.markers, function(m){
        google.maps.event.removeListener(m.listener);
        m.marker.setMap(null);
      });
      this.markers = [];
    }
    GeolocMap.prototype.clearOriginMarker = function() {
      var m = this.originMarker;
      if (m) {
        google.maps.event.removeListener(m.listener);
        m.marker.setMap(null);
      };
      if (m === this.originMarker) {
        this.originMarker=null;
      }
    }

    GeolocMap.prototype.displayMarker = function(markerOptions) {
      if (!this.map) { return; }
      markerOptions.optimized = APP_CONFIG.optimized_markers;
      console.log("markerOptions", markerOptions);

      //display the marker
      var marker = new google.maps.Marker(markerOptions);
      marker.setMap(this.map);

      //add an info pop-up
      var service=this;
      var infoWindow=new google.maps.InfoWindow({content: markerOptions.content});                
      var listener=marker.addListener('click', function(){
        console.log("map listener called");
        service.setActiveMarker(markerOptions);
        $timeout();
      });

      //remember the marker
      markerOptions.marker = marker;
      markerOptions.infoWindow = infoWindow;
      markerOptions.listener = listener;
      this.markers.push(markerOptions);

      //size the map to fit all markers
      var bounds = new google.maps.LatLngBounds();
      angular.forEach(this.markers, function(marker){
        bounds.extend(marker.position);
      });

      //console.log("bounds", bounds);
      this.map.fitBounds(bounds);        

      return markerOptions;
    }

    GeolocMap.prototype.displayOriginMarker = function(content) {      
      console.log("displayOriginMarker", content, this.options.center);
      if (!content) {
        content = "Origin";
      }

      var service = this;
      $timeout(function(){
        service.clearOriginMarker();
        service.originMarker = service.displayMarker({
              position: service.options.center,
              title: "origin",
              icon: APP_CONFIG.origin_marker,
              content: content
        });
      });
    }

    GeolocMap.prototype.setActiveMarker = function(markerOptions) {
      console.log("setting new marker new/old:", markerOptions, this.currentMarker);
      if (this.currentMarker && markerOptions !== this.currentMarker) {
        this.currentMarker.infoWindow.close();
      }
      if (markerOptions && markerOptions.infoWindow) {
        markerOptions.infoWindow.open(this.map, markerOptions.marker);        
      }
      this.currentMarker = markerOptions;
    }








    return GeolocMap;
  }
})();
