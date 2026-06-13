const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { add, subtract, multiply, divide, isPrime, fibonacci } = require("./index.js");

describe("add", () => {
  it("两个正数相加", () => {
    assert.equal(add(1, 2), 3);
  });
  it("正负数相加", () => {
    assert.equal(add(-1, 5), 4);
  });
});

describe("subtract", () => {
  it("两个数相减", () => {
    assert.equal(subtract(10, 3), 7);
  });
  it("结果为负数", () => {
    assert.equal(subtract(3, 10), -7);
  });
});

describe("multiply", () => {
  it("两个正数相乘", () => {
    assert.equal(multiply(4, 5), 20);
  });
  it("乘零得零", () => {
    assert.equal(multiply(100, 0), 0);
  });
});

describe("divide", () => {
  it("两个数相除", () => {
    assert.equal(divide(10, 2), 5);
  });
  it("除零抛错", () => {
    assert.throws(() => divide(1, 0), /除数不能为零/);
  });
});

describe("isPrime", () => {
  it("2 是质数", () => {
    assert.equal(isPrime(2), true);
  });
  it("4 不是质数", () => {
    assert.equal(isPrime(4), false);
  });
  it("17 是质数", () => {
    assert.equal(isPrime(17), true);
  });
});

describe("fibonacci", () => {
  it("F(0) = 0", () => {
    assert.equal(fibonacci(0), 0);
  });
  it("F(1) = 1", () => {
    assert.equal(fibonacci(1), 1);
  });
  it("F(10) = 55", () => {
    assert.equal(fibonacci(10), 55);
  });
  it("负数抛错", () => {
    assert.throws(() => fibonacci(-1), /n 不能为负数/);
  });
});
