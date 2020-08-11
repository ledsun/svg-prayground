const { createCanvas, loadImage } = require('canvas')

!(async function () {
  const image = await loadImage(process.argv[2])
  const canvas = createCanvas(image.width, image.height)
  const context = canvas.getContext('2d')
  context.drawImage(image, 0, 0)
  const data = context.getImageData(0, 0, canvas.width, canvas.height).data

  const count = new Set()
  for(let i = 0; i < data.length; i += 4){
    count.add(
      data[i] << 16 |
      data[i + 1] << 8 |
      data[i + 2]
    )
  }

  for (const v of count.values()) {
    console.log(v.toString(16).padStart(6, '0'))
  }
})()