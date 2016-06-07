'use strict'

const tamarinUntil = require('../lib/until')
const _ = require('lodash')
const chai = require('chai')

chai
  .use(require('chai-things'))
  .use(require('chai-as-promised'))
  .should()

const expect = chai.expect

describe('until', function () {
  it('can be extended', function () {
    const world = {
      id: 'foo'
    }
    const originalUntil = {
      id: 'bar'
    }
    const until = tamarinUntil(world, originalUntil)
    until.id.should.equal(originalUntil.id)
    expect(_.isFunction(until.notFoundInPage)).to.equal(true)
    expect(_.isFunction(until.titleIs)).to.equal(true)
    expect(_.isFunction(until.browserReady)).to.equal(true)
  })

  describe('world', function () {
    const world = {
      getDriver: function () {
        return {
          findElement: () => Promise.resolve(true)
        }
      }
    }

    it('foundInPage', function () {
      const until = tamarinUntil(world)
      expect(_.isFunction(until.foundInPage)).to.equal(true)
      let condition = until.foundInPage('body')
      expect(condition.fn()).to.equal(true)
    })
  })
})
