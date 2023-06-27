const SPACE = String.fromCharCode(0x2002);

const input = document.querySelector('#phone');

let prevCaretPos;

input.addEventListener('keypress', e => {
  const keyCode = e.key.charCodeAt(0);
  const isNumber =  keyCode >= 48 && keyCode <= 57;
  const hasValidLength = e.target.value.length <= 13;
  !(isNumber && hasValidLength) && e.preventDefault();
});

input.addEventListener('beforeinput', function() {
  prevCaretPos = this.selectionStart;
  if (prevCaretPos !== this.selectionEnd) prevCaretPos = -1;
});

input.addEventListener('input', function() {
  let caretPos = this.selectionStart;
  let digits = this.value.replace(/\D/g, '');
  if (!digits.length) return this.value = '';

  // Jump over special character (.
  if (prevCaretPos === 0 && caretPos === 1) ++caretPos
  // Skip deleting backward special character (.
  if (prevCaretPos === 1 && caretPos === 0) ++caretPos
  // Skip deleting forward special character (.
  if (prevCaretPos === 0 && caretPos === 0) {
    console.log('hey');
    digits = digits.slice(1)
    ++caretPos
  }

  // Skip deleting special characters ) and \s.
  if (prevCaretPos === 3 && caretPos === 4) caretPos = 6

  // Jump over special character \s.
  if ([5, 6].includes(caretPos) && caretPos - prevCaretPos === 1) {
    caretPos = 7
  }

  if ([4, 5].includes(caretPos)) {
    // Skip deleting backward special characters ) and \s.
    if (caretPos < prevCaretPos) {
      digits = digits.slice(0, 2) + digits.slice(3)
      caretPos = 3
    }
    // Skip deleting forward special characters ) and \s.
    if (caretPos === prevCaretPos) {
      digits = digits.slice(0, 3) + digits.slice(4)
      caretPos = 6
    }
  }

  // Skip deleting forward special character -.
  if (prevCaretPos === 9 && caretPos === 9) {
    digits = digits.slice(0, 6) + digits.slice(7)
  }
  // Skip deleting backward special character -.
  if (prevCaretPos === 10 && caretPos === 9) {
    digits = digits.slice(0, 5) + digits.slice(6)
    caretPos = 8
  }
  // Jump over special character -.
  if (caretPos === 10 && prevCaretPos < caretPos) ++caretPos
    
  const areaCode = digits.slice(0, 3).padEnd(3, SPACE);
  const prefix = digits.slice(3, 6);
  const suffix = digits.slice(6, 10);
  const link = digits.length < 7 ? '' : '-';
  this.value = `(${areaCode}) ${prefix}${link}${suffix}`;
  setCaretPosition(this, caretPos);
});

/**
 * Set caret position in the input element.
 * @param {HTMLInputElement} element 
 * @param {number} caretPos 
 */
function setCaretPosition(element, caretPos) {
  element.setSelectionRange(caretPos, caretPos);
}