import fieldValidation from './field-validation';

class Validator{
  constructor( el, params = {}){
    this.el = el;
    this.el.validator = this;

    this._invalid = [];
    this._customRules = params.customRules || [];
    this._fieldValidation = fieldValidation.bind( this );
  }

  _checkSingleValidity( element ){
    const isValid = this._fieldValidation( element, this._customRules );
    const invalidIndex = this._invalid.indexOf( element );

    if( !isValid && invalidIndex === -1 ){
      this._invalid.push( element );
    }
    else if( isValid && invalidIndex > -1 ){
      this._invalid.splice( invalidIndex, 1 );
    }

    return isValid;
  }

  get invalid(){
    return this._invalid;
  }

  checkValidity( context = this.el ){
    // IE doesn't have an elements property on fieldsets
    if( !context.elements && context.nodeName !== 'FIELDSET' ){
      return this._checkSingleValidity( context );
    }

    this._invalid.length = 0;

    const elements = Array.from( context.elements || context.querySelectorAll( 'input, textarea, select' ));

    elements.forEach( element => {
      if( !element.willValidate || element.type === 'submit' ){
        return;
      }

      this._checkSingleValidity( element );
    });

    return this._invalid.length === 0;
  }
}

export default Validator;
