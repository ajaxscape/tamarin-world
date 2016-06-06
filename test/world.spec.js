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
    const driver = {
      getId: () => 'abc'
    }
    const world = new TamarinWorld(driver)
    world.getDriver().should.equal(driver)
    world.getDriver().getId().should.equal('abc')
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
      const world = new World()
      expect(world.getTestVal()).to.equal(undefined)
    })
  })
})
