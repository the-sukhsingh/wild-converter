<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
<!-- BEGIN:wild-converter-rules -->
Okay, so I want to build a wild - converter, like one stop for converting one filetype to another.
It will have cleanest and minimal design possible.
One page app with clean and minimal ui.
One stop for converting one filetype to another.
All the commonly used filetype conversions will be available. 

Flow - 
1. Upload file from system storage, or cloud storage.
2. Select the filetype to convert to.
3. Select the quality, size, resolution, etc. options if available.
4. Convert file.
5. Download file.

No sign up required, no ads, no tracking, no bloat. 

We will use shadcn ui components for the base ui. 
But we can override them as needed. 
We can also add our own components if needed. 

The app will be responsive and mobile friendly.
The UI will be open-design, like no borders no shadow, just simple and clean design, no card based ui, just flat design, with good typography and spacing. The UI width will be constrained to 5xl. Two themes - light and dark. 

All the common filetype conversions will be available - 
Images - 
jpeg, png, webp, gif, svg, bmp, tiff, heic, heif, avif, jpg, jpeg-ls, png-ls, webp-ls, gif-ls, svg-ls, bmp-ls, tiff-ls, heic-ls, heif-ls, avif-ls. 
Also image compressor will be available. 

Documents - 
doc, docx, pdf, txt, rtf, html, htm, md, markdown, odt, org, rst, tex, wp, wps, xls, xlsx, csv, ods, odp, ppt, pptx, 

Audio - 
aac, amr, flac, mp3, ogg, wav, wma, m4a, ac3, ape, opus, ra, rm, spx, tta, wv, dff, dsf, aac-ls, amr-ls, flac-ls, mp3-ls, ogg-ls, wav-ls, wma-ls, m4a-ls, ac3-ls, ape-ls, opus-ls, ra-ls, rm-ls, spx-ls, tta-ls, wv-ls, dff-ls, dsf-ls. 

Video - 
mp4, webm, avi, mkv, mov, flv, wmv, m4v, 3gp, 3g2, ogv, mpg, mpeg, asf, rmvb, vob, evo, webm-ls, avi-ls, mkv-ls, mov-ls, flv-ls, wmv-ls, m4v-ls, 3gp-ls, 3g2-ls, ogv-ls, mpg-ls, mpeg-ls, asf-ls, rmvb-ls, vob-ls, evo-ls. 

Vectors - 
svg, eps, ai, cdr, pdf, dxf, dwg, wmf, emf, ps, eps-ls, ai-ls, cdr-ls, pdf-ls, dxf-ls, dwg-ls, wmf-ls, emf-ls, ps-ls. 

3D - 
fbx, obj, stl, glb, gltf, 3ds, dae, amf, 3mf, glb-ls, gltf-ls, fbx-ls, obj-ls, stl-ls, 3ds-ls, dae-ls, amf-ls, 3mf-ls. 

Fonts - 
ttf, otf, woff, woff2, eot, svg, svg-ls, ttf-ls, otf-ls, woff-ls, woff2-ls, eot-ls. 

Archives - 
zip, rar, 7z, tar, gz, bz2, xz, iso, dmg, cab, arj, ace, lzh, lha, jar, war, ear, hpi, nsf, apk, ipa, deb, rpm, apk-ls, ipa-ls, deb-ls, rpm-ls, zip-ls, rar-ls, 7z-ls, tar-ls, gz-ls, bz2-ls, xz-ls, iso-ls, dmg-ls, cab-ls, arj-ls, ace-ls, lzh-ls, lha-ls, jar-ls, war-ls, ear-ls, hpi-ls, nsf-ls. 

Other - 
html, htm, css, js, ts, jsx, tsx, py, java, c, cpp, csharp, go, rust, swift, php, ruby, perl, lua, r, scala, haskell, cobol, fortran, ada, lisp, prolog, sql, html-ls, htm-ls, css-ls, js-ls, ts-ls, jsx-ls, tsx-ls, py-ls, java-ls, c-ls, cpp-ls, csharp-ls, go-ls, rust-ls, swift-ls, php-ls, ruby-ls, perl-ls, lua-ls, r-ls, scala-ls, haskell-ls, cobol-ls, fortran-ls, ada-ls, lisp-ls, prolog-ls, sql-ls. 

All these conversions will be done client side using WASM. 
<!-- END:wild-converter-rules -->