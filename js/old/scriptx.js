//-------- Mapa e Base Layers ------------

var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var map = L.map('map', {
  center: [0, 0],
  zoom: 0,
  layers: osm
});

//----------- Layers GEOJSON ---------
var mapFeatGroups = [];

var uns = new L.GeoJSON.AJAX('resource/uns_rmf.geojson',{
  onEachFeature:popUp,
  style: styleFeat(uns,'un')
});

var adutoras = new L.GeoJSON.AJAX('resource/adutoras.geojson', {
  onEachFeature:popUp,
  style: styleFeat(adutoras,'adutora')
});

var utr = new L.GeoJSON.AJAX('resource/utr_idoam.geojson',{
  pointToLayer: function (feature, latlng){
    return L.circleMarker(latlng, styleFeat(feature,'epz'));  
  },
  onEachFeature:onEachFeature
});

//----------- Style Layers -------------
var layerControl = false;
function onEachFeature(feature, featureLayer) {
  popUp(feature, featureLayer);
  //does layerGroup already exist? if not create it and add to map
  var utrIL = feature.properties.idoamLevel;
  var lg = mapFeatGroups[utrIL];
  if (lg === undefined) {
    lg = new L.FeatureGroup();
    //add the layer to the map
    //lg.addTo(map);    
    //Array de grupos de Features 
    mapFeatGroups[utrIL] = lg;    
    console.log(utrIL);
    // Adiciona os grupos de Features no controle de overlay do mapa
    /*if (!layerControl) {
      layerControl = L.control.layers().addTo(map);
    }    
    layerControl.addOverlay(mapFeatGroups[utrIL],utrIL,{sortLayers:true, hideSingleBase:true,collapsed:false});*/
  }
  //adiciona a feature ao grupo de features no array de featgroups
  lg.addLayer(featureLayer);  
}

//show/hide layerGroup 
function showLayer(id) {
  var lg = mapFeatGroups[id];  
  map.addLayer(lg);   
}
function hideLayer(id) {
  var lg = mapFeatGroups[id];
  map.removeLayer(lg);   
}

function getColor(f) {
  var il = f.properties.idoamLevel;
  return  il ===  1 ? '#e8e516'  ://Pressao BAIXA = AMARELO
          il ===  2 ? '#ff3500'  ://Pressao ALTA = VERMELHO
                      '#0bd102';  //Pressao NORMAL = VERDE  
}

function styleFeat(feature, tipo) {
  switch(tipo){    
    case 'adutora':
      return {  
        fillColor: '#2894eb',
        color: '#2894eb',
        weight: 3,
        opacity: 1
      }
    break;
    case 'un':
      return { 
        fillColor: '#1e1f25',
        color: '#1e1f25',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.15  
      }
    break;
    case 'epz':
      return {  
        radius: 8,
        fillColor: getColor(feature),
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.85   
      }
    break;    
  }
}

//----------- Popup's Features ----------

function popUp(f,l){
  var out = [];
  if (f.properties){
    for(key in f.properties){
      out.push(key+": "+f.properties[key]);
    }
    l.bindPopup(out.join("<br />"));
  }
}

//----------- Controle Layers -----------
var baseLayers = {
  'OSM': osm
};
var overlays = {  
  'UTRs': utr,
  'UNs': uns,
  'Adutoras': adutoras
};

L.control.layers(baseLayers, overlays, {sortLayers:true,hideSingleBase:true,collapsed:false}).addTo(map);

function Timer(fn, t) {
    var timerObj = setInterval(fn, t);

    this.stop = function() {
        if (timerObj) {
            clearInterval(timerObj);
            timerObj = null;
        }
        return this;
    }

    // start timer using current settings (if it's not already running)
    this.start = function() {
        if (!timerObj) {
            this.stop();
            timerObj = setInterval(fn, t);
        }
        return this;
    }

    /*// start with new or original interval, stop current interval
    this.reset = function(newT = t) {
        t = newT;
        return this.stop().start();
    }*/

}
//------- Eventos -----------
// Fit Map inicial
utr.on('data:loaded', function() {
  console.log('evento data:loaded');
  map.addLayer(utr);
  //map.fitBounds(utr.getBounds()); 
});

//Trazer camada UTR pra frente e Adutoras/UN pra trás
utr.on('add', function() {
  console.log('evento utr add');
  map.fitBounds(utr.getBounds()); 
  utr.bringToFront();
});

utr.on('remove', function() {

});


var timer = new Timer(function() {
  const d = new Date();
  console.log('atualizando - '+ d.toLocaleString());
  utr.refresh();
}, 10000);


// switch interval to 10 seocnds
//timer.reset(20000);

// stop the timer
//timer.stop();

// start the timer
timer.start();


adutoras.on('add', function() {
  adutoras.bringToBack();
});
uns.on('add', function() {
  uns.bringToBack();
});

//Fit bounds of Featuregroups on add to map
map.on('overlayeradd overlayerremove', function () {
    // Create new empty bounds
    var bounds = new L.LatLngBounds();
    // Iterate the map's layers
    map.eachLayer(function (layer) {
        // Check if layer is a featuregroup
        if (layer instanceof L.FeatureGroup) {
          // Extend bounds with group's bounds
          bounds.extend(layer.getBounds());
        }
    });
    // Check if bounds are valid (could be empty)
    if (bounds.isValid()) {
        console.log('evento overlayeradd/overlayerremove');
        // Valid, fit bounds
        map.fitBounds(bounds);
    } else {
        // Invalid, fit world
        map.fitWorld();
    }
});