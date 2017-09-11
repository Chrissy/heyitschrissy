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

const writeElevations = ({name, zoom, coordinates}) => {
  const envelope = bounds(coordinates, zoom, [800, 800]);
  const sql = `SELECT to_json(ST_DumpValues(
    ST_Clip(ST_Union(rast), ST_MakeEnvelope(${envelope.join(",")}, 4326))
  )) AS rast FROM elevations
  WHERE ST_Intersects(rast,
    ST_MakeEnvelope(${envelope.join(",")}, 4326)
  );`

  query(sql, ({rows: [result]}) => {
    fs.writeFileSync(`./static/data/${name}.json`, JSON.stringify(result.rast.valarray.map(r => r.slice(0, result.rast.valarray.length))));
  })
}

const placeToMapboxStaticApiUrl = ({coordinates, zoom}) => {
  return `http://api.mapbox.com/v4/mapbox.satellite/${coordinates.join(",")},${zoom}/1024x1024.jpg70?access_token=pk.eyJ1IjoiZml2ZWZvdXJ0aHMiLCJhIjoiY2lvMXM5MG45MWFhenUybTNkYzB1bzJ0MiJ9._5Rx_YN9mGwR8dwEB9D2mg`
}

const compositeEarthImages = (place1, place2) => {
  jimp.read(placeToMapboxStaticApiUrl({...place2}), (err, image2) => {
    jimp.read('./static/fonts/q.jpg', (err, letter) => {
      image2.mask(letter, 0, 0);
      jimp.read(placeToMapboxStaticApiUrl({...place1}), (err, image1) => {
        image1.composite(image2, 0, 0).write(`./static/data/${place1.name}-${place2.name}.jpg`)
      });
    });
  });
};

// writeElevations({...guide.find(p => p.name == 'crater-lake')});
// writeElevations({...guide.find(p => p.name == 'capitol-reef')})

compositeEarthImages({...guide.find(p => p.name == 'crater-lake')}, {...guide.find(p => p.name == 'capitol-reef')});

pool.end();
