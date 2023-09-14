// import React from 'react';
import { renderToReadableStream } from 'react-dom/server';
import TestComponent from './components/testComponent';
import Home from './pages/home';

// EXAMPLE: https://www.npmjs.com/package/@bun-examples/react-ssr
// Figure out what the bottom half of dev.tsx from example does
// Figure out how to serve JS files when a JS file is requested
// [ THIS IS THE FIX ] Consider creating a layout file, maybe thats part of what is causing issues
// Try to create another page with a seperate component
// Try to install tailwind, https://stackoverflow.com/questions/72919826/how-to-use-tailwind-with-bun
// the build folder can probably be added to .gitignore
//
// YOU MUST NAVIGATE TO /home OR ELSE NOTHING WILL WORK

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
// console.log(srcRouter)
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
    // If request is for a page, then return page component
    if (builtMatch) {
      console.log('MATCH FROM BUILT ROUTER')
      console.log(builtMatch.src)

      const stream = await renderToReadableStream(<Home />, {
        // PATH TO PAGE IN BUILD FOLDER
        // bootstrapScriptContent: '/home.js',
        bootstrapScriptContent: `globalThis.PATH_TO_PAGE = "/${builtMatch.src}";`,
        // bootstrapScriptContent: `globalThis.PATH_TO_PAGE = "/home.js";`,
        // bootstrapScriptContent: 'console.log("LOADED")',

        bootstrapModules: ['/hydrate.js'],
      })
      return new Response(stream, {
        headers: { 'Content-Type': 'text/html' }
      })
    } else {
      // IF THE REQ ISNT FOR A PAGE, THEN ITS FOR A FILE, either in ../build or ../public (doesnt exist, but it should)

      let filePath = new URL(req.url).pathname;
      // const rootPath = builtMatch ? '../build/pages' : '../build';
      // if (filePath === '/') filePath = '/index.html'
      // console.log(`YOU'RE REQUESTING A FILE THAT DOESNT EXIST`)
      console.log(`REQUESTING FILE`)
      // console.log(Bun.file('../build' + filePath))
      // const file = Bun.file(filePath);
      // console.log(file)
      // console.log(await Bun.file(filePath).text())
      // console.log(await Bun.file('poopydoodoo.js').text())
      // console.log(await Bun.file('./hydrate.tsx').text())
      // console.log(await Bun.file('../build/hydrate.js').text())

      // IF SEARCHING FOR PAGE'S JS FILE, LOOK IN PAGES DIR OF BUILD
      // Can get src of all pages by running builtRouter.routes.forEach(route => route.src).includes(filePathWithOutASlash)
      if (filePath === '/home.js') filePath = '/pages' + filePath;
      console.log(filePath)
      console.log('../build' + filePath);
      // return new Response(Bun.file('../build/hydrate.js'))
      return new Response(Bun.file('../build' + filePath))
      // return new Response(Bun.file(rootPath + filePath))

      // return new Response(Bun.file(filePath))
      // return new Response(`YOU'RE REQUESTING A FILE THAT DOESNT EXIST`)
    }
  }
})
console.log(`Server is running on port ${server.port}`)
