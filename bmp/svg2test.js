const Svg2 = require('oslllo-svg2')

!(async function () {
  await Svg2('giyuu.svg').bmp().toFile('out.bmp')

})()
