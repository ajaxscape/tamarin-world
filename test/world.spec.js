'use strict'

const TamarinWorld = require('../lib/world')
const chai = require('chai')

chai
  .use(require('chai-things'))
  .use(require('chai-as-promised'))
  .should()

const expect = chai.expect

describe('world class', function () {
  it('can be instantiated', function () {
    const world = new TamarinWorld()
    world.setData('foo', 'bar')
    world.getData('foo').should.equal('bar')
  })

  it('can set and retrieve a driver', function () {
    const dummyDriver = () => ({
      getId: () => 'abc'
    })
    const world = new TamarinWorld(dummyDriver)
    world.getDriver((driver) => {
      driver.should.equal(dummyDriver)
      driver.getId().should.equal('abc')
    })
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
      world.getTestVal().should.equal('barfoo')
    })

    it('should be context free', function () {
      const worldA = new World()
      worldA.setTestVal('barfoo')

      const worldB = new World()
      worldB.setTestVal('foobar')

      expect(worldA.getTestVal()).to.equal('barfoo')
      expect(worldB.getTestVal()).to.equal('foobar')

      worldA.getDriver((driver) => {
        const driverA = driver
        worldB.getDriver((driver) => {
          expect(driver).to.not.equal(driverA)
        })
      })
    })
  })
})
