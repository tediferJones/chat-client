// import React from 'react';
import { renderToReadableStream } from 'react-dom/server';
import TestComponent from './components/testComponent';
import Home from './pages/home';
import { resolvePtr } from 'dns';

// function JsxTest({ message }: { message: string }) {
//   return (
//     <h1>Hello {message}</h1>
//   )
// }
// console.log(<JsxTest message='TESTER' />)
// console.log("Hello via Bun!");

// const stream = await renderToReadableStream(<JsxTest message='from bun'/>)
// const stream = await renderToReadableStream(<TestComponent message='from exported function'/>)

const srcRouter = new Bun.FileSystemRouter({
  dir: './pages',
  style: 'nextjs',
})
console.log(srcRouter)
// console.log(Object.values(srcRouter.routes))

await Bun.build({
  entrypoints: [
    'hydrate.tsx',
    ...Object.values(srcRouter.routes),
  ],
  outdir: '../build',
  target: 'browser',
  splitting: true,
})

const buildRouter = new Bun.FileSystemRouter({
  dir: '../build/pages',
  style: 'nextjs',
})

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    // const stream = await renderToReadableStream(<TestComponent message='from exported function'/>)
    console.log(req.url)
    const srcMatch = srcRouter.match(req);
    if (srcMatch) {
      console.log('MATCH FROM SRC ROUTER')
      console.log(srcMatch.src)
    }
    const builtMatch = buildRouter.match(req)
    if (builtMatch) {
      console.log('MATCH FROM BUILT ROUTER')
      console.log(builtMatch.src)

      const stream = await renderToReadableStream(<Home />, {
        // PATH TO PAGE IN BUILD FOLDER
        // bootstrapScriptContent: '/home.js',
        // bootstrapScriptContent: `globalThis.PATH_TO_PAGE = "/${builtMatch.src}";`,
        // bootstrapScriptContent: `globalThis.PATH_TO_PAGE = "/home.js";`,
        // bootstrapScriptContent: 'console.log("LOADED")',

        bootstrapModules: ['/hydrate.js'],
      })
      return new Response(stream, {
        headers: { 'Content-Type': 'text/html' }
      })
    }
    console.log(`YOU'RE REQUESTING A FILE THAT DOESNT EXIST`)
    return new Response(`YOU'RE REQUESTING A FILE THAT DOESNT EXIST`)
  }
})
console.log(`Server is running on port ${server.port}`)
