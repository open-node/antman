const net = require("net");
const readline = require("readline");

const error = (...args) => {
  console.error(...args);
  process.exit();
};

const main = async listen => {
  console.log(listen);
  const stream = net.connect(listen);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
    prompt: "Ant> ",
    removeHistoryDuplicates: true
  });

  rl.setPrompt("CEM> ");
  const log = (...args) => {
    console.log(...args);
    rl.prompt();
  };

  rl.prompt();
  rl.on("line", line => {
    stream.write(`return ${line}`);
  });

  stream.on("connect", () => {
    log("Connected.");
  });
  stream.on("end", () => {
    error("Disconnected, reconnecting now");
  });
  stream.on("data", b => {
    try {
      log(JSON.parse(b));
    } catch (e) {
      log(String(b));
    }
  });
};

process.on("uncaughtException", e => {
  error(e);
});

process.on("unhandledRejection", (reason, p) => {
  error(reason, p);
});

process.on("rejectionHandled", e => {
  error(e);
});

module.exports = main;
