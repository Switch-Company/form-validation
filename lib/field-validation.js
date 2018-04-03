
const matches = window.Element.prototype.matches || window.Element.prototype.matchesSelector ||
  window.Element.prototype.mozMatchesSelector ||
  window.Element.prototype.msMatchesSelector ||
  window.Element.prototype.oMatchesSelector ||
  window.Element.prototype.webkitMatchesSelector;

/**
 * trigger a bubbling event
 * @param {object} el - the element to dispatch the event on
 * @param {string} evtName - name of the event to dispatch
 * @param {object} detail - data to pass in the detail's event key
 */
function trigger( el, evtName, detail ){
  const evtParams = {
    bubbles: true,
    cancelable: false
  };

  if( detail ){
    evtParams.detail = detail;
  }

  const evt = new window.CustomEvent( evtName, evtParams );

  el.dispatchEvent( evt );
}

function checkValidity( el, customValidators ){
  const valid = el.validity.valid;
  const status = {
    validityState: 'valid'
  };

  // get the error status if there's an error
  if( !valid ){
    for( const state in el.validity ){
      // skip `customError` key as it only tell that `setCustomValidity()` has been setted
      // stop when a state is found (different from valid)
      if( status.validityState === 'valid' && el.validity[ state ] && state !== 'customError' ){
        status.validityState = state;
      }
    }
  }

  // custom tests if field is valid and is required
  // or is not empty and there's custom tests registered
  if( customValidators && valid && !el.disabled && ( el.required || el.value.length > 0 )) {
    // loop over custom tests
    customValidators.every( validation => {
      // if field match execute the test
      if( matches.call( el, validation.match )){
        const testResult = validation.test( el );

        // if testResult is falsy or a string it's an error
        if( !testResult || typeof ( testResult ) === 'string' ){
          // el.validity[ testResult || 'customMismatch' ] = true;

          status.validityState = testResult || 'customMismatch';

          return false;
        }

        return true;
      }

      return true;
    });
  }

  if( status.validityState === 'valid' ){
    // trigger a valid event
    trigger( el, 'valid', status );
  }
  else {
    // trigger a invalid event
    trigger( el, 'invalid', status );
  }

  return status.validityState === 'valid';
}

export default checkValidity;
