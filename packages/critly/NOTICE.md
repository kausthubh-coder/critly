# Notices

`src/check.js` ports code from two MIT-licensed projects. Thank you to both.

## lintapple

https://github.com/gholtzap/lintapple, commit `d374ea8` (2026-10-11).

Ported into `src/check.js`: from `src/visibility.js`, the `visible`, `textRects` and generated-text helpers; from
`src/audit.js`, the selector chain, `edgeInsets` and `clientBounds` geometry, the clip, scroll and
containing-block context used by the `overflow` rule, the numeric table cell inference behind `tabular-numbers`,
the block-aware text walk behind `placeholder-content`, and the list of cases where contrast can't be measured.
`src/browser.js` and the CLI's plain error messages follow lintapple's `src/browser.js` and `src/cli-error.js`.

```
MIT License

Copyright (c) 2026 Gavin Holtzapple

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## @shadcn/lint

https://github.com/shadcn-ui/lint, commit `9a55f6d` (2026-10-10).

Ported into `src/check.js`: from `packages/lint/src/grammar/colors.ts`, the sRGB to OKLab conversion and color
distance; from `packages/lint/src/rules/suggest.ts`, the role-aware nearest-token search, the nearest-steps
suggestion, and the rule that no message offers the policy as the fix.

```
MIT License

Copyright (c) 2026 shadcn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
