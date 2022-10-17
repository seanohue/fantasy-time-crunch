const chai = require('chai');
const { expect } = chai;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const { link } = require('../lib/link');

chai.use(sinonChai);

describe('lib/link.js', () => {
  describe('functionality:', () => {
    it('should return an object with input, system, errors, and time properties', () => {
      const output = link({ input: [], errors: [], system: {} });
      expect(output).to.have.property('input');
      expect(output).to.have.property('system');
      expect(output).to.have.property('errors');
      expect(output).to.have.property('time');
      expect(output.input).to.be.an('array');
      expect(output.system).to.be.an('object');
      expect(output.system).to.have.property('units');
      expect(output.errors).to.be.an('array');
      expect(output.time).to.be.an('object');
    });
  });

  describe('errors:', () => {
    it('should throw if arguments are incorrect:', () => {
      const args = [
        ,
        undefined,
        null,
        true,
        '',
        0,
        () => {},
        new Set(),
        new Map(),
        Symbol(),
      ];
      args.forEach((arg) => {
        expect(() => link(arg)).to.throw();
      });
    });
  });
});
