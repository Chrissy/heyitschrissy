![](https://photos-4.dropbox.com/t/2/AAAKn2lEn48qjV4Q3VO1lM0R2ebgr3QluCE34TyfAmEmSA/12/642069079/png/32x32/3/1505264400/0/2/personal_site.png/EP3P7JsFGCYgAigC/GBM8-G46VXgcGkkRjJfeBqTig-B3WKKgfKl_27gCvVM?dl=0&size=2048x1536&size_mode=3)

# heyitsme
My personal site

I build the terrain composites in Node using PostGIS, Jimp, and the Mapbox static api. I request them on the frontend and render it with three. You can see the code at:

* `static/app.js` (no frameworks, tried to keep this as simple and tidy as possible)
* `builders/terrain-sketches.js` (a little sloppy but it works!)
* `sketches.json` this is the source of truth for both the builder and the front end

Unless you have experience with PostGIS and know how to make an elevation raster db, I wouldn't try to run the builder. Eventually I'll switch from postgis to a heightmap raster service, and then you should be able to build your own typography terrain. In the meantime, the front end should run fine.

All of my portfolio images are stored on S3, but I also commit them here to serve as an archive. They are located at `static/images`. Feel free to use anything, just make sure to link back.
