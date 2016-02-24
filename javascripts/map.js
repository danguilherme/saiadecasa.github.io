"use strict";

(function (window, document, undefined) {
  var THEME = {
    EVENT_COLOR_MEETUP: "#d00",
    EVENT_COLOR_CONFERENCE: "#0d0",
    EVENT_COLOR_HACKATHON: "#00d"
  };

  var map;
  var openedInfobox = null;
  var eventsMarkers = [];

  // document.addEventListener('readystatechange', function () {
  //   if (document.readyState === 'complete') onReady();
  // });

  function init(eventsList) {
    var mapOptions = {
      center: new google.maps.LatLng(-23.6815315, -46.8754939),
      zoom: 5,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

    var markers = createMarkers(eventsList);
    var markerCluster = new MarkerClusterer(map, markers);

    // save the events with theirs relative markers
    eventsList.forEach(function (event, index) {
      eventsMarkers.push({
        marker: markers[index],
        event: event
      });
    });

    fitMapBounds();
  }

  function getEventMapEntry(eventId) {
    return eventsMarkers.filter(function(item) {
      return item.event.id === eventId;
    })[0];
  }

  function createMarkers(events) {
    // geocoder = new google.maps.Geocoder();
    return events.map(function (event) {
      var pinConfig = createPin("d5000d");

      var marker = new google.maps.Marker({
        map: map,
        draggable: false,
        icon: pinConfig.pin,
        shadow: pinConfig.shadow,
        position: {
          lat: event.localizacao.latitude,
          lng: event.localizacao.longitude
        }
      });

      google.maps.event.addListener(marker, 'click', (function (marker, event) {
        return function () {
          return onMarkerClick(marker, event);
        };
      })(marker, event));

      return marker;
    });
  }

  function createPin(color) {
    var pinColor = color;
    var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor, new google.maps.Size(21, 34), new google.maps.Point(0, 0), new google.maps.Point(10, 34));
    var pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow", new google.maps.Size(40, 37), new google.maps.Point(0, 0), new google.maps.Point(12, 35));

    return {
      pin: pinImage,
      shadow: pinShadow
    };
  }

  function fitMapBounds() {
    closeOpenedInfobox();

    var markers = eventsMarkers.map(function (item) {
      return item.marker;
    });
    var latlngbounds = new google.maps.LatLngBounds();
    markers.forEach(function (marker) {
      latlngbounds.extend(marker.position);
    });
    map.fitBounds(latlngbounds);
  }

  function openInfobox(eventId) {
    var eventMapEntry = getEventMapEntry(eventId);
    if (!eventMapEntry) return;

    var marker = eventMapEntry.marker;
    var event = eventMapEntry.event;

    var myOptions = {
      content: createInfoBoxHtml(event),
      pixelOffset: new google.maps.Size(-150, 0),
      boxClass: "infobox"
    };

    closeOpenedInfobox();

    var infoBox = new InfoBox(myOptions);
    infoBox.open(map, marker);
    google.maps.event.addListener(infoBox, "closeclick", function () {
      return openedInfobox = null;
    });

    openedInfobox = infoBox;

    map.setCenter(marker.getPosition());
    map.setZoom(Math.max(map.getZoom(), 7));
  }

  function closeOpenedInfobox() {
    if (openedInfobox) openedInfobox.close();
    openedInfobox = null;
  }

  function onMarkerClick(marker, event) {
    openInfobox(event.id);
  }

  function createInfoBoxHtml(event) {
    var template = _.template($("#map-infobox").html());
    return $(template(event)).get(0);
  }

  window.eventsMap = {
    init: init,
    openInfobox: openInfobox,
    fitBounds: fitMapBounds,
    closeOpenedInfobox: close
  };
})(window, document);
