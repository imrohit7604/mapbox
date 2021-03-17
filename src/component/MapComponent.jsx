
import React,  {useState,useEffect,useRef} from 'react'
import ReactMapGL ,{Marker,Popup,FlyToInterpolator}from "react-map-gl"
import * as GeoData from "../data/GeoData.json"
import useSupercluster from "use-supercluster";

function MapComponent() {
    const[viewPort,setViewPort]=useState({
        latitude:45.211,
        longtitude:-75.6903,
        width:"100vw",
        height:"100vh",
        zoom:10
    })
    const [selectedLocation, setSelectedLocation] = useState(null);
    const mapRef = useRef();
    useEffect(() => {
      const listener = e => {
        if (e.key === "Escape") {
            setSelectedLocation(null);
        }
      };
      window.addEventListener("keydown", listener);  
      return () => {
        window.removeEventListener("keydown", listener);
      };
    }, []);
    const points = GeoData.features.map(location => ({...location,
        properties: { cluster: false, ...location.properties },
        geometry:{
            coordinates:[parseFloat(location.geometry.coordinates[0]),parseFloat(location.geometry.coordinates[1])],
            type:location.geometry.type
        }
      }));
      console.log("points",points)
      const bounds = mapRef.current
      ? mapRef.current
          .getMap()
          .getBounds()
          .toArray()
          .flat()
      : null;
  
    const { clusters, supercluster } = useSupercluster({
      points,
      bounds,
      zoom: viewPort.zoom,
      options: { radius: 100, maxZoom: 20 }
    });
    return (
        <div>
            <ReactMapGL
            {...viewPort} 
            mapboxApiAccessToken={"pk.eyJ1IjoiaW1yb2hpdDc2MDQiLCJhIjoiY2ttZDRtbzkxMDlmdjJzcDU1MGhjZGU2YiJ9.TzEvFqKsm5Ef5PXtjrMnog"}
            mapStyle="mapbox://styles/mapbox/dark-v10"
            onViewportChange={viewPort=>{
                setViewPort(viewPort)
            }}
            ref={mapRef}
            >       
         {clusters.map(cluster => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const {
            cluster: isCluster,
            point_count: pointCount
          } = cluster.properties;

          if (isCluster) {
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                latitude={latitude}
                longitude={longitude}
              >
                <div
                  className="cluster-marker"
                  style={{
                    width: `${10 + (pointCount / points.length) * 20}px`,
                    height: `${10 + (pointCount / points.length) * 20}px`
                  }}
                  onClick={() => {
                    const expansionZoom = Math.min(
                      supercluster.getClusterExpansionZoom(cluster.id),
                      20
                    );
                    setViewPort({
                      ...viewPort,
                      latitude,
                      longitude,
                      zoom: expansionZoom,
                      transitionInterpolator: new FlyToInterpolator({
                        speed: 2
                      }),
                      transitionDuration: "auto"
                    });
                  }}
                >
                <img src="Cluster.png" alt="Cluster" />
                </div>
              </Marker>
            );
          }

          return (
            <Marker
            
            key={`location-${cluster.properties.id}`}
            latitude={latitude}
            longitude={longitude}
          >
            <button className="marker-btn"   onClick={e => {
                  e.preventDefault();
                  setSelectedLocation(cluster);
                }}>
              <img src="Point.png" alt="Point" />
            </button>
          </Marker>
          );
        })}
        {selectedLocation ? (
          <Popup
            latitude={parseFloat(selectedLocation.geometry.coordinates[1])}
            longitude={parseFloat(selectedLocation.geometry.coordinates[0])}
            onClose={() => {
                setSelectedLocation(null);
            }}
          >
            <div>
              <p>Age Classification: {selectedLocation.properties.ageClassification}</p>
              <p>Days at location: {selectedLocation.properties.daysAtLocation}</p>
              <p>Location Name: {selectedLocation.properties.locationName}</p>
              <p>Location Type: {selectedLocation.properties.locationType}</p>
              <p>Owner: {selectedLocation.properties.owner}</p>
              <p>Serial Number: {selectedLocation.properties.serialNumber}</p>
              <p>Status: {selectedLocation.properties.status}</p>
            </div>
          </Popup>
        ) : null}
            </ReactMapGL>
        </div>
    )
}

export default MapComponent
