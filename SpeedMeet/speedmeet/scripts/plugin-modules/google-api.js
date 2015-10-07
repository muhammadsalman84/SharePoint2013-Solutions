'use strict';
//define(['async!https://maps.googleapis.com/maps/api/js?v=3.exp', 'https://google.com/jsapi'], function () {
//define(['jsapi'], function () {
define(['async!https://maps.googleapis.com/maps/api/js?v=3.exp', 'https://google.com/jsapi'], function () {

    function GoogleApi(mapId, geoLocation, isStreetView) {
        var self = this,
            geocoder;
        self.map = null;
        self.geoLocation = geoLocation || {};
        self._mapId = mapId;
        self.markers = [];
        self.streetPanorama = null;
        self.isStreetView = isStreetView;

        /*function showTitleOnMarker(marker) {
            var contentString = "<span><b>" + marker.title + "</b></span>";
            var infowindow = new google.maps.InfoWindow({
                content: contentString
            });
            infowindow.open(map, marker);
        }*/

        self.toggleBounce = function (marker) {
            if (marker.getAnimation() != null) {
                marker.setAnimation(null);
            } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
            }
        }

        self.setLocation = function (latitude, longitude, title) {
            self.geoLocation.latitude = latitude;
            self.geoLocation.longitude = longitude;
            self.geoLocation.locationName = title;
        }

        self.removeMarkers = function () {
            while (self.markers.length) {
                self.markers.pop().setMap(null);
            }
        }

        self.setDefaultGeolocation = function (initialLocation) {
            var marker = new google.maps.Marker({
                position: initialLocation,
                map: self.map,
                animation: google.maps.Animation.DROP,
                title: self.geoLocation.locationName
            });

            self.setLocation(self.geoLocation.latitude, self.geoLocation.longitude, self.geoLocation.locationName);
            self.removeMarkers();
            self.markers.push(marker);
            google.maps.event.addListener(marker, 'click', function () {
                //showTitleOnMarker(this);
                self.toggleBounce(this);
            });
            self.map.setCenter(initialLocation);
        }

        self.getMyLocation = function () {
            self.geoLocation = {};
            //geocoder = new google.maps.Geocoder();
            // if(navigator.geolocation){
            /*if (google.loader.ClientLocation) {
                var clientLocation = google.loader.ClientLocation;
                self.geoLocation.latitude = clientLocation.latitude;
                self.geoLocation.longitude = clientLocation.longitude;
                self.geoLocation.locationName = clientLocation.address.city + ", " + clientLocation.address.region + ", " + clientLocation.address.country;
            }
            else {*/
            self.geoLocation.latitude = 50.923975;
            self.geoLocation.longitude = 6.992610;
            self.geoLocation.locationName = "TÜV Rheinland, Köln, North Rhine-Westphalia";
            //}
        }

        self.initialize = function () {
            if (!self.geoLocation.latitude)
                self.getMyLocation();
            var initialLocation = new google.maps.LatLng(self.geoLocation.latitude, self.geoLocation.longitude),
                 mapOptions = {
                     zoom: 14,
                     center: initialLocation
                 };

            self.map = new google.maps.Map(document.getElementById(self._mapId), mapOptions);
            self.setDefaultGeolocation(initialLocation);
            if (self.isStreetView) {
                self.streetPanorama = self.map.getStreetView();
                self.streetPanorama.setPosition({ lat: self.geoLocation.latitude, lng: self.geoLocation.longitude });
                self.streetPanorama.setPov(({
                    heading: 265,
                    pitch: 0
                }));

            }
        }
    }


    GoogleApi.prototype.searchLocation = function (sAddress) {
        var geocoder = new google.maps.Geocoder();
        var self = this;
        geocoder.geocode({ 'address': sAddress }, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                var marker = new google.maps.Marker({
                    map: self.map,
                    animation: google.maps.Animation.DROP,
                    position: results[0].geometry.location,
                    title: sAddress
                });
                self.map.setCenter(results[0].geometry.location);
                //google.maps.event.addListener(marker, 'click', toggleBounce);
                self.setLocation(results[0].geometry.location.lat(), results[0].geometry.location.lng(), sAddress);
                self.removeMarkers();
                self.markers.push(marker);
                google.maps.event.addListener(marker, 'click', function () {
                    infowindow.open(map, marker);
                });
            }
        });
    }
    GoogleApi.prototype.initialzeMap = function () {
        google.maps.event.addDomListener(window, 'load', this.initialize());
    }

    GoogleApi.prototype.refreshMap = function () {
        google.maps.event.trigger(this.map, 'resize');
        this.getMyLocation();
        var initialLocation = new google.maps.LatLng(this.geoLocation.latitude, this.geoLocation.longitude);
        this.setDefaultGeolocation(initialLocation);
    }

    GoogleApi.prototype.getGeoLocation = function () {
        return this.geoLocation;
    }

    GoogleApi.prototype.showStreetView = function () {
        var toggle = this.streetPanorama.getVisible();
        if (toggle == false) {
            this.streetPanorama.setVisible(true);
        } else {
            this.streetPanorama.setVisible(false);
        }
    }

    return GoogleApi;
});