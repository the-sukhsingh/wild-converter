declare module "omggif" {
  export class GifWriter {
    constructor(
      buf: Uint8Array,
      width: number,
      height: number,
      options?: { loop?: number; palette?: number[] }
    );
    addFrame(
      x: number,
      y: number,
      w: number,
      h: number,
      indexedPixels: Uint8Array,
      options?: { palette?: number[]; transparent?: number | null; delay?: number }
    ): number;
    end(): number;
  }
}

declare module "utif" {
  const UTIF: {
    encodeImage(rgba: Uint8Array, width: number, height: number): ArrayBuffer;
    decode(buffer: ArrayBuffer): any[];
    toRGBA8(ifd: any): Uint8Array;
  };
  export default UTIF;
}

declare module "potrace" {
  export interface PotraceOptions {
    threshold?: number;
    turnPolicy?: string;
    optCurve?: boolean;
    optTolerance?: number;
    color?: string;
    background?: string;
  }

  export const Potrace: {
    TURNPOLICY_MINORITY: string;
    TURNPOLICY_MAJORITY: string;
    TURNPOLICY_BLACK: string;
    TURNPOLICY_WHITE: string;
  };

  export function trace(
    image: string | Buffer | Uint8Array,
    options: PotraceOptions | ((err: Error | null, svg: string) => void),
    callback?: (err: Error | null, svg: string) => void
  ): void;

  export class Posterizer {
    constructor(options?: any);
    loadImage(target: any, callback: (err: any) => void): void;
    getSVG(): string;
  }
}

declare module "wawoff2" {
  export function compress(input: Uint8Array): Promise<Uint8Array>;
  export function decompress(input: Uint8Array): Promise<Uint8Array>;
}

declare module "fonteditor-core" {
  export class Font {
    static create(buffer: ArrayBuffer | Buffer, options?: { type?: string }): Font;
    write(options: { type: "ttf" | "otf" | "woff" | "woff2" | "eot" | "svg"; hinting?: boolean }): any;
  }
}

declare module "heic2any" {
  export default function heic2any(options: {
    blob: Blob;
    toType?: string;
    quality?: number;
    multiple?: boolean;
  }): Promise<Blob | Blob[]>;
}

declare module "js-toml" {
  export function load(text: string): any;
  export function dump(obj: any): string;
}

declare module "pptx-preview" {
  export function init(
    container: HTMLElement,
    options?: {
      mode?: "slide" | "list";
      width?: number;
      height?: number;
    }
  ): {
    preview(data: ArrayBuffer | Uint8Array): Promise<void>;
    renderSingleSlide(index: number): void;
    slideCount: number;
    destroy(): void;
  };
}
