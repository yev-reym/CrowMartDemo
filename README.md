# CrowMartDemo

---

## Instructions to run:

1.  Run command `npm install` to generate node_modules.

2.  Transpile .ts files to .js by running `npm run build` from the root directory.

3.  Start development server by running `npm start` in the root as well.

4.  Navigate to `http://localhost:8080/index.html` and you will arrive at the homepage of the CrowMartDemo

## About the system:

- IndexedDB API to make persistent local storage in the client
- No bundling tool, ES6 js is run straight from the html files as a module
- The site should send an alert when the remarketing score reaches a certain threshold. This may take a bit of clicking around.
