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
// [ DONE ] Get API routes working
// Get all pages and apiRoutes imported when server starts, dont import them dynamically

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

console.log(srcRouter.routes)
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

const apiRouter = new Bun.FileSystemRouter({
  dir: rootPath + 'src/apiRoutes',
  // dir: rootPath + 'src/apiRoutes/api',
  style: 'nextjs',
  // origin: 'api',
  // assetPrefix: 'api/'
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
    const apiMatch = apiRouter.match(req)

    // console.log("REQ URL:")
    // console.log(req.url)
    // console.log(buildRouter)
    // If request is for a page, then return page component
    // console.log(apiRouter)
    // if (apiMatch) {
    //   console.log('API ROUTE DETECTED')
    // }

    if (builtMatch) {
      console.log('MATCH FROM BUILT ROUTER')
      console.log(builtMatch.src)
      console.log(builtMatch)

      const PageToRender = await import('./pages/' + builtMatch.src)
      // const PageToRender = await import(builtMatch.filePath)
      const stream = await renderToReadableStream(<PageToRender.default />, {
        // PATH TO PAGE IN BUILD FOLDER
        bootstrapScriptContent: `globalThis.PATH_TO_PAGE = "/${builtMatch.src}";`,
        // bootstrapScriptContent: 'console.log("LOADED")',

        bootstrapModules: ['/hydrate.js'],
      })
      return new Response(stream, {
        headers: { 'Content-Type': 'text/html' }
      })
    } else if (apiMatch) {
      // Import script based in apiMatch, just like for builtMatch
      // Use req.method to select the correct function from the file
      console.log(apiMatch);
      // const apiRoute = await import('./apiRoutes/' + apiMatch.src)
      const apiRoute = await import(apiMatch.filePath)
      return apiRoute[req.method](req);
      // const res = apiRoute[req.method](req);
      // return res
    } else {
      console.log(`REQUESTING FILE`)

      let filePath = new URL(req.url).pathname;
      console.log('FILE PATH')
      console.log(filePath)
      // Maybe rename to 'res'
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
        // API ROUTE?
        // console.log(req.method)
        // console.log(filePath)
        // const apiRoutes = {
        //   'verify': {
        //     'GET': (req: any) => 'response'
        //   }
        // }
        // let apiRes;
        // if (filePath === '/api/verify') {
        //   apiRes = 'hello from api route'
        // } 
        // // If its not an api route, its an error
        // if (!apiRes) {
        //   apiRes = `Page ${filePath} not found`, { status: 404 }
        // }
        // return new Response(apiRes)

        return new Response(`Page ${filePath} not found`, { status: 404 })
      }

      // console.log(filePath)
      return new Response(file)
    }
  }
})

console.log(`Server is running on port ${server.port}`)
