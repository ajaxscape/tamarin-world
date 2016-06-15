'use strict'

const cor = require('../lib/co-routines')
const TamarinWorld = require('../lib/world').World
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

  it('must have a valid timeout', function () {
    const world = new TamarinWorld()
    expect(() => cor.getCoRoutines(world, 'abc')).to.throw('Default Timeout must be a number')
  })

  describe('valid world', function () {
    let world
    let coRoutines
    let el
    let html = '<h1>Hello</h1>'

    let resolves = (world) => sinon.stub(world, 'getUntil').returns({
      elementIsEnabled: () => Promise.resolve(true),
      elementIsVisible: () => Promise.resolve(true),
      elementIsNotVisible: () => Promise.resolve(true),
      elementTextIs: () => Promise.resolve(true),
      titleIs: () => Promise.resolve(true),
      browserReady: () => Promise.resolve(true)
    })

    let rejects = (world) => sinon.stub(world, 'getUntil').returns({
      elementIsEnabled: () => Promise.reject({message: 'Not Enabled'}),
      elementIsVisible: () => Promise.reject({message: 'Not Visible'}),
      elementIsNotVisible: () => Promise.reject({message: 'Is Visible'}),
      elementTextIs: () => Promise.reject({message: 'Not Matching Text'}),
      titleIs: () => Promise.reject({message: 'Not Matching Title'}),
      browserReady: () => Promise.reject({message: 'Not Ready'})
    })

    beforeEach(function () {
      world = new TamarinWorld()
      el = {
        getOuterHtml: () => Promise.resolve(html)
      }
    })

    afterEach(function () {
      world.getUntil.restore()
    })

    describe('resolved', function () {
      beforeEach(function () {
        resolves(world)
        coRoutines = cor.getCoRoutines(world, 100)
      })

      it('whenVisible', function () {
        return coRoutines.whenVisible(el).should.eventually.be.equal(el)
      })

      it('whenHidden', function () {
        return coRoutines.whenHidden(el).should.eventually.be.equal(el)
      })

      it('whenMatches', function () {
        return coRoutines.whenMatches(el).should.eventually.be.equal(el)
      })

      it('whenTitleIs', function () {
        return coRoutines.whenTitleIs('title').should.eventually.be.equal(true)
      })

      it('whenBrowserReady', function () {
        return coRoutines.whenBrowserReady().should.eventually.be.equal('about:blank')
      })
    })

    describe('rejected', function () {
      beforeEach(function () {
        rejects(world)
        coRoutines = cor.getCoRoutines(world)
      })

      it('whenVisible', function () {
        return coRoutines.whenVisible(el)
          .catch((err) => {
            expect(err.message).to.contain('Not Enabled')
            expect(err.message).to.contain(html)
          })
      })

      it('whenHidden', function () {
        return coRoutines.whenHidden(el)
          .catch((err) => {
            expect(err.message).to.contain('Is Visible')
            expect(err.message).to.contain(html)
          })
      })

      it('whenMatches', function () {
        return coRoutines.whenMatches(el)
          .catch((err) => {
            expect(err.message).to.contain('Not Matching Text')
            expect(err.message).to.contain(html)
          })
      })

      it('whenTitleIs', function () {
        return coRoutines.whenTitleIs(el)
          .catch((err) => {
            expect(err.message).to.contain('Not Matching Title')
          })
      })

      it('whenBrowserReady', function () {
        return coRoutines.whenBrowserReady()
          .catch((err) => {
            expect(err.message).to.contain('Not Ready')
          })
      })
    })
  })
})
