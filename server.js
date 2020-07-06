const connect = require('connect')

connect()
  .use((req, res, next) => {
    if(req.url === '/favicon.ico'){
      return next()
    }

    const color = `rgba(${randomColorFactor()},${randomColorFactor()},${randomColorFactor()},0.7)`
    const svg = `<?xml version="1.0" encoding="utf-8"?>
    <!-- Generator: Adobe Illustrator 16.0.4, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
    <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
    <svg version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
      width="512px" height="512px" viewBox="0 0 512 512" enable-background="accumulate 0 0 512 512" xml:space="preserve">
    <path fill="${color}" d="M395.141,193.75V90.781h-47.703v55.266l-53.375-53.391L256,54.625l-38.063,38.031L0,310.609l38.062,38.062
      l41.813-41.828v150.531h352.25V306.844l41.812,41.828L512,310.609L395.141,193.75z"/>
    </svg>
    `

    res.setHeader('Content-Type', 'image/svg+xml')
    res.end(svg)
    next()
  })
  .listen(process.env.PORT || 3000)

function randomColorFactor() {
  return Math.round(Math.random() * 255)
}
