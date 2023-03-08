/**
 * @switch-company/form-validation - Extend checkvalidity of forms and trigger invalid and valid events on fields
 * @version v2.1.0
 * @link https://www.npmjs.com/package/@switch-company/form-validation
 * @license ISC
 **/

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.formValidation = factory());
}(this, (function () { 'use strict';

  // store invalid values for future checks
  var invalidValues = new Map();

  /**
   * trigger a bubbling event
   * @param {object} el - the element to dispatch the event on
   * @param {string} evtName - name of the event to dispatch
   * @param {object} detail - data to pass in the detail's event key
   */
  function trigger(el, evtName, detail) {
    var evtParams = {
      bubbles: true,
      cancelable: false
    };

    if (detail) {
      evtParams.detail = detail;
    }

    var evt = new window.CustomEvent(evtName, evtParams);

    el.dispatchEvent(evt);
  }

  /**
   * check the validity of an input/select/textarea element
   * @param {HTMLElement} el - the input/select/textarea to test
   * @param {HTMLElement} context - the root element the validation was called from
   * @param {array} customValidators - array of custom validators to test against
   */
  function checkValidity(el, context, customValidators) {
    var valid = el.validity.valid;
    var wasInvalid = invalidValues.has(el.name);
    var status = {
      context: context,
      validityState: 'valid',
      wasInvalid: wasInvalid
    };

    // get the error status if there's an error
    if (!valid) {
      var validityStates = [];

      // get all the validity states
      for (var state in el.validity) {
        if (el.validity[state]) {
          validityStates.push(state);
        }
      }

      // handle custom error set programaticaly
      if (validityStates.includes('customError')) {
        // get the previous invalid value of the input
        var previousValue = invalidValues.get(el.name);

        // only consider the customError state if the input
        // was not previously invalid or if it's value didn't change
        if (!wasInvalid || previousValue === el.value) {
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
        status.validityState = validityStates[0];
      }
    }

    // custom tests if field is valid and is required
    // or is not empty and there's custom tests registered
    if (customValidators && valid && !el.disabled && (el.required || el.value.length > 0)) {
      // loop over custom tests
      customValidators.every(function (validation) {
        // if field match execute the test
        if (el.matches(validation.match)) {
          var testResult = validation.test(el);

          // if testResult is falsy or a string it's an error
          if (!testResult || typeof testResult === 'string') {
            status.validityState = testResult || 'customError';

            if (validation.message) {
              el.setCustomValidity(validation.message);

              status.message = validation.message;
            }

            return false;
          }

          return true;
        }

        return true;
      });
    }

    if (status.validityState === 'valid') {
      invalidValues.delete(el.name);
      // trigger a valid event
      trigger(el, 'valid', status);
    } else {
      invalidValues.set(el.name, el.value);

      if (!status.message) {
        status.message = '';
      }

      // trigger a invalid event
      trigger(el, 'invalid', status);
    }

    return status.validityState === 'valid';
  }

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var get = function get(object, property, receiver) {
    if (object === null) object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent === null) {
        return undefined;
      } else {
        return get(parent, property, receiver);
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;

      if (getter === undefined) {
        return undefined;
      }

      return getter.call(receiver);
    }
  };

  var inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  var possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };

  var Validator = function () {
    function Validator(el) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      classCallCheck(this, Validator);

      this.el = el;
      this.el.validator = this;

      this._invalid = [];
      this._customRules = params.customRules || [];
      this._fieldValidation = checkValidity.bind(this);
    }

    createClass(Validator, [{
      key: '_checkSingleValidity',
      value: function _checkSingleValidity(element, context) {
        var isValid = this._fieldValidation(element, context, this._customRules);
        var invalidIndex = this._invalid.indexOf(element);

        if (!isValid && invalidIndex === -1) {
          this._invalid.push(element);
        } else if (isValid && invalidIndex > -1) {
          this._invalid.splice(invalidIndex, 1);
        }

        return isValid;
      }
    }, {
      key: 'checkValidity',
      value: function checkValidity$$1() {
        var _this = this;

        var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.el;

        // IE doesn't have an elements property on fieldsets
        if (!context.elements && context.nodeName !== 'FIELDSET') {
          return this._checkSingleValidity(context, context);
        }

        this._invalid.length = 0;

        var elements = Array.from(context.elements || context.querySelectorAll('input, textarea, select'));

        elements.forEach(function (element) {
          if (!element.willValidate || element.type === 'submit') {
            return;
          }

          _this._checkSingleValidity(element, context);
        });

        return this._invalid.length === 0;
      }
    }, {
      key: 'invalid',
      get: function get$$1() {
        return this._invalid;
      }
    }]);
    return Validator;
  }();

  var FormValidator = function (_Validator) {
    inherits(FormValidator, _Validator);

    function FormValidator() {
      classCallCheck(this, FormValidator);
      return possibleConstructorReturn(this, (FormValidator.__proto__ || Object.getPrototypeOf(FormValidator)).apply(this, arguments));
    }

    createClass(FormValidator, [{
      key: '_checkSingleValidity',

      /**
       * Check a field validity
       * @param {HTMLElement} element - HTMLElement to check the validity from (input, textarea, select)
       */
      value: function _checkSingleValidity(element, context) {
        // use the parent method
        var isValid = get(FormValidator.prototype.__proto__ || Object.getPrototypeOf(FormValidator.prototype), '_checkSingleValidity', this).call(this, element, context);
        // check if input is inside a fieldset
        var fieldset = element.closest('fieldset');

        if (!fieldset) {
          return isValid;
        }

        // update the fieldset invalid array
        var fieldsetValidator = this.fieldset(fieldset);

        var invalidIndex = fieldsetValidator._invalid.indexOf(element);

        if (!isValid && invalidIndex === -1) {
          fieldsetValidator._invalid.push(element);
        } else if (isValid && invalidIndex > -1) {
          fieldsetValidator._invalid.splice(invalidIndex, 1);
        }

        return isValid;
      }

      /**
       * Check validity
       * @param {HTMLElement} context - HTMLElement to check the validity from (input, textarea, select, form, fieldset)
       * @return {Boolean} `true` if validation passes, `false` otherwise
       */

    }, {
      key: 'checkValidity',
      value: function checkValidity() {
        var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.el;

        if (context.nodeName !== 'FIELDSET') {
          return get(FormValidator.prototype.__proto__ || Object.getPrototypeOf(FormValidator.prototype), 'checkValidity', this).call(this, context);
        }

        // only check the fieldset validity when a fieldset element is passed
        var fieldsetValidator = this.fieldsets.find(function (fieldsetValidator) {
          return fieldsetValidator.el == context;
        });

        if (fieldsetValidator) {
          return fieldsetValidator.checkValidity();
        }
      }

      /**
       * Get fieldset validators
       * @return {Array} - Array of Validators
       */

    }, {
      key: 'fieldset',


      /**
       * Get a specific fieldset validator
       * @return {Class} - Validator
       */
      value: function fieldset(_fieldset) {
        if (this.el.contains(_fieldset)) {
          return _fieldset.validator || new Validator(_fieldset, {
            customRules: this._customRules
          });
        }
      }

      /**
       * Set custom errors
       * @param {Object} - key-value pair of element name and error message
       */

    }, {
      key: 'setValidity',
      value: function setValidity() {
        var _this2 = this;

        var errors = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var elements = Array.from(this.el.elements);

        elements.forEach(function (element) {
          if (!element.willValidate || element.type === 'submit') {
            return;
          }

          var validationMessage = element.validationMessage;
          var customMessage = errors[element.name] || '';

          element.setCustomValidity(customMessage);

          // check input validity
          // if the validation message changed
          if (validationMessage !== customMessage) {
            _this2._checkSingleValidity(element, _this2.el);
          }
        });
      }
    }, {
      key: 'fieldsets',
      get: function get$$1() {
        var _this3 = this;

        return Array.from(this.el.querySelectorAll('fieldset')).map(function (fieldset) {
          return fieldset.validator || new Validator(fieldset, {
            customRules: _this3._customRules
          });
        });
      }
    }]);
    return FormValidator;
  }(Validator);

  return FormValidator;

})));
