//-------- Mapa e Base Layers ------------

var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
var mbSatUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFyY2VsbXJpYmVpcm8iLCJhIjoiY2xoZzZ0a2JyMjIzNDNycGI3dmNoODZheSJ9.eYWrINl2fCEUZI3Zv8gbsQ';
var mbDarkUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFyY2VsbXJpYmVpcm8iLCJhIjoiY2xoZzZ0a2JyMjIzNDNycGI3dmNoODZheSJ9.eYWrINl2fCEUZI3Zv8gbsQ';
var satellite = L.tileLayer(mbSatUrl, { id: 'mapbox/satellite-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr });
var dark = L.tileLayer(mbDarkUrl, { id: 'mapbox/dark-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr });
/*
var Stadia_AlidadeSmoothDark = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}';
var dark2 = L.tileLayer(Stadia_AlidadeSmoothDark, {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
});
var CartoDB_DarkMatter = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
var dark3 = L.tileLayer(CartoDB_DarkMatter, {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
});

var CartoDB_VoyagerLabelsUnder ='https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png';
var light2 = L.tileLayer(CartoDB_VoyagerLabelsUnder, {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
});
*/

var map = L.map('map', {
  center: [-5.1, -39.3],
  zoom: 8,
  layers: dark
});


//----------- Layers GEOJSON ---------

var uns = new L.GeoJSON.AJAX('resource/un.geojson',{
  onEachFeature:onEachFeature,
  style: styleFeat
}).addTo(map);

var utr = new L.GeoJSON.AJAX('resource/utr_idoam.geojson',{
  pointToLayer: function (feature, latlng){    
    return L.circleMarker(latlng,styleFeat(feature));
  },
  onEachFeature:onEachFeature
});

var utri = new L.GeoJSON.AJAX('resource/utr_int.geojson',{
  pointToLayer: function (feature, latlng){
    return L.circleMarker(latlng,styleFeat(feature));  
  },
  onEachFeature:onEachFeature
});


//----------- Style Layers -------------
var mapFeatGroups = [];
var mapPoiCityGroups = [];
var layerControl = false;

function onEachFeature(f, fl) {  
    popUp(f,fl);
    let groupPoiBy = (f.geometry.type ==='Point') ? f.properties.CITY : '' ;
                      
    let groupFeatBy = (f.geometry.type ==='Polygon') ? 
                      f.properties.une_sgl_un : '' ;
    
    //does layerGroup already exist? if not create it and add to map
    var lg = mapFeatGroups[groupFeatBy];
    var lgp = mapPoiCityGroups[groupPoiBy];

    if (lgp === undefined) {
      lgp = new L.FeatureGroup();
      mapPoiCityGroups[groupPoiBy] = lgp;      
    }

    if (lg === undefined) {
      lg = new L.FeatureGroup();
      
      //Array de grupos de Features 
      mapFeatGroups[groupFeatBy] = lg; 
      // Adiciona os grupos de Features no controle de overlay do mapa
      if (!layerControl) {
        layerControl = L.control.layers().addTo(map);
      }   
      if (groupFeatBy !== '') {
        layerControl.addOverlay(mapFeatGroups[groupFeatBy],groupFeatBy,{sortLayers:true, hideSingleBase:true,collapsed:false});      
      } 
    }
    //adiciona a feature ao grupo de features no array de featgroups
    lgp.addLayer(lgp);
    lg.addLayer(fl);
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

//Gerar valores aleatórios para animar mapa
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

//Classifica valor do indicado por codigo de cor
function getColor(f) {
  switch (f.geometry.type){
    case 'Point':
      if (f.properties.hasIdoam) {
        let il = 0;
        for (i in f.properties.idoam) {
          if (f.properties.idoam[i].level > il) {
            il = f.properties.idoam[i].level
          }
        }
        //var il = getRandomInt(3);    
        return  il ===  1 ? '#e8e516'  ://Pressao BAIXA = AMARELO
                il ===  2 ? '#ff3500'  ://Pressao ALTA = VERMELHO
                            '#0bd102';  //Pressao NORMAL = VERDE  
      } else {
        let stsComm = f.properties.COMM_STS;
        //let stsComm = Math.round(Math.random());
        
        return  stsComm ===  0 ?  '#0bd102'  ://Comunicação Normal = VERDE
                                  '#ff3500';  //Comunicação Falha = VERMELHO
      }  
    break;

    case 'Polygon':
      let un = f.properties.une_sgl_un;      
      return  un ===  'UNMTN'?'#00bff8':// UNMTN = CINZA
              un ===  'UNMTS'?'#f59f3c':// UNMTS = LARANJA
              un ===  'UNMTL'?'#0ff473':// UNMTL = VERDE CLARO
              un ===  'UNMTO'?'#9d0284':// UNMTO = ROXO
              un ===  'UNBMO'?'#71db3a':// UNBMO = VERDE
              un ===  'UNBML'?'#cf4546':// UNBML = VERMELHO
              un ===  'UNBSA'?'#FF79EF':// UNBSA = VERMELHO
              un ===  'UNBSI'?'#F3A287':// UNBSI = VERMELHO
              un ===  'UNBCL'?'#BBE66E':// UNBCL = VERMELHO
              un ===  'UNBAC'?'#F6E479':// UNBAC = VERMELHO
              un ===  'UNBSC'?'#1DBEFF':// UNBSC = VERMELHO
              un ===  'UNBBA'?'#2433D6':// UNBBA = VERMELHO
              un ===  'UNBAJ'?'#F45353':// UNBAJ = VERMELHO
              un ===  'UNBBJ'?'#2D7171':// UNBBJ = VERMELHO
                              '#2d82b5';// UNxxx = AZUL
    break;
  }
}

function styleFeat(feature){
  let tipoFeat = feature.geometry.type;
  switch(tipoFeat){    
    case 'LineString':
      return {          
        color: '#3069ec', //ADUTORA = AZUL ESCURO
        weight: 4,
        opacity: 1
      }
    break;
    case 'Polygon':
      return { 
        fillColor: getColor(feature), //UN = CINZA
        color: '#c3c3c3', 
        weight: 0,
        opacity: 1,
        fillOpacity: 0.25  
      }
    break;
    case 'Point':
      return {  
        radius: 9,
        fillColor: getColor(feature),
        color: '#74a3a2',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.85   
      }
    break;    
  }
}


//----------- NEW Popup's Features ----------
 /*
 function d3Popup(f,l){
  //var div = $('<div class="popupGraph" style="width: 200px; height:200px;"><svg/></div>')[0];
  //var popup = L.popup().setContent(div);
  const plot = Plot.rectY({length: 10000}, Plot.binX({y: "count"}, {x: Math.random})).plot();
  const div = document.querySelector("#myplot");
  div.append(plot)
  var popup = L.popup().setContent(div);

  l.bindPopup(popup);
  var svg = d3.select(div).select("svg").attr("width", 200).attr("height", 200);
  svg.append("rect").attr("width", 150).attr("height", 150).style("fill", "lightBlue");
}
*/
//-----------OLD Popup's Features ----------

function popUp(f,l){
  var out = [];
  switch (f.geometry.type){
    case 'Point':
      if (f.properties){
        out.push("UTR "+ f.properties.UTR +" - "+ f.properties.UTRNAME);
        out.push("UN:"+ f.properties.UN);
        out.push("CIDADE:"+ f.properties.CITY);
        out.push("PROTOCOLO COM.:"+ f.properties.PROT_TYPE);
        if (f.properties.COMM_STS === 0) {
          out.push("COMUNICAÇÃO: NORMAL");
        } else {
          out.push("COMUNICAÇÃO: FALHA");
        }
        let dateComm = new Date(f.properties.COMM_TS);
        const optionsLocale = {
          day:    '2-digit',
          month:  '2-digit',
          year:   '2-digit',
          hour:   '2-digit',
          minute: '2-digit'
        }; 
        let formattedDate = dateComm.toLocaleString('en-US', optionsLocale);
        out.push("ÚLTIMA COMUNICAÇÃO:"+ formattedDate);
      }
    break;

    case 'LineString':
      if (f.properties){
        for(key in f.properties){
          out.push(key+": "+f.properties[key]);      
        }
      }
    break;

    case 'Polygon':
      if (f.properties){
        for(key in f.properties){
          out.push(key+": "+f.properties[key]);      
        }
      }
    break;
  }
  l.bindPopup(out.join("<br />"));  
}


//----------- Controle Layers -----------
var baseLayers = {
  'Claro': osm,
  'Satélite': satellite,
  'Escuro': dark
};
var overlays = {  
  'UTR-RMF': utr,
  'UTR-INT': utri,
  'UNs': uns
};

L.control.layers(baseLayers, overlays, {sortLayers:true,hideSingleBase:true,collapsed:false}).addTo(map);

/*//Função que ativa/desativa todas as subcamadas de UNs
function toggleUNsLayer(checked){
	console.log('Liga/Desliga UNs Camadas: $ {checked}');
  for (let group in mapFeatGroups){
    if(group.startsWith('UN')){
      if (checked){
        map.addLayer(mapFeatGroups[group]);
      } else {
        map.removeLayer(mapFeatGroups[group]);
      }
    }
  }
}

document.querySelector('.leaflet-control-layers-list').addEventListener('change',function(event){
  if (event.target.value === 'UNs'){
    toggleUNsLayer(event.target.checked);
  }
});
*/

var searchControl = new L.Control.Search({
  layer: utri,
  initial: false,
  propertyName: "UTR",
  marker: false,
  moveToLocation: function (latlng, title, map) {
    switch (latlng.layer.feature.geometry.type) {
      case "Point":
        console.log(latlng.layer.getLatLng());
        map.flyTo(latlng.layer.getLatLng(), 14);
        break;
      case "Polygon":
        console.log(latlng.layer.getBounds());
        //map.fitBounds(latlng.layer.getBounds());
        var zoom = map.getBoundsZoom(latlng.layer.getBounds());
        map.setView(latlng, zoom); // access the zoom
        break;
    }
  },
});

map.addControl(searchControl);


//---- Timer refresh da camada UTR -----
function Timer(fn, t) {
    var timerObj = setInterval(fn, t);

    this.stop = function() {
        if (timerObj) {
            clearInterval(timerObj);
            timerObj = null;
            console.log('timer stopped');
        }
        return this;
    }

    // start timer using current settings (if it's not already running)
    this.start = function() {
        if (!timerObj) {
            this.stop();
            timerObj = setInterval(fn, t);
            console.log('timer started');
        }
        return this;
    }
}

// switch interval to 30 secs
//timer.reset(20000);
var timer = new Timer(function() {
    const d = new Date();
    console.log('atualizando - '+ d.toLocaleString());
    console.log('Map has Layer utri = '+ map.hasLayer(utri));
    utri.refresh();
}, 30000);

//------- Eventos -----------

function zoomToLayer(layer){
  var bounds = layer.getBounds();
  map.fitBounds(bounds);
}

// Fit Map inicial
utri.on('data:loaded', function() {
  map.addLayer(utri);
  //console.log(uns) ;
  //console.log(mapFeatGroups) ;
});

//Trazer camada UTR pra frente e Adutoras/UN pra trás
utri.on('add', function() {
  map.fitBounds(utri.getBounds());
  utri.bringToFront();
  timer.start();  
});

utri.on('remove', function() {
  timer.stop();
});

utr.on('data:loaded', function(){
	map.addLayer(utr);
});

utr.on('add', function() {
	map.fitBounds(utr.getBounds());
	utr.bringToBack();
	timer.start();
});

utr.on('remove', function() {
	timer.stop();
});

uns.on('data:loaded', function() {
  map.addLayer(un);  
});

uns.on('add', function() {
  uns.bringToBack();
});