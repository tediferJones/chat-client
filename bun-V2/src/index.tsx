// import React from 'react';
import { renderToReadableStream } from 'react-dom/server';
// import TestComponent from './components/testComponent';
// import Home from './pages/home';
// import Home from 'src/pages/home';
// import idk from ''

// EXAMPLE: https://www.npmjs.com/package/@bun-examples/react-ssr
// [ DONE ] Figure out what the bottom half of dev.tsx from example does
// [ DONE ] Figure out how to serve JS files when a JS file is requested
// [ THIS IS THE FIX ] Consider creating a layout file, maybe thats part of what is causing issues
// [ DONE ] Try to create another page with a seperate component
// [ DONE ] Get index page working
// [ DONE ] Try to install tailwind, https://stackoverflow.com/questions/72919826/how-to-use-tailwind-with-bun
// [ DONE ] the build folder can probably be added to .gitignore
// [ DONE ] fix paths in this file so that it can be run from the root of the project
//    - Might be a good idea to also create a start script in package.json
// Consider using tsconfig path aliases, make on for @root = './', @components = './src/components'
// [ DONE ] Add error handling, what if users manually naviages /thisFileDoesntExist

// USE THIS TO SO ALL PATHS ARE ALWAYS RELATIVE TO THIS FILE LOCATION
// console.log(import.meta.dir)
// console.log(import.meta.url)
// All paths are based on the location of this file (the file that runs the server)
const rootPath = import.meta.dir.replace('src', '');
console.log(rootPath)

const srcRouter = new Bun.FileSystemRouter({
  // dir: './pages',
  dir: rootPath + 'src/pages',
  style: 'nextjs',
})
// console.log(srcRouter)
// console.log(Object.values(srcRouter.routes))

// Bun.spawn(['touch', 'bunSpawnTest.txt'])
const test = Bun.spawn(['npx', 'tailwindcss', '-i', 'src/input.css', '-o', 'public/output.css'], {
  // cwd: '../'
  cwd: rootPath,
})

// console.log(srcRouter.routes)
// console.log(rootPath + 'build')
await Bun.build({
  entrypoints: [
    rootPath + 'src/hydrate.tsx',
    ...Object.values(srcRouter.routes),
  ],
  // outdir:'../build',
  // outdir: './build',
  outdir: rootPath + 'build',
  target: 'browser',
  splitting: true,
})

const buildRouter = new Bun.FileSystemRouter({
  // dir: '../build/pages',
  dir: rootPath + 'build/pages',
  style: 'nextjs',
})

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    // const srcMatch = srcRouter.match(req);
    // if (srcMatch) {
    //   console.log('MATCH FROM SRC ROUTER')
    //   console.log(srcMatch.src)
    // }
    const builtMatch = buildRouter.match(req)
    console.log(req.url)
    // console.log(buildRouter)
    // If request is for a page, then return page component
    if (builtMatch) {
      console.log('MATCH FROM BUILT ROUTER')
      console.log(builtMatch.src)

      const PageToRender = await import('./pages/' + builtMatch.src)
      const stream = await renderToReadableStream(<PageToRender.default />, {
        // PATH TO PAGE IN BUILD FOLDER
        bootstrapScriptContent: `globalThis.PATH_TO_PAGE = "/${builtMatch.src}";`,
        // bootstrapScriptContent: 'console.log("LOADED")',

        bootstrapModules: ['/hydrate.js'],
      })
      return new Response(stream, {
        headers: { 'Content-Type': 'text/html' }
      })
    } else {
      console.log(`REQUESTING FILE`)

      let filePath = new URL(req.url).pathname;
      console.log('FILE PATH')
      console.log(filePath)
      // let file;
      let file;

      // let file = Bun.file('../build' + filePath);
      // const fileIsPage = Object.keys(buildRouter.routes).includes(filePath.slice(0, filePath.lastIndexOf('.')))
      // if (!await file.exists() && fileIsPage || filePath === '/index.js') {
      //   console.log('GETTING PAGE FILE')
      //   file = Bun.file('../build/pages' + filePath);
      // }
      // if (!await file.exists()) {
      //   console.log('GETTING PUBLIC FILE')
      //   file = Bun.file('../public' + filePath);
      // }

      const paths = [
        // (filePath: string) => '../build/pages' + filePath,
        // (filePath: string) => '../build' + filePath,
        // (filePath: string) => '../public' + filePath,
        (filePath: string) => rootPath + 'build/pages' + filePath,
        (filePath: string) => rootPath + 'build' + filePath,
        (filePath: string) => rootPath + 'public' + filePath,
      ]
      for (let i = 0; i < paths.length; i++) {
        file = Bun.file(paths[i](filePath))
        if (await file.exists()) {
          break
        }
      }

      // console.log(`file exists?: ${!!file}`)
      if (file && !await file.exists()) {
        return new Response(`Page ${filePath} not found`, { status: 404 })
      }

      // console.log(filePath)
      return new Response(file)
    }
  }
})

console.log(`Server is running on port ${server.port}`)
