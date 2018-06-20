'use strict';

const { initialize, onMessage } = require('./content_script');

describe('Content script', () => {
  const location = {
    href: 'https://www.example.com/',
    reload: jest.fn()
  };

  describe('initialize()', () => {
    it('should not inject stuff into DOM', () => {
      initialize({}, document, location);
      expect(document.documentElement.outerHTML).toMatchSnapshot();
    });

    it('should not inject stuff into DOM', () => {
      initialize({
        '01234567-89ab-cdef-0123-456789abcdef': {
          active: true,
          urlQueries: [],
          htmlContent: '<div>foo</div>',
          cssContent: '.foo { color: #000; }',
          jsContent: 'console.log("bar")'
        }
      }, document, location);
      expect(document.documentElement.outerHTML).toMatchSnapshot();
    });

    it('should inject stuff into DOM', () => {
      initialize({
        '01234567-89ab-cdef-0123-456789abcdef': {
          active: true,
          urlQueries: ['^https://www\\.example\\.com/'],
          htmlContent: '<div>foo</div>',
          cssContent: '.foo { color: #000; }',
          libs: [{ value: 'https://code.jquery.com/jquery.min.js' }],
          jsContent: 'console.log("bar")'
        },
        '01234567-89ab-cdef-0123-456789abcdf0': {
          active: false,
          urlQueries: ['^https://www\\.example\\.com/'],
          htmlContent: '<div>foo</div>',
          cssContent: '.foo { color: #000; }',
          jsContent: 'console.log("bar")'
        },
        '01234567-89ab-cdef-0123-456789abcdf1': {
          active: true,
          urlQueries: ['^https://www\\.example\\.com/'],
        },
      }, document, location);
      expect(document.documentElement.outerHTML).toMatchSnapshot();
    });
  });

  describe('onMessage()', () => {
    it('should not call location.reload()', () => {
      onMessage({}, location);
      expect(location.reload).not.toHaveBeenCalled();
    });

    it('should not call location.reload()', () => {
      onMessage({ request: 'overrideUpdated' }, location);
      expect(location.reload).not.toHaveBeenCalled();
    });

    it('should not call location.reload()', () => {
      onMessage({ urlQueries: [] }, location);
      expect(location.reload).not.toHaveBeenCalled();
    });

    it('should not call location.reload()', () => {
      onMessage({ request: 'overrideUpdated', urlQueries: [] }, location);
      expect(location.reload).not.toHaveBeenCalled();
    });

    it('should not call location.reload()', () => {
      onMessage({
        request: 'overrideUpdated',
        urlQueries: ['^https://www\\.example\\.net/']
      }, location);
      expect(location.reload).not.toHaveBeenCalled();
    });

    it('should call location.reload()', () => {
      onMessage({
        request: 'overrideUpdated',
        urlQueries: [
          '^https://www\\.example\\.net/',
          '^https://www\\.example\\.com/'
        ]
      }, location);
      expect(location.reload).toHaveBeenCalled();
    });
  });
});
