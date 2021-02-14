import { Tile as OlLayerTile } from "ol/layer";
import XYZ from "ol/source/XYZ";
import { transformExtent } from "ol/proj";

class LayersCreation {
  // constructor (metaData)
  // {
  //     this.metaData = metaData;
  // }
  createSource(metaData) {
    const source = new XYZ({
      url: metaData.imageUrl,
      crossOrigin: "Anonymous",
      projection: "EPSG:3857",
    });
    return source;
  }

  createExtent(metaData, destinationProjCode = "EPSG:3857") {
    const sourceProjection = "EPSG:4326";
    // metaData.data.config && metaData.data.config.projection
    //   ? metaData.data.config.projection
    //   : "EPSG:4326";
    let extent = [-180, -90, 180, 90];
    // [extent[0], extent[1]] = proj.transform([extent[0], extent[1]], sourceProjection, destinationProjCode);
    // [extent[2], extent[3]] = proj.transform([extent[2], extent[3]], sourceProjection, destinationProjCode);
    extent = transformExtent(extent, "EPSG:4326", "EPSG:3857");
    return extent;
  }

  createImageLayer(metaData) {
    const tileLayer = new OlLayerTile({
      visible: true,
      preload: Infinity,
      source: this.createSource(metaData),
      extent: this.createExtent(metaData),
    });
    return tileLayer;
  }
}

export default new LayersCreation();
