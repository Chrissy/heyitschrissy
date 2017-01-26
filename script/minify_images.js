const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');

imagemin(['static/images/*.jpg'], 'static/images/compressed', {
    plugins: [imageminMozjpeg({targa: true})]
}).then(files => {
    console.log(files);
});
