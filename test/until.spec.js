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

  describe('condition', function () {
    let found

    const world = {
      getDriver: function () {
        return {
          findElement: () => found ? Promise.resolve() : Promise.reject()
        }
      }
    }

    const until = tamarinUntil(world)

    describe('foundInPage', function () {
      const foundInPage = until.foundInPage().fn

      it('resolved', function () {
        found = true
        return foundInPage().should.eventually.equal(true)
      })

      it('rejected', function () {
        found = false
        return foundInPage().should.eventually.equal(false)
      })
    })

    describe('notFoundInPage', function () {
      const notFoundInPage = until.notFoundInPage().fn

      it('resolved', function () {
        found = false
        return notFoundInPage().should.eventually.equal(true)
      })

      it('rejected', function () {
        found = true
        return notFoundInPage().should.eventually.equal(false)
      })
    })
  })
})
