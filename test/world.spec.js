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
            resolve(el)
          }
        })),
        whenEnabled: () => Promise.resolve(el),
        whenDisabled: () => Promise.resolve(el),
        whenVisible: () => Promise.resolve(el),
        whenHidden: () => Promise.resolve(el),
        whenMatches: () => Promise.resolve(el)
      }

      World = proxyquire('../lib/world', {
        './co-routines': {
          get: () => corRoutines
        }
      })

      world = new World()

      driver = {
        sleep: () => Promise.resolve(),
        actions: () => ({
          mouseMove: () => ({
            perform: () => Promise.resolve()
          })
        }),
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

    it('waitForTitle', function () {
      sinon.spy(corRoutines, 'waitForTitle')
      return world.waitForTitle('abc')
        .then((result) => {
          corRoutines.waitForTitle.restore()
          return result.should.equal(true)
        })
        .catch((err) => {
          throw err
        })
    })

    it('waitFor success', function () {
      sinon.spy(corRoutines, 'waitFor')
      return world.waitFor('abc')
        .then((result) => {
          corRoutines.waitFor.restore()
          return result.should.equal(el)
        })
        .catch((err) => {
          throw err
        })
    })

    it('waitFor fail', function () {
      const spy = sinon.spy(driver, 'sleep')
      return world.waitFor('error', 5)
        .then(() => {
          throw new Error('Expected to fail')
        })
        .catch((err) => {
          expect(err.message).to.equal('In Error')
          driver.sleep.restore()
          return sinon.assert.callCount(spy, 5)
        })
    })

    it('whenEnabled', function () {
      sinon.spy(corRoutines, 'whenEnabled')
      return world.whenEnabled('abc')
        .then((result) => {
          corRoutines.whenEnabled.restore()
          return result.should.equal(el)
        })
        .catch((err) => {
          throw err
        })
    })

    it('whenDisabled', function () {
      sinon.spy(corRoutines, 'whenDisabled')
      return world.whenDisabled('abc')
        .then((result) => {
          corRoutines.whenDisabled.restore()
          return result.should.equal(el)
        })
        .catch((err) => {
          throw err
        })
    })

    it('whenVisible', function () {
      sinon.spy(corRoutines, 'whenVisible')
      return world.whenVisible('abc')
        .then((result) => {
          corRoutines.whenVisible.restore()
          return result.should.equal(el)
        })
        .catch((err) => {
          throw err
        })
    })

    it('whenHidden', function () {
      sinon.spy(corRoutines, 'whenHidden')
      return world.whenHidden('abc')
        .then((result) => {
          corRoutines.whenHidden.restore()
          return result.should.equal(el)
        })
        .catch((err) => {
          throw err
        })
    })

    it('whenMatches', function () {
      sinon.spy(corRoutines, 'whenMatches')
      return world.whenMatches('abc', 'xyz')
        .then((result) => {
          corRoutines.whenMatches.restore()
          return result.should.equal(el)
        })
        .catch((err) => {
          throw err
        })
    })

    it('sendKeys', function () {
      sinon.spy(corRoutines, 'waitFor')
      return world.sendKeys('abc')
        .then((result) => {
          corRoutines.waitFor.restore()
          return result.should.equal(el)
        })
        .catch((err) => {
          throw err
        })
    })

    it('hover', function () {
      sinon.spy(corRoutines, 'waitFor')
      return world.hover('abc')
        .then((result) => {
          corRoutines.waitFor.restore()
          return result.should.equal(el)
        })
        .catch((err) => {
          throw err
        })
    })

    it('click', function () {
      sinon.spy(corRoutines, 'waitFor')
      return world.click('abc')
        .then((result) => {
          corRoutines.waitFor.restore()
          return result.should.equal(el)
        })
        .catch((err) => {
          throw err
        })
    })
  })
})

