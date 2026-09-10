
const fs = require('fs');

// Mock browser environment
global.window = global;
global.document = {
  getElementById: (id) => {
    return {
      id,
      value: id === 'reg-name' ? 'Budi Santoso' : id === 'reg-email' ? 'budi@test.com' : 'pass123',
      classList: {
        add: (cls) => console.log('classList.add on ' + id + ':', cls),
        remove: (cls) => console.log('classList.remove on ' + id + ':', cls),
        toggle: () => {},
        contains: () => false
      },
      style: {},
      addEventListener: () => {},
      querySelectorAll: () => [],
      querySelector: () => null
    };
  },
  querySelectorAll: () => [],
  querySelector: () => null,
  body: { classList: { remove: () => {}, add: () => {} } },
  addEventListener: () => {}
};
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

console.log('Test harness initialized');
