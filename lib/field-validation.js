// store invalid values for future checks
const invalidValues = new Map();

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

/**
 * check the validity of an input/select/textarea element
 * @param {HTMLElement} el - the input/select/textarea to test
 * @param {array} customValidators - array of custom validators to test against
 */
function checkValidity( el, customValidators ){
  let valid = el.validity.valid;
  const wasInvalid = invalidValues.has( el.name );
  const status = {
    validityState: 'valid',
    wasInvalid,
  };

  // get the error status if there's an error
  if( !valid ){
    const validityStates = [];

    // get all the validity states
    for( const state in el.validity ){
      if( el.validity[state] ){
        validityStates.push( state );
      }
    }

    // handle custom error set programaticaly
    if( validityStates.includes('customError') ){
      // get the previous invalid value of the input
      const previousValue = invalidValues.get(el.name);
      // only consider the customError state if the input
      // was not previously invalid or if it's value didn't change
      if( !wasInvalid || previousValue === el.value ){
        // pass the custom message to the invalid event
        status.message = el.validationMessage;
        status.validityState = 'customError';
      } else {
        // in case the value changed
        // don't consider the input being invalid
        // because this customError state is either
        // added by custom validators that are tested later in the code
        // or by setValidity method that is called by external scripts
        // and they can be called later on
        valid = true;
        // unset the customError validationMessage
        el.setCustomValidity('');
      }
    } else {
      [status.validityState] = validityStates;
    }
  }

  // custom tests if field is valid and is required
  // or is not empty and there's custom tests registered
  if( customValidators && valid && !el.disabled && ( el.required || el.value.length > 0 )) {
    // loop over custom tests
    customValidators.every( validation => {
      // if field match execute the test
      if( el.matches( validation.match )){
        const testResult = validation.test( el );

        // if testResult is falsy or a string it's an error
        if( !testResult || typeof ( testResult ) === 'string' ){
          status.validityState = testResult || 'customError';

          if( validation.message ){
            el.setCustomValidity( validation.message );

            status.message = validation.message;
          }

          return false;
        }

        return true;
      }

      return true;
    });
  }

  if( status.validityState === 'valid' ){
    invalidValues.delete( el.name );
    // trigger a valid event
    trigger( el, 'valid', status );
  }
  else {
    invalidValues.set( el.name, el.value );

    if( !status.message ){
      status.message = '';
    }

    // trigger a invalid event
    trigger( el, 'invalid', status );
  }

  return status.validityState === 'valid';
}

export default checkValidity;
