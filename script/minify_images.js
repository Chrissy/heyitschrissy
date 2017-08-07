const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

imagemin(['static/images/*.{jpg,png}'], 'static/compressed_images', {
    plugins: [imageminMozjpeg(), imageminPngquant({quality: '65-80'})]
}).then(files => {
    console.log(files);
});
