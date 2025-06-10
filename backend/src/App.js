import Server from "./api/Server.js";
import Log from "./util/Log.js";

export class App {
  async initServer(port) {
    Log.info(`App::initServer( ${port} ) - start`);

    const server = new Server(port);
    return server
      .start()
      .then(() => {
        Log.info("App::initServer() - started");
      })
      .catch((err) => {
        Log.error(`App::initServer() - ERROR: ${err.message}`);
      });
  }
}

Log.info("App - starting");
const port = 3001;
const app = new App();
(async () => {
  await app.initServer(port);
})();
