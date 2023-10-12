import type { Options } from 'tsup'

export const tsup: Options = {
  splitting: true,
  clean: true, // clean up the dist folder
  dts: true, // generate dts files
  format: ['cjs', 'esm'], // generate cjs and esm files
  outExtension: (ctx) => ({ js: ctx.format === 'esm' ? '.mjs' : '.js', dts: '.d.ts'}),
  minify: true,
  bundle: true,
  skipNodeModulesBundle: true,
  entryPoints: ['src/index.ts'],
  watch: false,
  target: 'es6',
  outDir: 'dist',
  entry: ['src/**/*.ts'], //include all files under src
}
