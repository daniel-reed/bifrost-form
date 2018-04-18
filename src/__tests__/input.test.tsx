import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as TestUtils from 'react-dom/test-utils'
import {Form} from "../components/Form"
import {TextInput, UTextInput} from "../components/Input";

test('TextInput renders', () => {
    const div = document.createElement('div');
    const render = () => {
        ReactDOM.render(<Form><TextInput fieldName="Name" label="Name"/></Form>, div)
    };
    expect(render).not.toThrow();
});

test('TextInput is working', () => {
    const form = TestUtils.renderIntoDocument(<Form><TextInput fieldName="Name" label="Name"/></Form>) as React.Component<any,{}>;
    const textInput = TestUtils.findRenderedComponentWithType(form, UTextInput);
    const field = textInput.context.field;
    expect(field).toBeDefined();

    const input = TestUtils.findRenderedDOMComponentWithTag(textInput, 'input') as any;
    expect(input).toBeDefined();

    TestUtils.Simulate.change(input, {target: {value: "ab"}} as any);
    expect(field.getValue()).toBe("ab");
    TestUtils.Simulate.focus(input);
    expect(field.getFocus()).toBe(true);
    TestUtils.Simulate.blur(input);
    expect(field.getFocus()).toBe(false);
});