import React from "react";
import { Form, Icon, Input, Button } from 'antd';
import Cookies from 'js-cookie';

import './login.css';

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
        Cookies.remove('id');
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        return(
            <Form onSubmit={this.handleSubmit} className="login-form">
                <h1 style={{textAlign: "center"}}>Interface administrateur</h1>
                <Form.Item>
                 {getFieldDecorator('username', {
                     rules: [{ required: true, message: 'Merci de rentrer votre adresse email' }],
                 })(
                     <Input
                         prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                         placeholder="Adresse email"
                     />,
                 )}
             </Form.Item>
             <Form.Item>
                 {getFieldDecorator('password', {
                     rules: [{ required: true, message: 'Merci de saisir un mot de passe' }],
                 })(
                     <Input
                         prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                         type="password"
                         placeholder="Mot de passe"
                     />,
                 )}
             </Form.Item>
             <Form.Item>
                 <Button type="primary" htmlType="submit" className="login-form-button">
                     Se connecter
                 </Button>
             </Form.Item>
         </Form>
        )
    }
}

export default Form.create({ name: 'normal_login' })(Login);