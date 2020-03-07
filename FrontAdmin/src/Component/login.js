import React from "react";
import ReactDOM from 'react-dom'
import { Form, Icon, Input, Button, Checkbox } from 'antd';
import Cookies from 'js-cookie';

import '../css/login.css';

import 'antd/dist/antd.css';
import axios from "axios";

class Login extends React.Component{

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const user = {
                    'email': values.username ,
                    'password': values.password
                };
                axios.post('http://www.holy-driver.tools:4000/users/connect',user, { headers: {"Access-Control-Allow-Origin": "*"}})
                    .then(res => {
                        if (res.status === 200) {
                            const token = res.data['access_token'];
                            Cookies.set('jwt', token);
                            window.location = './homeAdmin';
                        } else {
                            alert("Email Or Password Incorrect")
                        }
                    })
                    .catch(error => {
                        console.log(error);
                        alert("Email Or Password Incorrect")

                    });
            }
        });
    };

    componentDidMount() {
        Cookies.set('id', '');
    }

    render() {

        const { getFieldDecorator } = this.props.form;

        return(

            <Form onSubmit={this.handleSubmit} className="login-form">
             <Form.Item>
                 {getFieldDecorator('username', {
                     rules: [{ required: true, message: 'Please input your username!' }],
                 })(
                     <Input
                         prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                         placeholder="Username"
                     />,
                 )}
             </Form.Item>
             <Form.Item>
                 {getFieldDecorator('password', {
                     rules: [{ required: true, message: 'Please input your Password!' }],
                 })(
                     <Input
                         prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                         type="password"
                         placeholder="Password"
                     />,
                 )}
             </Form.Item>
             <Form.Item>
                 <Button type="primary" htmlType="submit" className="login-form-button">
                     Log in
                 </Button>
             </Form.Item>
         </Form>)
    }
}

export default Form.create({ name: 'normal_login' })(Login);