# Be Vietnam Pro font assets

Static WOFF faces: 500 (Medium), 700 (Bold), 800 (ExtraBold), normal style.
Each file includes the full Latin and Vietnamese cmap (459 code points), rather
than the separate CSS subsets that Satori 0.10.14 cannot combine under one name.
Font version: 1.002. License: SIL Open Font License 1.1, included in OFL.txt.

Source: https://github.com/google/fonts/tree/1cfe4cb468a703a247ca2d02410f80841b496218/ofl/bevietnampro
Source files: BeVietnamPro-Medium.ttf, BeVietnamPro-Bold.ttf,
BeVietnamPro-ExtraBold.ttf. Converted losslessly to WOFF with fontTools 4.x:

```python
from fontTools.ttLib import TTFont
font = TTFont(source_ttf)
font.flavor = 'woff'
font.save(destination_woff)
```

The tested glyph outlines match the existing @fontsource/be-vietnam-pro 5.0.8
subsets. No family, weight, or design substitution was made.
