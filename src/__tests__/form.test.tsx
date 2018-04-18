import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as TestUtils from 'react-dom/test-utils'
import {Form, UForm} from  "../components/Form"

test('Form renders', () => {
    const div = document.createElement('div');
    const render = () => {
        ReactDOM.render(<Form/>, div)
    };
    expect(render).not.toThrow();
});

test('Form context is defined', () => {
    const container = TestUtils.renderIntoDocument(<Form/>) as React.Component<any,{}>;
    const form = TestUtils.findRenderedComponentWithType(container, UForm);
    expect(form.context.form).toBeDefined();
});