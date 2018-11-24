# Bifrost Form

Bifrost Form provides a bridge between React and complex dynamic forms. Typically, when creating a dynamic form in 
react, there is a non-trivial amount of boiler plate needed for each input field. Additionally, on submission, the 
field values generally need to be collected and re-validated which takes considerable lifting of state and planning. 
The goal of this library is to handle as much as possible for you, so you can stick to defining the structure of the 
form.

## Simple Text Field

Let's consider the task of defining a new managed field that has no knowledge of the rest of the form. You may end up 
with something like the example below after considering accessibility and field validation. Keep in mind that the below 
example does not allow validation across many fields and is not lifting its value, validation, or error state to the 
form. 

```jsx harmony
import React from 'react'

class TextInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: "",
            focus: false,
            error: undefined,
        }
    }
    
    render() {
        let { name, label, ...ptProps } = this.props;
        if (ptProps['aria-describedby']) delete ptProps['aria-describedby'];
        if (ptProps['aria-invalid']) delete ptProps['aria-invalid'];
        const invalid = typeof this.state.error !== 'undefined';
        const errorId = name + "_error";
        const inputProps = Object.assign({}, ptProps, {
            type: "text",
            name: name,
            value: this.state.value,
            "aria-invalid": invalid,
            "aria-describedby": errorId,
            onChange: this.handleChange,
            onBlur: this.handleBlur,
            onFocus: this.handleFocus,
        });
        
        return (
            <div className="field-container">
                <label htmlFor={name}>{label}</label>
                <input {...inputProps}/>
                <span id={errorId} role="alert">{this.state.error || ''}</span>
            </div>
        );
    }
    
    handleValidate = (value) => {
        let validators = this.props.onValidate;
        switch (true) {
            case typeof validators === "function": validators = [validators]; break;
            case typeof validators === "undefined": validators = []; break;
        }
        let error = undefined;
        for (fn of validators) {
            error = fn(value);
            if (error) break; 
        }
        return error;
    };
    
    handleChange = (event) => {
        let value = event.target.value;
        const error = this.handleValidate(value);
        this.setState({value: value, error: error});
    };
    
    handleFocus = (event) => {
        this.setState({focus: true});
    };
    
    handleBlur = (event) => {
        let error = this.state.error;
        if (typeof error !== 'undefined') {
            error = this.handleValidate(this.state.value);
        }
        this.setState({focus: false, error: error})
    };
}
```

As you can imagine, without a solid abstraction, defining a new field can become a complex process to ensure all 
the events needed are configured and the proper state is lifted up to the form level. Now consider the following 
example which covers the same functionality above plus handles lifting its value, validation, and error state to the 
form level.

```jsx harmony
import React from 'react'
import {Field} from "./src/components/Field";
import {FieldProps, asField, FieldContext} from "./src/wrappers/field";
import {mergeClass} from "./src/components/ClassHelpers";

export class UTextInput extends React.Component {
    static contextType = FieldContext;

    constructor(props, context) {
        super(props, context);
        this.field = context;
    }

    render() {
        let { type, value, className, ...ptProps } = this.props;
        if (ptProps['aria-describedby']) delete ptProps['aria-describedby'];
        if (ptProps['aria-invalid']) delete ptProps['aria-invalid'];
        const cn = mergeClass(className, ["bifrost-field__input"]);
        const val = value ? value : "";
        const invalid = typeof this.field.getError() !== 'undefined';
        return (
            <Field>
                <input type="text" className={cn} value={val} aria-describedby={this.field.getErrorId()} aria-invalid={invalid} {...ptProps}/>
            </Field>
        );
    }
}

export const TextInput = asField()(UTextInput);
```

The asField higher order component takes care of all the default functionality, validation, and lifting of state to 
the form level. Now, whenever you need to add a text field to your form, it is as simple as the next example.

```jsx harmony
import React from 'react'
import { Form } from './src/components/Form'
import { TextInput } from './src/components/Input'

export function matches(exp, msg) {
    return function (val, field) {
        exp.lastIndex = 0;
        if (!exp.test(val)) {
            return msg;
        }
        return true;
    }
}

export class MyForm extends React.Component {
    render() {
        const required = matches(/^.+$/, 'Required');
        return (
            <Form>
                <TextInput fieldName="firstName" validators={[required]}/>
                <TextInput fieldName="lastName" validators={[required]}/>
            </Form>
        );
    }
}
```

Finally, most fields in dynamic forms are more complex than a text input. The `asField` higher order component is not
 limited to these simple scenarios, it works seamlessly with more complex field types as well.
 
## Entities

Bifrost form collects all form fields into a json representation. For certain forms, you may want to nest fields 
within an object. Entities allow you to seamlessly represent this nested structure in your form definition. Consider 
the case of an Artist entity.

```jsx harmony
import React from 'react'
import { Form } from './src/components/Form'
import { TextInput } from './src/components/Input'
import { Entity } from './src/components/Entity'

// This is the json object we want to emulate with our form entity definition. 
const endFormStructure = {
    "artist": {
        "firstName": "Johnny",
        "lastName": "Cash",
        "born": {
            "date": "02/26/1932",
            "city": "Kingsland",
            "state": "Arkansas"
        }
    }
}

export class Artist extends React.Component {
    render() {
        return (
            <Entity fieldName="artist">
            {/*
              * The Entity Component will store any children under the specified fieldName. In this case, we are 
              * storing the children fields under the key "person" 
              */}
                <TextInput fieldName="firstName"/>
                <TextInput fieldName="lastName"/>
                <Entity fieldName="born">
                    {/*
                      * Entities can be nested to the nth level. Here we are opening a new Entity under the key "born"
                      */}
                    <TextInput fieldName="date"/>
                    <TextInput fieldName="city"/>
                    <TextInput fieldName="state"/>
                </Entity>
            </Entity>
        );
    }
}
``` 

## Collections

Another complex use case that is made trivial with Bifrost Form is a collection of an arbitrary field or entity. 
Collections are deceptively difficult to create with React due to managing how mounted/unmounted components work and 
the default behavior or changing the order of fields without using keys.

Consider the case of extending our artist definition to allow albums to be added.

```jsx harmony
// TODO
```

## Initial Release TODO

- Allow Custom `ItemContainer`
- Allow Custom `Add Item` Button
- Allow Loading Initial Form Data
- Allow Loading Initial Form Data from Query String
- Specify Cross Window Message Data Format
    - It should be parsable without a full JSON.parse call.
    - It should identify the target handler so handlers can listen to only their messages
- Add Form onSubmit
    - Determine how to handle validation on submit (e.g. Forced or Optional)
    - Provide a default GET submission
    - Provide a default POST submission
    - Provide a default JSON POST submission
- Prevent duplicate submission
- Cleanup TODO's
- Update Readme to include form submission
- Update Readme to include Cross-Field Validation
- Consider whether the field wrapper should set aria-describedby and aria-invalid
    - aria-invalid should definitely be set
    - aria-describedby relies on the error implementation setting the id properly
    - not setting them puts more burden on core input implementations to get it right
- Finish Basic Field Components
- Add listeners for onDisplay and onError
- Add Validation at Collection, Entity, and Form Level
- Ensure strong accessibility
- Provide sane default css
- Review default class names
- Allow class names to be set through configuration at runtime
- Audit manual forceUpdate implementation