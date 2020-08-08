const { createCanvas, loadImage } = require("canvas");
const Canvas2Bitmap = require("./Canvas2Bitmap")
const fs = require("fs");

function getCanvasImageData(image) {
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0);
  return ctx.getImageData(0, 0, image.width, image.height);
}

!(async function () {
  const image = await loadImage(process.argv[2]);
  const canvasImageData = getCanvasImageData(image);
  const bitmap = new Canvas2Bitmap(canvasImageData)
  const stream = fs.createWriteStream('out.bmp');
  stream.write(bitmap.buffer);
  stream.end();
})();
