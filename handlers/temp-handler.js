const { readdirSync } = require("fs");

module.exports = (client) => {
  const load = dirs => {
    const events = readdirSync(`./events/${dirs}/`).filter(d => d.endsWith("js") );
    for (let file of events) {
      let evt = require(`../events/${dirs}/${file}`);
      let eName = file.split('.')[0];
      client.temp.on(eName, evt.bind(null, client));
    }
  };
  ["client", "guild", "temp"].forEach((x) => load(x));
};