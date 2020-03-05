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
                    'mail': values.username ,
                    'password': values.password
                };
                axios.post('http://localhost:5000/users/connect',user, { headers: {"Access-Control-Allow-Origin": "*"}})
                    .then(res => {
                        console.log(res.data);
                        const user = res.data;
                        if (user.status === undefined) {
                            if (user.banned) {
                                alert("You are banned!");
                            }
                            else if (user.administrator) {
                                Cookies.set('id', user._id.$oid);
                                window.location = './homeAdmin?show=All';
                            } else {
                                Cookies.set('id', user._id.$oid);

                                window.location = './home?show=All';
                            }
                        } else {
                            alert("Email Or Password Incorrect")
                        }

                    })
                    .catch(error => {
                        console.log(error);
                        alert("Email Or Password Incorrect")

                    });
                console.log('Received values of form: ', values);
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