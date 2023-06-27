const { server } = require('./index.js');
const puppeteer = require('puppeteer');
const expect = require('expect.js');

let /** @type {puppeteer.Browser} */ browser;
let /** @type {puppeteer.Page} */ page;

describe('PhoneInput', async () => {
  before(async () => browser = await puppeteer.launch());
  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto('http://127.0.0.1:8000');
  });
  afterEach(() => page.close());
  after(() => (browser.close(), server.close()));

  const SP = String.fromCharCode(0x2002);
  const test1 = [
    [`(0${SP}${SP}) `,  2],
    [`(01${SP}) `    ,  3],
    ['(012) '        ,  6],
    ['(012) 3'       ,  7],
    ['(012) 34'      ,  8],
    ['(012) 345'     ,  9],
    ['(012) 345-6'   , 11],
    ['(012) 345-67'  , 12],
    ['(012) 345-678' , 13],
    ['(012) 345-6789', 14],
    ['(012) 345-6789', 14]
  ];

  it('forward filling', async () => {
    await page.click('#phone');
    for (let i = 0; i < test1.length; ++i) {
      const [after, caretAfter] = test1[i];
      await page.keyboard.press(i.toString()[0]);
      const value = await accessProperty('value');
      const caretPos = await accessProperty('selectionStart');
      expect(value).to.be(after);
      expect(caretPos).to.be(caretAfter);
    }
  });

  const test2 = [
    ['(123) 456-789', 0, '(234) 567-89', 1],
    ['(123) 456-789', 2, '(134) 567-89', 2],
    ['(123) 456-789', 3, '(124) 567-89', 3],
    ['(123) 456-789', 4, '(123) 567-89', 6],
    ['(123) 456-789', 5, '(123) 567-89', 6],
    ['(123) 456-789', 7, '(123) 467-89', 7],
    ['(123) 456-789', 9, '(123) 456-89', 9]
  ];

  runTest('forward deleting', test2, 'Delete');

  const test3 = [
    ['(123) 456-789',  1, '(123) 456-789', 1],
    ['(123) 456-789',  3, '(134) 567-89', 2],
    ['(123) 456-789',  5, '(124) 567-89', 3],
    ['(123) 456-789',  6, '(124) 567-89', 3],
    ['(123) 456-789',  7, '(123) 567-89', 6],
    ['(123) 456-789',  8, '(123) 467-89', 7],
    ['(123) 456-789', 10, '(123) 457-89', 8]
  ];

  runTest('backward deleting', test3, 'Backspace');

  const test4 = [
    [`(1${SP}${SP}) `, 0, `(91${SP}) `  ,  2],
    [`(1${SP}${SP}) `, 1, `(91${SP}) `  ,  2],
    ['(123) '        , 2, '(192) 3'     ,  3],
    ['(123) '        , 4, '(123) 9'     ,  7],
    ['(123) '        , 5, '(123) 9'     ,  7],
    ['(123) 456-7'   , 8, '(123) 459-67',  9],
    ['(123) 456-7'   , 9, '(123) 456-97', 11]
  ];

  runTest('replace filling', test4, '9');

  const test5 = [
    '(345) 678-9',
    '(456) 789',
    '(145) 678-9',
    '(124) 567-89',
    '(123) 567-89',
    '(123) 678-9',
    '(123) 789',
    '(123) 478-9',
    '(123) 458-9',
    '(123) 456-9'
  ];

  it('multiple deleting', async () => {
    await page.click('#phone');
    for (let i = 0; i < test5.length; ++i) {
      await accessProperty('value', '(123) 456-789');
      await accessProperty('selectionStart', i);
      await accessProperty('selectionEnd', i + 3);
      await page.keyboard.press('Backspace');
      const value = await accessProperty('value');
      expect(value).to.be(test5[i]);
    }
  });
});

/**
 * @typedef TestSet
 * @type {Array}
 * @property {string} before Input value before keypress.
 * @property {number} offset Caret position before keypress.
 * @property {string} after Input value after keypress.
 * @property {number} caretAfter Caret position after keypress.
 */

/**
 * Create and run a test set.
 * @param {string} title Name of the test.
 * @param {TestSet} testSet Array of test cases.
 * @param {string} key Key to simulate user press.
 */
function runTest(title, testSet, key) {
  it(title, async () => {
    await page.click('#phone');
    for (const [before, offset, after, caretAfter] of testSet) {
      await accessProperty('value', before);
      await accessProperty('selectionStart', offset);
      await accessProperty('selectionEnd', offset);
      await page.keyboard.press(key);
      const value = await accessProperty('value');
      const caretPos = await accessProperty('selectionStart');
      expect(value).to.be(after);
      expect(caretPos).to.be(caretAfter);
    }
  });
}

/**
 * Access a property of the input element.
 * @param {string} property Name of the property.
 * @param {any} [value] Value to set the property to.
 * @returns {Promise<any>} The property value.
 */
async function accessProperty(property, value) {
  return await page.evaluate((property, value) => {
    const input = document.querySelector('#phone');
    if (value != null) input[property] = value;
    return input[property];
  }, property, value);
}