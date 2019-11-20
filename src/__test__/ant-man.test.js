const net = require("net");
const otplib = require("otplib");
const Antman = require("../../");

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

describe("antman", () => {
  describe("necessary login auth", () => {
    otplib.authenticator.check = jest.fn();
    net.createServer = jest.fn();

    const server = {
      listen: jest.fn()
    };

    const client = {
      on: jest.fn(),
      write: jest.fn()
    };

    const whoami = jest.fn();

    it("case1", async () => {
      const antman = Antman();

      net.createServer.mockReturnValueOnce(server);

      // 注册 whoami 函数上去
      antman.regist("whoami", whoami, "Who am I?");
      antman.start(9898, "hello world", { expire: 1 });

      // 检测listen是否被正常调用
      expect(server.listen.mock.calls.length).toBe(1);
      expect(server.listen.mock.calls.pop()[0]).toBe(9898);

      // 重复注册相同的key会抛出异常
      expect(() => antman.regist("whoami", whoami, "Who are you?")).toThrow(
        "exists"
      );

      // 检测服务是否被创建
      expect(net.createServer.mock.calls.length).toBe(1);

      const connect = net.createServer.mock.calls.pop()[0];

      // 客户端发起了连接
      connect(client);

      // 检测是否对 client 注册了 on data 事件
      expect(client.on.mock.calls.length).toBe(1);
      const [evt, receive] = client.on.mock.calls.pop();
      expect(evt).toBe("data");

      // 接收到需要登录的提示
      expect(client.write.mock.calls.length).toBe(1);
      expect(client.write.mock.calls.pop()[0]).toMatch("Login");

      whoami.mockReturnValueOnce("redstone");

      // 测试调用 whoami 函数
      await receive("$.whoami(2233)");
      // 检测whoami函数不应该被调用，因为还没有登录认证身份
      expect(whoami.mock.calls.length).toBe(0);
      expect(client.write.mock.calls.length).toBe(1);
      expect(client.write.mock.calls.pop()[0]).toMatch(
        "$.whoami is not a function"
      );

      otplib.authenticator.check.mockReturnValueOnce(true);
      // 开始登录
      await receive("return $('233233')");
      expect(otplib.authenticator.check.mock.calls.length).toBe(1);
      expect(otplib.authenticator.check.mock.calls.pop()).toEqual([
        "233233",
        "hello world"
      ]);

      expect(client.authed).toBe(true);

      // 检测是否已经将whoami的执行结果回传
      expect(client.write.mock.calls.length).toBe(1);
      expect(client.write.mock.calls.pop()[0]).toMatch("true");

      // 测试调用 whoami 函数, 这次可以执行了，因为前面已经登录过了
      await receive("return $.whoami(2233)");

      // 检测whoami函数应该被调用，因为前面已经登录认证身份
      expect(whoami.mock.calls.length).toBe(1);
      expect(whoami.mock.calls.pop()).toEqual([2233]);

      // 检测是否已经将whoami的执行结果回传
      expect(client.write.mock.calls.length).toBe(1);
      expect(client.write.mock.calls.pop()[0]).toMatch("redstone");

      await sleep(1200);
      // 一秒钟后会变为未登录的状态，因为设置了有效期是一秒
      expect(client.authed).toBe(false);
      // 客户端会收到登录提示
      expect(client.write.mock.calls.length).toBe(1);
      expect(client.write.mock.calls.pop()[0]).toMatch("Login");
    });

    it("case2 listen default value", async () => {
      const antman = Antman();

      net.createServer.mockReturnValueOnce(server);

      // 注册 whoami 函数上去
      antman.regist("whoami", whoami);
      antman.start(null, "hello world", { expire: 1 });

      // 检测listen是否被正常调用
      expect(server.listen.mock.calls.length).toBe(1);
      expect(server.listen.mock.calls.pop()[0]).toBe(9085);

      // 重复注册相同的key会抛出异常
      expect(() => antman.regist("whoami", whoami, "Who are you?")).toThrow(
        "exists"
      );

      // 检测服务是否被创建
      expect(net.createServer.mock.calls.length).toBe(1);

      const connect = net.createServer.mock.calls.pop()[0];

      // 客户端发起了连接
      connect(client);

      // 检测是否对 client 注册了 on data 事件
      expect(client.on.mock.calls.length).toBe(1);
      const [evt, receive] = client.on.mock.calls.pop();
      expect(evt).toBe("data");

      // 接收到需要登录的提示
      expect(client.write.mock.calls.length).toBe(1);
      expect(client.write.mock.calls.pop()[0]).toMatch("Login");

      whoami.mockReturnValueOnce("redstone");

      // 测试调用 whoami 函数
      await receive("$.whoami(2233)");
      // 检测whoami函数不应该被调用，因为还没有登录认证身份
      expect(whoami.mock.calls.length).toBe(0);
      expect(client.write.mock.calls.length).toBe(1);
      expect(client.write.mock.calls.pop()[0]).toMatch(
        "$.whoami is not a function"
      );

      otplib.authenticator.check.mockReturnValueOnce(true);
      // 开始登录
      await receive("return $('233233')");
      expect(otplib.authenticator.check.mock.calls.length).toBe(1);
      expect(otplib.authenticator.check.mock.calls.pop()).toEqual([
        "233233",
        "hello world"
      ]);

      expect(client.authed).toBe(true);

      // 检测是否已经将whoami的执行结果回传
      expect(client.write.mock.calls.length).toBe(1);
      expect(client.write.mock.calls.pop()[0]).toMatch("true");

      // 测试调用 whoami 函数, 这次可以执行了，因为前面已经登录过了
      await receive("return $.whoami(2233)");

      // 检测whoami函数应该被调用，因为前面已经登录认证身份
      expect(whoami.mock.calls.length).toBe(1);
      expect(whoami.mock.calls.pop()).toEqual([2233]);

      // 检测是否已经将whoami的执行结果回传
      expect(client.write.mock.calls.length).toBe(1);
      expect(client.write.mock.calls.pop()[0]).toMatch("redstone");

      // 检测客户端发起 help 查看
      await receive("return help");
      expect(client.write.mock.calls.length).toBe(1);
      expect(client.write.mock.calls.pop()[0]).toMatch(
        "Undefined description text"
      );

      await sleep(1200);
      // 一秒钟后会变为未登录的状态，因为设置了有效期是一秒
      expect(client.authed).toBe(false);
      // 客户端会收到登录提示
      expect(client.write.mock.calls.length).toBe(1);
      expect(client.write.mock.calls.pop()[0]).toMatch("Login");
    });
  });

  describe("unnecessary login auth", () => {
    otplib.authenticator.check = jest.fn();
    net.createServer = jest.fn();

    const server = {
      listen: jest.fn()
    };

    const client = {
      on: jest.fn(),
      write: jest.fn()
    };

    const whoami = jest.fn();

    it("case1", async () => {
      const antman = Antman();

      net.createServer.mockReturnValueOnce(server);

      // 注册 whoami 函数上去
      antman.regist("whoami", whoami, "Who am I?");
      antman.start(9898);

      // 检测listen是否被正常调用
      expect(server.listen.mock.calls.length).toBe(1);
      expect(server.listen.mock.calls.pop()[0]).toBe(9898);

      // 重复注册相同的key会抛出异常
      expect(() => antman.regist("whoami", whoami, "Who are you?")).toThrow(
        "exists"
      );

      // 检测服务是否被创建
      expect(net.createServer.mock.calls.length).toBe(1);

      const connect = net.createServer.mock.calls.pop()[0];

      // 客户端发起了连接
      connect(client);

      // 检测是否对 client 注册了 on data 事件
      expect(client.on.mock.calls.length).toBe(1);
      const [evt, receive] = client.on.mock.calls.pop();
      expect(evt).toBe("data");

      // 接收到需要登录的提示
      expect(client.write.mock.calls.length).toBe(0);

      whoami.mockReturnValueOnce("redstone");

      // 测试调用 whoami 函数
      await receive("return $.whoami(2233)");
      // 检测whoami函数应该被调用，因为不需要登录认证身份
      expect(whoami.mock.calls.length).toBe(1);
      expect(whoami.mock.calls.pop()).toEqual([2233]);

      // 检测是否已经将whoami的执行结果回传
      expect(client.write.mock.calls.length).toBe(1);
      expect(client.write.mock.calls.pop()[0]).toMatch("redstone");

      await sleep(1200);
      // 一秒钟后会变依然是登录的状态，因为不需要登录
      expect(client.authed).toBe(true);
    });
  });
});
