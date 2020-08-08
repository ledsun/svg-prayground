const headerSize = 54; // ファイルヘッダ（14byte） + ファイル情報ヘッダ（40byte）= 54byte 固定

// http://www.umekkii.jp/data/computer/file_format/bitmap.cgi
// https://www.ruche-home.net/program/bmp/struct
function fillFileHeader(dv, fileSize, headerSize) {
  // bfType ファイルタイプ BM固定
  dv.setUint8(0x0, "BM".charCodeAt(0));
  dv.setUint8(1, "BM".charCodeAt(1));
  dv.setUint32(2, fileSize, true); // bfSize ファイルサイズ
  dv.setUint16(6, 0); // bfReserved1 予約領域 0固定
  dv.setUint16(8, 0); // bfReserved2 予約領域 0固定
  dv.setUint32(10, headerSize, true); // bfOffBits ファイルの先頭から画像データまでのオフセット[byte]
}

// 情報ヘッダ INFOタイプ
function fillImageHeader(dv, width, height, bodySize) {
  dv.setUint32(14, 40, true); // biSize 情報ヘッダサイズ INFOタイプでは 40
  dv.setUint32(18, width, true); // biWidth 画像の幅[ピクセル]
  dv.setUint32(22, height, true); // biHeight 画像の高さ[ピクセル]
  dv.setUint16(26, 1, true); // biPlanes プレーン数 1固定
  dv.setUint16(28, 32, true); // biBitCount 色ビット数[bit] 1, 4, 8, 16, 24, 32
  dv.setUint32(30, 0, true); // biCompression 圧縮形式 0, 1, 2, 3
  dv.setUint32(34, bodySize, true); // biSizeImage 画像データサイズ[byte]
  dv.setUint32(38, 0, true); // biXPixPerMeter 水平解像度[dot/m] 0で良さそう
  dv.setUint32(42, 0, true); // biYPixPerMeter 垂直解像度[dot/m] 0で良さそう
  dv.setUint32(46, 0, true); // bitClrUsed 格納パレット数[使用色数]
  dv.setUint32(50, 0, true); // bitClrImportant 重要色数
}

module.exports = class Canvas2Bitmap {
  constructor(canvasImageData) {
    this._canvasImageData = canvasImageData;
  }

  get _width() {
    return this._canvasImageData.width;
  }

  get _height() {
    return this._canvasImageData.height;
  }

  get _header() {
    const width = this._width;
    const height = this._height;
    const bodySize = width * height * 4; // 色ビット数は32ビット（4byte）決め打ち
    const fileSize = headerSize + bodySize;

    const dv = new DataView(new ArrayBuffer(headerSize));
    fillFileHeader(dv, fileSize, headerSize);
    fillImageHeader(dv, width, height, bodySize);

    return new Uint8Array(dv.buffer);
  }

  get _body() {
    const data = this._canvasImageData.data;
    const bodyData = new Uint32Array(data.length);

    // ある行を左から右に進んで行く
    for (var x = 0; x < this._width; x++) {
      // 上から下に行を進んで行く
      for (var y = 0; y < this._height; y++) {
        // y行目のx列の位置
        // canvasのimageDataは1バイトごとに分かれている、画素単位の4バイトずつ進みます。
        const i = (y * this._width + x) * 4;

        // ビットマップは左下から右上に記録されているので、下から詰めていく
        const j = this._width * (this._height - y) - (this._width - x);

        // 32bitビットマップ
        // １画素あたり32bit(4byte)で、Blue(8bit)、Green(8bit)、Red(8bit)、Resered(8bit)の順番で色の値が記録される。Reseredには'0'が入る。
        // 137, 41, 69, 255だとしたら？
        // 0x45, 0x29, 0x89, 0x00
        bodyData[j] =
          (data[i + 0] << 16) | // Red
          (data[i + 1] << 8) | // Green
          data[i + 2]; // Blue
      }
    }

    return new Uint8Array(bodyData.buffer);
  }

  // WebでもNodeでも扱いやすい、Uint8Arrayを返します。
  get buffer() {
    const buffer = new Uint8Array(headerSize + this._canvasImageData.data.length * 4);
    buffer.set(this._header, 0);
    buffer.set(this._body, headerSize);
    return buffer;
  }
};

