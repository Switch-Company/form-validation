# Switch - formValidation

Add custom validation and create bubbling `invalid` and `valid` events to `form` elements.

---

## Constructor

`new Validator( HTMLFormElement, Object )`

Create a new validator instance.

* `HTMLFormElement` - the form to validate
* `Object` - the validator parameters

### Parameters

The parameter `Object` contains one entry to pass custom validation rules:

* `customRules` - Array of custom validation rules

```js
  const parameters = {
    customRules: [ ... ]
  }
```

## Custom validation rules format

A custom validation rule is an object containing two entries:

* `match`: A CSS selector matching the elements that you want the validator to test
* `test`: A function that will test the element

The test function must return `true`, `false`, or a custom `ValidityState` you want to return for this test. If the return value is `false` the `ValidityState` value will be `customMismatch`. When `true` the test succeed, otherwise it fails.

```js
[
  {
    // apply maxlength tests to all inputs, not only [type=number]
    // the ValidityState value will return "tooLong" if the test fails
    match: '[data-maxlength], [maxlength]',
    test: el => {
      var length = +( el.dataset.maxlength || el.getAttribute( 'maxlength' ));
      return el.value.length <= length ? true : 'tooLong';
    }
  },
  {
    // the ValidityState value will return "customMismatch" if the test fails
    match: '[data-match]',
    test: el => {
      var shouldMatch = document.getElementById( el.dataset.match );
      return shouldMatch && shouldMatch.value === el.value;
    }
  }
]
```

## Basic use

```js
  import Validator from '@switch-company/form-validation';

  const params = {
    customRules [
      {
        match: '[data-maxlength], [maxlength]',
        test: el => {
          var length = +( el.dataset.maxlength || el.getAttribute( 'maxlength' ));
          return el.value.length <= length ? true : 'tooLong';
        }
      },
      {
        match: '[data-match]',
        test: el => {
          var shouldMatch = document.getElementById( el.dataset.match );
          return shouldMatch && shouldMatch.value === el.value;
        }
      }
    ]
  };

  const validator = new Validator( document.querySelector( 'form' ), params );

  validator.checkValidity(); // returns `true` or `false`
```

## Methods

### `.checkValidity( HTMLElement )`

Check the validity of the passed element. Defaults to the `form` element the validator was created on if no `HTMLElement` is passed.

Return `true` when valid, otherwise `false`.
```js
  const validator = new Validator( document.querySelector( 'form' ));

  validator.checkValidity(); // returns `true` or `false` depending of the `form` validity state

  validator.checkValidity( document.querySelector( 'fieldset' )); // returns `true` or `false` depending of the `fieldset` validity state

  validator.checkValidity( document.querySelector( 'input' )); // returns `true` or `false` depending of the `input` validity state
```

### `.fieldset( HTMLFieldsetElement )`

Return the validator instance of a `fieldset` contained in the `form`. This allows you to check the validity of the `fieldset`.

```js
  const validator = new Validator( document.querySelector( 'form' ));

  const fieldsetValidator = validator.fieldset( document.querySelector( 'fieldset' ));

  fieldsetValidator.checkValidity(); // returns `true` or `false`
```

## Properties

### `.invalid`

Return an `Array` of invalid fields. `.checkValidity()` must be called before or the property won't reflect the validity state of the `form`.

```js
  const validator = new Validator( document.querySelector( 'form' ));

  validator.checkValidity();

  validator.invalid; // returns an `Array` of invalid fields
```

### `.fieldsets`

Return an `Array` of validators instances created on the `fieldset`s elements contained in the `form`.

```js
  const validator = new Validator( document.querySelector( 'form' ));

  validator.fieldsets; // returns an `Array` of validators
```

## Events

Events `invalid` and `valid` are created with the `CustomEvent` constructor and set to bubble so there's no need to parse and bind every field. The current `validityState` of the field is passed in the `detail` object of the event.

### `invalid` event

An `invalid` event is dispatched to any field failing to validate.

```js
  const form = document.querySelector( 'form' );

  form.addEventListener( 'invalid' , e => {
    console.log( e.target ); // return the field

    console.log( e.detail.validityState ); // return the current validityState of the field
  });
```

### `valid` event

A `valid` event is dispatched to any field passing the validation.

```js
  const form = document.querySelector( 'form' );

  form.addEventListener( 'valid' , e => {
    console.log( e.target ); // return the field

    console.log( e.detail.validityState ); // return the current validityState of the field
  });
```
