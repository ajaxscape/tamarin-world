'use strict'

const TamarinWorld = require('../index')

  require('chai')
    .use(require('chai-things'))
    .use(require('chai-as-promised'))
    .should()

 const expect = (require('chai').expect)

describe('world class', function () {
  it('can be instantiated', function () {
    const world = new TamarinWorld()
    world.setData('foo', 'bar')
    world.getData('foo').should.equal('bar')
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

    it('worlds should be context free', function () {
      const world = new World()
      let val = world.getTestVal()

    })
  })
})