'use strict'

const cor = require('../lib/co-routines')
const TamarinWorld = require('../lib/world')
const chai = require('chai')
const sinon = require('sinon')

chai
  .use(require('chai-things'))
  .use(require('chai-as-promised'))
  .should()

const expect = chai.expect

describe('co-routines', function () {
  it('must have world', function () {
    expect(cor.getCoRoutines).to.throw('World must be defined')
  })
  describe('valid world', function () {
    var world
    var coRoutines
    var el

    beforeEach(function () {
      world = new TamarinWorld()
      sinon.stub(world, 'getUntil', () => ({
        elementIsEnabled: () => true,
        elementIsVisible: () => true,
        elementTextIs: () => true,
        titleIs: () => true,
        browserReady: () => true
      }))
      coRoutines = cor.getCoRoutines(world)
      el = {
        getOuterHtml: () => Promise.resolve('')
      }

    })

    it('whenVisible', function () {
      return coRoutines.whenVisible(el).should.eventually.be.equal(true)
    })
  })
})
