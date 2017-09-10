const { Pool } = require('pg');
const fs = require('fs');
const {bounds} = require('geo-viewport');
const pool = new Pool({host: "localhost", database: "elevations_detailed"});
const envelope = bounds([-118.2923, 36.5785], 10, [800, 800]);

console.log(envelope)

const sql = `SELECT to_json(ST_DumpValues(
  ST_Clip(ST_Union(rast),
    ST_MakeEnvelope(${envelope.join(",")}, 4326)
  )
)) AS rast FROM elevations
WHERE ST_Intersects(rast,
  ST_MakeEnvelope(${envelope.join(",")}, 4326)
);`

const query = (query, cb) => {
  pool.query(query, (err, result) => {
    if (err) throw err;
    cb(result);
  });
}

query(sql, ({rows: [result]}) => {
  fs.writeFileSync("./static/data/whitney.json", JSON.stringify(result.rast.valarray.map(r => r.slice(0, result.rast.valarray.length))));
})

pool.end();
