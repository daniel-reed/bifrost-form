import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as PropTypes from 'prop-types'
import * as TestUtils from 'react-dom/test-utils'
import {FormContext, FormProps, withForm} from "./form";
import {FieldContext, FieldProps, withField} from "./field";

class Container extends React.Component<{}> {
    render() {
        return (
            <ConnectedFormTest>
                <ConnectedFieldTest label="Name" fieldName="Name"/>
            </ConnectedFormTest>
        );
    }
};

type FormTestProps = React.HTMLProps<HTMLFormElement> & FormProps

class FormTest extends React.Component<FormTestProps> {
    static contextTypes = {
        form: PropTypes.object.isRequired
    };

    context: FormContext;

    render() {
        return (
            <form {...this.props}/>
        );
    }
}

type FieldTestProps = React.HTMLProps<HTMLInputElement> & FieldProps

class FieldTest extends React.Component<FieldTestProps> {
    static contextTypes = {
        field: PropTypes.object.isRequired
    };

    context: FieldContext;

    render() {
        const override: Partial<FieldTestProps> = {
            type: "text",
        };
        const ptProps = Object.assign({}, this.props, override);

        return (
            <input {...ptProps}/>
        )
    }
}

const ConnectedFormTest = withForm<FormTestProps>()(FormTest);
const ConnectedFieldTest = withField<FieldTestProps>()(FieldTest);

test('withForm renders', () => {
    const div = document.createElement('div');
    const render = () => {
        ReactDOM.render(<ConnectedFormTest/>, div)
    };
    expect(render).not.toThrow();
});

test('withField renders', () => {
    const div = document.createElement('div');
    const render = () => {
        ReactDOM.render(<Container/>, div)
    };
    expect(render).not.toThrow();
});

test('withForm context is defined', () => {
    const container = TestUtils.renderIntoDocument(<Container/>) as React.Component<any,{}>;
    const form = TestUtils.findRenderedComponentWithType(container, FormTest);
    expect(form.context.form).toBeDefined();
});

test('withField context is defined', () => {
    const container = TestUtils.renderIntoDocument(<Container/>) as React.Component<any,{}>;
    const field = TestUtils.findRenderedComponentWithType(container, FieldTest);
    expect(field.context.field).toBeDefined();
});
