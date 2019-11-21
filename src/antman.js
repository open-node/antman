const util = require("util");
const net = require("net");
const otplib = require("otplib");

const has = Object.hasOwnProperty;
const loginTips = "Login first, please, use $('token')";
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;

/**
 * @class
 * @return {Antman} Instance
 */
function Antman() {
  const defaultOpt = {
    expire: 15 * 60
  };

  /**
   * @module antman
   */
  const agents = {};
  const descriptions = {};

  /**
   * regist variable on agents
   * @memberof Antman
   * @instance
   * @param {string} key
   * @param {any} value
   * @param {string} [description]
   *
   * @return {void}
   */
  const regist = (key, value, description = "Undefined description text") => {
    if (has.call(agents, key)) throw Error(`key has exists, ${key}`);
    agents[key] = value;
    descriptions[key] = description;
  };

  const handler = (secret, expireMS) => client => {
    const logout = () => {
      client.authed = false;
      client.write(loginTips);
    };

    const login = token => {
      client.authed = otplib.authenticator.check(token, secret);
      if (client.authed) setTimeout(logout, expireMS);
      return client.authed;
    };

    const checkLogin = () => {
      if (secret) {
        // necessary login
        logout();
      } else {
        // unnecessary login
        client.authed = true;
      }
    };

    const receive = async b => {
      const { authed } = client;
      const fn = new AsyncFunction("$", "help", b.toString());
      try {
        const $ = authed ? agents : login;
        const help = authed ? descriptions : loginTips;
        const res = await fn($, help);
        client.write(util.formatWithOptions({ colors: true }, res));
      } catch (e) {
        client.write(util.formatWithOptions({ colors: true }, e));
      }
    };

    // initialize authed status and show tips to client
    checkLogin();

    client.on("data", receive);
  };

  /**
   * start socket server
   * @memberof Antman
   * @instance
   * @param {string} [listen=9085] listen address，port or ip+port or sock-file-path,
   * @param {string} [secret=null] OTP secret default null, unnecessary when secret be null
   * @param {object} [opt]  { expire: 900 }
   *
   * @return {void}
   */
  const start = (listen, secret, opt = defaultOpt) => {
    if (!listen) listen = 9085;
    const expireMS = Math.max(1, (opt.expire | 0) * 1000);

    const server = net.createServer(handler(secret, expireMS));
    server.listen(listen);
  };

  return { regist, start };
}

module.exports = Antman;
