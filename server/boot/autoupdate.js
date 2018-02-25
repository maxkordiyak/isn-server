module.exports = function (server) {
  server.dataSources.mongodb.autoupdate();
  console.log("Performed autoupdate.");
}
