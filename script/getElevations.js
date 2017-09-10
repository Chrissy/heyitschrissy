const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({host: "localhost", database: "elevations_detailed"});

const sql = `SELECT to_json(ST_DumpValues(
  ST_Clip(ST_Union(rast),
    ST_Envelope(ST_Buffer(ST_SetSRID(ST_MakePoint(-118.2923, 36.5785), 4326)::geography, 51400)::geometry)
  )
)) AS rast FROM elevations
WHERE ST_Intersects(rast,
  ST_Envelope(
    ST_Buffer(ST_SetSRID(ST_MakePoint(-118.2923, 36.5785), 4326)::geography, 51400)::geometry
  )
);`

const query = (query, cb) => {
  pool.query(query, (err, result) => {
    if (err) throw err;
    cb(result);
    pool.end();
  });
}

query(sql, ({rows: [result]}) => {
  fs.writeFileSync("./static/data/whitney.json", JSON.stringify(result.rast.valarray.map(r => r.slice(0, result.rast.valarray.length))));
})
