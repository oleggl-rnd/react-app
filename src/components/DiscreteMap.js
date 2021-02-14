import React, { Component } from "react";
import OlMap from "ol/Map";
import OlView from "ol/View";
import OlSourceOSM from "ol/source/OSM";
import { Vector as VectorSource , Raster as RasterSource} from "ol/source";
import { defaults as defaultControls, ScaleLine } from "ol/control";
import { Image as ImageLayer, Tile as OlLayerTile, Vector as VectorLayer } from "ol/layer";
import ImageWMS from 'ol/source/ImageWMS';
import GeometryCombo from "./GeometryType";
import Draw from "ol/interaction/Draw";
import { fromLonLat } from "ol/proj";
//import { transformExtent } from "ol/proj";
import lcreation from "../utils/imagerylayer";

//import Control from "ol/control";
///
class PublicMap extends Component {
  constructor(props) {
    super(props);

    const israelCenter = [34.0, 32.0];
    this.state = { center: fromLonLat(israelCenter), zoom: 2 , dtm:0 };

    var scaleControl = new ScaleLine({
      units: "metric",
    });

    this.view = new OlView({
      //projection: 'EPSG:4326',
      center: this.state.center,
      zoom: this.state.zoom,
    });

    this.source = new VectorSource({ wrapX: false });

    this.vector = new VectorLayer({
      source: this.source,
    });

    this.olmap = new OlMap({
      target: null,
      controls: defaultControls().extend([scaleControl]),
      // layers: [
      //   new OlLayerTile({
      //     source: new OlSourceOSM(),
      //   }),
      //   this.vector,
      // ],
      view: this.view,
    });
  }

  updateMap() {
    this.olmap.getView().setCenter(this.state.center);
    this.olmap.getView().setZoom(this.state.zoom);
  }

  flyTo(location, zoom, done) {
    var duration = 2000;
    //var zoom = this.view.getZoom();
    var parts = 2;
    var called = false;
    function callback(complete) {
      --parts;
      if (called) {
        return;
      }
      if (parts === 0 || !complete) {
        called = true;
        done(complete);
      }
    }
    this.view.animate(
      {
        zoom: zoom - 3,
        duration: duration / 2,
      },
      {
        zoom: zoom,
        duration: duration / 2,
      },
      callback
    );
    this.view.animate(
      {
        center: location,
        duration: duration,
      },
      callback
    );

    //https://tiles.openaerialmap.org/5a25ade531eff4000c380678/0/cc588cdf-003d-4a36-938b-c466837d0b0e/wmts

    //"https://tiles.openaerialmap.org/5ea73f383295f300072a6d05/0/5ea73f383295f300072a6d06/{z}/{x}/{y}"
  }

  componentDidMount() {
    this.olmap.setTarget("map");

    // Listen to map changes
    this.olmap.on("moveend", () => {
      let center = this.olmap.getView().getCenter();
      let zoom = this.olmap.getView().getZoom();
      this.setState({ center, zoom });
    });

    this.source.on("addfeature", function (evt) {
      var feature = evt.feature;
      var coords = feature.getGeometry().getCoordinates();
      console.log(coords);
      //console.log(lcreation);
    });

    this.olmap.on('singleclick', function(evt) {  
      console.log(evt.pixel);
      this.forEachLayerAtPixel(evt.pixel, function(layer, pixel) {
        console.log(pixel);
        console.log(layer);
        let name = layer.get('layerName');
        console.log(name);
      
      });
      //this.setState({ dtm: dtm});

    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    let center = this.olmap.getView().getCenter();
    let zoom = this.olmap.getView().getZoom();
    if (center === nextState.center && zoom === nextState.zoom) return false;
    return true;
  }

  concentrateOnIsrael() {
    //this.setState({ center: [34.78, 32.068], zoom: 10 });
    this.flyTo(fromLonLat([34.78, 32.068]), 10, () => {});
  }

  addxyzLayer() {
    let tilelayer = lcreation.createImageLayer({
      imageUrl:
        "https://tiles.openaerialmap.org/5eb16b3b5e2ac500079ec8ad/0/5eb16b3b5e2ac500079ec8ae/{z}/{x}/{y}",
    });
    this.olmap.addLayer(tilelayer);
    this.flyTo(fromLonLat([37.4377898218, 55.8414179753]), 18, () => {});
  }

  addDTMLayer() {
    
    let elevation = new ImageLayer({
      //extent: extent,
      layerName: "DTMTest",
      source: new ImageWMS({
        url: 'http://localhost:8600/geoserver/DTED/wms',
        params: {'LAYERS': 'DTED:n31'},
        ratio: 1,
        serverType: 'geoserver',
        crossOrigin: '',
       
      })});
    
    var raster = new RasterSource({
        sources: [elevation],
        operation: function (pixels, data) {
          
          //console.log(pixels[0]);
          //console.log(data);
          return pixels[0];
        }
    });

    // raster.on('beforeoperations', function (event) {
    //   var data = event.data;
    //   //console.log(data);
    //   // for (var id in controls) {
    //   //   data[id] = Number(controls[id].value);
    //   // }
    // });

    let dtmLayer = new ImageLayer({
      opacity: 0.6,
      source: raster,
    });
    this.olmap.addLayer(elevation);
   
    this.flyTo(fromLonLat([34.7377898218, 32.8414179753]), 8, () => {});
  }

  dispalayElevation(pixels, data)
  {
    return pixels;
  }

  onDrawTypeSelected = (e) => {
    let value = e.target.value;
    this.olmap.removeInteraction(this.draw);
    if (value !== "None") {
      this.draw = new Draw({
        source: this.source,
        type: value,
      });
      this.draw.drawend = (e) => {
        console.log(e);
      };
      this.olmap.addInteraction(this.draw);
    }
  };

  render() {
    this.updateMap(); // Update map on render?
    return (
      <div id="map" style={{ width: "100%", height: "900px" }}>
        <button onClick={(e) => this.concentrateOnIsrael()}>Israel</button>
        <button onClick={(e) => this.addxyzLayer()}>Add Image</button>
        <button onClick={(e) => this.addDTMLayer()}>Add DTM</button>
        DTM  
        <textbox id="dtm">{this.state.dtm}</textbox>
        <GeometryCombo onTypeSelected={this.onDrawTypeSelected} />
      </div>
    );
  }
}

export default PublicMap;
