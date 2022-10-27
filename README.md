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
* `message`: An error message to pass when the test fails (optional)

The test function must return `true`, `false`, or a custom `ValidityState` you want to return for this test. If the return value is `false` the `ValidityState` value will be `customError`. When `true` the test succeed, otherwise it fails.

```js
[
  {
    // apply maxlength tests to all inputs, not only [type=number]
    // the ValidityState value will return "tooLong" if the test fails
    match: '[data-maxlength], [maxlength]',
    message: 'Too many characters',
    test: (el) => {
      const length = parseInt( el.dataset.maxlength || el.getAttribute( 'maxlength' ), 10);
      return el.value.length <= length ? true : 'tooLong';
    }
  },
  {
    // the ValidityState value will return "customError" if the test fails
    match: '[data-match]',
    test: (el) => {
      const shouldMatch = document.getElementById( el.dataset.match );
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
        message: 'Too many characters',
        test: (el) => {
          const length = parseInt( el.dataset.maxlength || el.getAttribute( 'maxlength' ), 10);
          return el.value.length <= length ? true : 'tooLong';
        }
      },
      {
        match: '[data-match]',
        test: (el) => {
          const shouldMatch = document.getElementById( el.dataset.match );
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

### `.setValidity(Object)`

Set custom error messages on the form elements by passing an object with `[element name]: 'error message'`. Remove all custom errors by calling it without passing anything. Usually this method is used if the backend respond with some extra errors that the front-end can't or won't handle. For custom front-end errors, use custom rules by passing them when instanciating the constructor.

```js
  const form = document.querySelector( 'form' );
  const validator = new Validator( form );

  if(validator.checkValidity()){
    // post the data if front-end doesn't see any errors
    const backendResponse = await fetch('/endpoint', {
      method: 'POST',
      body: new FormData( form ),
    }).then(r => r.json());

    /*
    * errors object should look like this:
    * {
    *   'postal-code': 'Cannot deliver to this postal code'
    * }
    */

    if(backendResponse.errors){
      // trigger an invalid event to the listed form elements
      validator.setValidity(backendResponse.errors);
    }
  }
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
    console.log( e.detail.message ); // return the message set by the custom rule or the `.setValidity()` method
    console.log( e.detail.wasValid ); // return `true` if the field was valid before calling `.checkValidity()`, `false` otherwise
  });
```

### `valid` event

A `valid` event is dispatched to any field passing the validation.

```js
  const form = document.querySelector( 'form' );

  form.addEventListener( 'valid' , e => {
    console.log( e.target ); // return the field

    console.log( e.detail.validityState ); // return the current validityState of the field
    console.log( e.detail.wasInvalid ); // return `true` if the field was invalid before calling `.checkValidity()`, `false` otherwise
  });
```
