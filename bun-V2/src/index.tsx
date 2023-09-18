import { renderToReadableStream } from 'react-dom/server';

// EXAMPLE: https://www.npmjs.com/package/@bun-examples/react-ssr
// [ DONE ] Figure out what the bottom half of dev.tsx from example does
// [ DONE ] Figure out how to serve JS files when a JS file is requested
// [ THIS IS THE FIX ] Consider creating a layout file, maybe thats part of what is causing issues
// [ DONE ] Try to create another page with a seperate component
// [ DONE ] Get index page working
// [ DONE ] Try to install tailwind, https://stackoverflow.com/questions/72919826/how-to-use-tailwind-with-bun
// [ DONE ] the build folder can probably be added to .gitignore
// [ DONE ] fix paths in this file so that it can be run from the root of the project
//    - [ DONE ] Might be a good idea to also create a start script in package.json
// Consider using tsconfig path aliases, make on for @root = './', @components = './src/components'
// [ DONE ] Add error handling, what if users manually naviages /thisFileDoesntExist
// [ DONE ] Get API routes working
// [ DONE ] Get all pages and apiRoutes imported when server starts, dont import them dynamically

// All paths are based on the location of this file (the file that runs the server)
const rootPath = import.meta.dir.replace('src', '');
// console.log(rootPath)

const srcRouter = new Bun.FileSystemRouter({
  dir: rootPath + 'src/pages',
  style: 'nextjs',
})
// console.log(srcRouter)
// console.log(srcRouter.routes)
// console.log(Object.values(srcRouter.routes))

// Generate css file from tailwind classes
Bun.spawn(['npx', 'tailwindcss', '-i', 'src/input.css', '-o', 'public/output.css'], {
  cwd: rootPath,
})

await Bun.build({
  entrypoints: [
    rootPath + 'src/hydrate.tsx',
    ...Object.values(srcRouter.routes),
  ],
  outdir: rootPath + 'build',
  target: 'browser',
  splitting: true,
})

const buildRouter = new Bun.FileSystemRouter({
  dir: rootPath + 'build/pages',
  style: 'nextjs',
})

const apiRouter = new Bun.FileSystemRouter({
  dir: rootPath + 'src/apiRoutes',
  style: 'nextjs',
})
// console.log(srcRouter)

const pages: { [key: string]: any } = {};
Object.keys(srcRouter.routes).forEach(async (path) => {
  pages[path] = await import(srcRouter.routes[path]);
})
const apiRoutes: { [key: string]: any } = {};
Object.keys(apiRouter.routes).forEach(async (path) => {
  apiRoutes[path] = await import(apiRouter.routes[path]);
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
    const srcMatch = srcRouter.match(req)

    // console.log("REQ URL:")
    // console.log(req.url)
    // console.log(buildRouter)
    // If request is for a page, then return page component
    // console.log(apiRouter)
    // if (apiMatch) {
    //   console.log('API ROUTE DETECTED')
    // }

    // if (builtMatch) {
    if (srcMatch && builtMatch) {
      console.log('requesting page')
      // console.log('MATCH FROM BUILT ROUTER')
      // console.log(builtMatch.src)
      // console.log(builtMatch)
      // console.log('SRC ROUTER')
      // const srcMatch = srcRouter.match(req)

      // if (!srcMatch) {
      //   return new Response('Error, no source page found')
      // }
      // console.log('PAGE MATCHES')
      // console.log(srcRouter)
      // console.log(buildRouter)
      // console.log(srcMatch)
      // console.log(builtMatch)
      // console.log(srcMatch.src)
      // console.log(builtMatch.src)

      // const PageToRender = await import('./pages/' + builtMatch.src)
      // const PageToRender = await import(srcMatch.filePath)
      // const stream = await renderToReadableStream(<PageToRender.default />, {
      //   // PATH TO PAGE IN BUILD FOLDER
      //   // bootstrapScriptContent: `globalThis.PATH_TO_PAGE = "/${builtMatch.src}";`,
      //   bootstrapScriptContent: `globalThis.PATH_TO_PAGE = "/${builtMatch.src}";`,
      //   // bootstrapScriptContent: 'console.log("LOADED")',

      //   bootstrapModules: ['/hydrate.js'],
      // })

      // const PageToRender = pages[builtMatch.pathname]
      // // console.log(typeof PageToRender)
      // console.log(PageToRender)
      // const stream = await renderToReadableStream(<PageToRender.default />, {
      const stream = await renderToReadableStream(pages[builtMatch.pathname].default(), {
        bootstrapScriptContent: `globalThis.PATH_TO_PAGE = "/${builtMatch.src}";`,
        bootstrapModules: ['/hydrate.js'],
      });
      // return new Response(stream, {
      //   headers: { 'Content-Type': 'text/html' }
      // })
      return new Response(stream);
    } else if (apiMatch) {
      // Import script based in apiMatch, just like for builtMatch
      // Use req.method to select the correct function from the file
      // console.log(apiMatch);
      // console.log(apiRoutes)
      // const apiRoute = await import('./apiRoutes/' + apiMatch.src)
      // const apiRoute = await import(apiMatch.filePath)
      // return apiRoute[req.method](req);

      return apiRoutes[apiMatch.pathname][req.method](req)
    } else {
      console.log(`REQUESTING FILE`)

      let filePath = new URL(req.url).pathname;
      console.log('FILE PATH')
      console.log(filePath)
      // Maybe rename to 'res'
      let file;

      const paths = [
        (filePath: string) => rootPath + 'build/pages' + filePath,
        (filePath: string) => rootPath + 'build' + filePath,
        (filePath: string) => rootPath + 'public' + filePath,
      ];
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
