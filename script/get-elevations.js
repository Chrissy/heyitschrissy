const { Pool } = require('pg');
const fs = require('fs');
const jimp = require('jimp');
const fetch = require('node-fetch');
const {bounds} = require('geo-viewport');
const pool = new Pool({host: "localhost", database: "elevations_detailed"});
const guide = JSON.parse(fs.readFileSync("./script/guide.json"));

const query = (query, cb) => {
  pool.query(query, (err, result) => {
    if (err) throw err;
    cb(result);
  });
}

const scanImage = (i) => {
  let onOffMap = [];
  i.scan(0, 0, i.bitmap.width, i.bitmap.height, function(x, y, idx) {
    onOffMap.push(this.bitmap.data[ idx + 0 ]);
  });
  return onOffMap;
}

const getElevations = ({name, zoom, coordinates}, cb) => {
  const envelope = bounds(coordinates, zoom, [800, 800]);
  const sql = `SELECT to_json(ST_DumpValues(
    ST_Clip(ST_Union(rast), ST_MakeEnvelope(${envelope.join(",")}, 4326))
  )) AS rast FROM elevations
  WHERE ST_Intersects(rast,
    ST_MakeEnvelope(${envelope.join(",")}, 4326)
  );`

  query(sql, ({rows: [result]}) => {
    cb(result.rast.valarray)
  })
}

const placeToMapboxStaticApiUrl = ({coordinates, zoom}) => {
  return `http://api.mapbox.com/v4/mapbox.satellite/${coordinates.join(",")},${zoom}/1024x1024.jpg70?access_token=pk.eyJ1IjoiZml2ZWZvdXJ0aHMiLCJhIjoiY2lvMXM5MG45MWFhenUybTNkYzB1bzJ0MiJ9._5Rx_YN9mGwR8dwEB9D2mg`
}

const compositeElevations = (place1, place2, compositeImage, cb) => {
  getElevations(place1, (elevations1) => {
    getElevations(place2, (elevations2) => {
      const width = Math.min(elevations1.length, elevations2.length);
      const sliced1 = elevations1.map(p => p.slice(0, width)).slice(0, width).reduce((a,r) => [...a, ...r]);
      const sliced2 = elevations2.map(p => p.slice(0, width)).slice(0, width).reduce((a,r) => [...a, ...r]);
      jimp.read(compositeImage, (err, letterImage) => {
        const pixelMap = scanImage(letterImage.resize(width, width));
        const mappedElevations = sliced1.map((s, i) => (pixelMap[i] == 0) ? sliced1[i] : sliced2[i]);
        cb(mappedElevations);
      });
    });
  });
}

const compositeTerrain = (place1, place2, compositeImage, cb) => {
  jimp.read(placeToMapboxStaticApiUrl({...place2}), (err, image2) => {
    jimp.read(compositeImage, (err, letter) => {
      jimp.read(placeToMapboxStaticApiUrl({...place1}), (err, image1) => {
        image2.mask(letter, 0, 0);
        cb(image1.composite(image2, 0, 0));
      });
    });
  });
};

const createTerrainBundle = ({innerTerrain, outerTerrain, name, mask, cb}) => {
  compositeElevations(innerTerrain, outerTerrain, mask, (mappedElevations) => {
    compositeTerrain(innerTerrain, outerTerrain, mask, (newImage) => {
      newImage.getBase64(jimp.MIME_JPEG, (err, base64Image) => {
        const json = JSON.stringify({elevations: mappedElevations, image: base64Image})
        fs.writeFileSync(`./static/dist/${name}.json`, json);
        cb();
      })
    })
  })
}

guide.forEach((t, i) => {
  createTerrainBundle({...t, cb: () => {
    if (i == guide.length - 1) pool.end()
  }});
});
