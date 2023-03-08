import Validator from './check-validity';

class FormValidator extends Validator{
  /**
   * Check a field validity
   * @param {HTMLElement} element - HTMLElement to check the validity from (input, textarea, select)
   */
  _checkSingleValidity( element, context ){
    // use the parent method
    const isValid = super._checkSingleValidity( element, context );
    // check if input is inside a fieldset
    const fieldset = element.closest( 'fieldset' );

    if( !fieldset ){
      return isValid;
    }

    // update the fieldset invalid array
    const fieldsetValidator = this.fieldset( fieldset );

    const invalidIndex = fieldsetValidator._invalid.indexOf( element );

    if( !isValid && invalidIndex === -1 ){
      fieldsetValidator._invalid.push( element );
    }
    else if( isValid && invalidIndex > -1 ){
      fieldsetValidator._invalid.splice( invalidIndex, 1 );
    }

    return isValid;
  }

  /**
   * Check validity
   * @param {HTMLElement} context - HTMLElement to check the validity from (input, textarea, select, form, fieldset)
   * @return {Boolean} `true` if validation passes, `false` otherwise
   */
  checkValidity( context = this.el ){
    if( context.nodeName !== 'FIELDSET' ){
      return super.checkValidity( context );
    }

    // only check the fieldset validity when a fieldset element is passed
    const fieldsetValidator = this.fieldsets.find( fieldsetValidator => {
      return fieldsetValidator.el == context;
    });

    if( fieldsetValidator ){
      return fieldsetValidator.checkValidity();
    }
  }

  /**
   * Get fieldset validators
   * @return {Array} - Array of Validators
   */
  get fieldsets(){
    return Array.from( this.el.querySelectorAll( 'fieldset' )).map( fieldset => {
      return fieldset.validator || new Validator( fieldset, {
        customRules: this._customRules
      });
    });
  }

  /**
   * Get a specific fieldset validator
   * @return {Class} - Validator
   */
  fieldset( fieldset ){
    if( this.el.contains( fieldset )){
      return fieldset.validator || new Validator( fieldset, {
        customRules: this._customRules
      });
    }
  }

  /**
   * Set custom errors
   * @param {Object} - key-value pair of element name and error message
   */
  setValidity( errors = {}){
    const elements = Array.from( this.el.elements );

    elements.forEach( element => {
      if( !element.willValidate || element.type === 'submit' ){
        return;
      }

      const validationMessage = element.validationMessage;
      const customMessage = errors[ element.name ] || '';

      element.setCustomValidity( customMessage );

      // check input validity
      // if the validation message changed
      if( validationMessage !== customMessage ){
        this._checkSingleValidity( element, this.el );
      }
    });
  }
}

export default FormValidator;
