'use strict'

const webDriver = require('selenium-webdriver')
const TamarinWorld = require('../lib/world')
const _ = require('lodash')
const chai = require('chai')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

require('events').EventEmitter.defaultMaxListeners = Infinity

chai
  .use(require('chai-things'))
  .use(require('chai-as-promised'))
  .should()

const expect = chai.expect

describe('world class', function () {
  it('can be instantiated', function () {
    const world = new TamarinWorld()
    world.setData('foo', 'bar')
    return world.getData('foo').should.eventually.equal('bar')
  })

  it('can set and retrieve a driver', function () {
    const phantomjs = webDriver.Capabilities.phantomjs()
    phantomjs.set('phantomjs.binary.path', require('phantomjs-prebuilt').path)
    const dummyDriver = new webDriver.Builder()
      .withCapabilities(phantomjs)
      .build()
    const world = new TamarinWorld(dummyDriver)
    return world.getDriver()
      .then((driver) => {
        driver.should.equal(dummyDriver)
        _.isFunction(driver.findElement).should.equal(true)
      })
  })

  it('can retrieve default driver', function () {
    new TamarinWorld().getDriver()
      .then((driver) => {
        _.isFunction(driver.findElement).should.equal(true)
      })
  })

  it('can set and retrieve the until module', function () {
    const dummyUntil = {
      getId: () => 'abc'
    }
    const world = new TamarinWorld(null, dummyUntil)
    const until = world.getUntil()
    until.should.equal(dummyUntil)
    until.getId().should.equal('abc')
  })

  describe('can be extended', function () {
    class World extends TamarinWorld {
      setTestVal (val) {
        this.setData('test', val)
      }

      getTestVal () {
        return this.getData('test')
      }
    }

    it('can be extended', function () {
      const world = new World()
      world.setTestVal('barfoo')
      return world.getTestVal().should.eventually.equal('barfoo')
    })

    it('should be context free', function () {
      const worldA = new World()
      worldA.setTestVal('barfoo')

      const worldB = new World()
      worldB.setTestVal('foobar')

      expect(worldA.getTestVal()).to.eventually.equal('barfoo')
      expect(worldB.getTestVal()).to.eventually.equal('foobar')
    })
  })

  describe('method', function () {
    let World, world, driver, el, corRoutines

    beforeEach(function () {
      el = {
        sendKeys: () => Promise.resolve(el),
        hover: () => Promise.resolve(el),
        click: () => Promise.resolve(el)
      }
      corRoutines = {
        waitForTitle: () => Promise.resolve(true),
        waitFor: (selector) => (new Promise((resolve) => {
          if (selector === 'error') {
            throw new Error('In Error')
          } else {
            resolve(true)
          }
        })),
        whenEnabled: () => Promise.resolve(true),
        whenDisabled: () => Promise.resolve(true),
        whenVisible: () => Promise.resolve(true),
        whenHidden: () => Promise.resolve(true),
        whenMatches: () => Promise.resolve(true)
      }

      World = proxyquire('../lib/world', {
        './co-routines': {
          get: () => corRoutines
        }
      })

      world = new World()

      driver = {
        sleep: () => Promise.resolve(),
        get: () => Promise.resolve(),
        wait: (fn) => fn
      }

      sinon.stub(world, 'getDriver').returns({then: (fn) => fn(driver)})
    })

    afterEach(function () {
      world.getDriver.restore()
    })

    it('sleep', function () {
      const spy = sinon.spy(driver, 'sleep')
      world.sleep(10)
      sinon.assert.calledWith(spy, 10)
      driver.sleep.restore()
    })

    it('visit', function () {
      const spy = sinon.spy(driver, 'get')
      world.visit('abc')
      sinon.assert.calledWith(spy, 'abc')
      driver.get.restore()
    })

    it('waitForTitle', function (done) {
      sinon.spy(corRoutines, 'waitForTitle')
      world.waitForTitle('abc')
        .then((result) => {
          result.should.equal(true)
          corRoutines.waitForTitle.restore()
          done()
        })
    })

    it('waitFor success', function (done) {
      sinon.spy(corRoutines, 'waitFor')
      world.waitFor('abc')
        .then((result) => {
          result.should.equal(true)
          corRoutines.waitFor.restore()
          done()
        })
    })

    it('waitFor fail', function (done) {
      const spy = sinon.spy(driver, 'sleep')
      world.waitFor('error', 5)
        .catch((err) => {
          expect(err.message).to.equal('In Error')
          sinon.assert.callCount(spy, 5)
          driver.sleep.restore()
          done()
        })
    })

    it('whenEnabled', function (done) {
      sinon.spy(corRoutines, 'whenEnabled')
      world.whenEnabled('abc')
        .then((result) => {
          result.should.equal(true)
          corRoutines.whenEnabled.restore()
          done()
        })
    })

    it('whenDisabled', function (done) {
      sinon.spy(corRoutines, 'whenDisabled')
      world.whenDisabled('abc')
        .then((result) => {
          result.should.equal(true)
          corRoutines.whenDisabled.restore()
          done()
        })
    })

    it('whenVisible', function (done) {
      sinon.spy(corRoutines, 'whenVisible')
      world.whenVisible('abc')
        .then((result) => {
          result.should.equal(true)
          corRoutines.whenVisible.restore()
          done()
        })
    })

    it('whenHidden', function (done) {
      sinon.spy(corRoutines, 'whenHidden')
      world.whenHidden('abc')
        .then((result) => {
          result.should.equal(true)
          corRoutines.whenHidden.restore()
          done()
        })
    })

    it('whenMatches', function (done) {
      sinon.spy(corRoutines, 'whenMatches')
      world.whenMatches('abc', 'xyz')
        .then((result) => {
          result.should.equal(true)
          corRoutines.whenMatches.restore()
          done()
        })
    })

    it('sendKeys', function (done) {
      sinon.spy(corRoutines, 'waitFor')
      world.sendKeys('abc')
        .then((result) => {
          result.should.equal(true)
          corRoutines.waitFor.restore()
          done()
        })
    })

    it('hover', function (done) {
      sinon.spy(corRoutines, 'waitFor')
      world.hover('abc')
        .then((result) => {
          result.should.equal(true)
          corRoutines.waitFor.restore()
          done()
        })
    })

    it('click', function (done) {
      sinon.spy(corRoutines, 'waitFor')
      world.click('abc')
        .then((result) => {
          result.should.equal(true)
          corRoutines.waitFor.restore()
          done()
        })
    })
  })
})

