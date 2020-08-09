// canvasImageDataをビットマップフォーマットに変換します。
// ビットマップフォーマットの仕様は下記サイトに準拠します。
// http://www.umekkii.jp/data/computer/file_format/bitmap.cgi
// https://www.ruche-home.net/program/bmp/struct

const headerSize = 54; // ファイルヘッダ（14byte） + ファイル情報ヘッダ（40byte）= 54byte 固定

module.exports = class Canvas2Bitmap {
  constructor(canvasImageData) {
    this._depth = 3; // 色ビット数（バイト単位）
    this._canvasImageData = canvasImageData;
    this._buffer = new DataView(new ArrayBuffer(this._fileSize));
  }

  get _width() {
    return this._canvasImageData.width;
  }

  get _height() {
    return this._canvasImageData.height;
  }

  // 行単位のパディングを求める
  // 1行のデータが4バイトの倍数出なかった場合は、4バイトになるまで埋めます。
  get _linePadding() {
    return 4 - (this._width * this._depth) % 4;
  }

  get _lineDataSize() {
    return this._width * this._depth + this._linePadding
  }

  get _bodySize() {
    return this._lineDataSize * this._height;
  }

  get _fileSize() {
    return headerSize + this._bodySize;
  }

  _fillFileHeader() {
    // bfType ファイルタイプ BM固定
    this._buffer.setUint8(0x0, "BM".charCodeAt(0));
    this._buffer.setUint8(1, "BM".charCodeAt(1));
    this._buffer.setUint32(2, this._fileSize, true); // bfSize ファイルサイズ
    this._buffer.setUint16(6, 0); // bfReserved1 予約領域 0固定
    this._buffer.setUint16(8, 0); // bfReserved2 予約領域 0固定
    this._buffer.setUint32(10, headerSize, true); // bfOffBits ファイルの先頭から画像データまでのオフセット[byte]
  }

  // 情報ヘッダ INFOタイプ
  _fillImageHeader() {
    this._buffer.setUint32(14, 40, true); // biSize 情報ヘッダサイズ INFOタイプでは 40
    this._buffer.setUint32(18, this._width, true); // biWidth 画像の幅[ピクセル]
    this._buffer.setUint32(22, this._height, true); // biHeight 画像の高さ[ピクセル]
    this._buffer.setUint16(26, 1, true); // biPlanes プレーン数 1固定
    this._buffer.setUint16(28, this._depth * 8, true); // biBitCount 色ビット数[bit] 1, 4, 8, 16, 24, 32
    this._buffer.setUint32(30, 0, true); // biCompression 圧縮形式 0, 1, 2, 3
    this._buffer.setUint32(34, this._bodySize, true); // biSizeImage 画像データサイズ[byte]
    this._buffer.setUint32(38, 0, true); // biXPixPerMeter 水平解像度[dot/m] 0で良さそう
    this._buffer.setUint32(42, 0, true); // biYPixPerMeter 垂直解像度[dot/m] 0で良さそう
    this._buffer.setUint32(46, 0, true); // bitClrUsed 格納パレット数[使用色数]
    this._buffer.setUint32(50, 0, true); // bitClrImportant 重要色数
  }

  _fillBody() {
    const data = this._canvasImageData.data;

    // ある行を左から右に進んで行く
    for (var x = 0; x < this._width; x++) {
      // 上から下に行を進んで行く
      for (var y = 0; y < this._height; y++) {
        // canvasのimageDataは1バイトごとにRGBAが分かれている。
        // 画素単位の4バイトずつ進みます。
        const i = (y * this._width + x) * 4;

        // ビットマップは左下から右上に記録されているので、下から詰めていく
        const j = headerSize +
          this._lineDataSize * (this._height - y - 1) +
          x * this._depth;

        // 24bitビットマップ
        // １画素あたり24bit(3byte)で、Blue(8bit)、Green(8bit)、Red(8bit)。
        // 137, 41, 69, 255だとしたら？
        // 0x45, 0x29, 0x89
        this._buffer.setUint8(j, data[i + 2]); // Blue
        this._buffer.setUint8(j + 1, data[i + 1]); // Green
        this._buffer.setUint8(j + 2, data[i + 0]); // Red
      }
    }
  }

  // WebでもNodeでも扱いやすい、Uint8Arrayを返します。
  get buffer() {
    this._fillFileHeader();
    this._fillImageHeader();
    this._fillBody();
    return new Uint8Array(this._buffer.buffer);
  }
};
