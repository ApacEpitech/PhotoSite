import React from "react";
import {Checkbox, Icon, Layout, Menu, Card, Col, Row, Modal, Form, Input, Button} from 'antd';
import axios from 'axios';

import 'antd/dist/antd.css';
import {Link} from "react-router-dom";
import Cookies from "js-cookie";

const { Header, Content, Footer, Sider } = Layout;

export default class Users extends React.Component{


    state = {
        users: []
    };

    stateNewUserModal = { visible: false };
    stateEditUserModal = { visible: false };
    selectedUserEdit;
    currentUser;


    componentDidMount() {
        if (Cookies.get('id') !== undefined && Cookies.get('id') !== "") {
            axios.get('http://www.holy-driver.tools:4000/users/' + Cookies.get('id'),{ headers: {"Access-Control-Allow-Origin": "*"}})
                .then(res => {
                    console.log(res.data);
                    const users = res.data;
                    if (!users.administrator)  {
                        window.location = 'home';
                    }
                    this.currentUser = users;
                })
        } else {
            window.location = 'login';
        }
        axios.get('http://www.holy-driver.tools:4000/users',{ headers: {"Access-Control-Allow-Origin": "*"}})
            .then(res => {
                console.log(res.data);
                const users = res.data;
                this.setState({ users });
            })
    }

    // Part add User
    showModalNewUserModal = () => {
        this.stateNewUserModal.visible = true;
        this.setState({
            visible: true,
        });
    };

    handleOkNewUserModal = e => {
        if (document.getElementById('NewUserEmail').value !== "") {
            if (document.getElementById('NewUserPassword').value === document.getElementById('NewUserConfirmPassword').value) {
                const user = {
                    'mail': document.getElementById('NewUserEmail').value,
                    'password': document.getElementById('NewUserPassword').value
                };
                console.log(user);
                axios.post(`http://www.holy-driver.tools:4000/users`, user)
                    .then(res => {
                        console.log(res);
                        console.log(res.data);
                        window.location.reload();
                        this.stateNewUserModal.visible = false;
                        this.setState({
                            visible: false,
                        });
                    });
            } else {
                alert("Please check password");
            }
        } else {
            alert("Please enter email");

        }
    };

    handleCancelNewUserModal = e => {
        console.log(e);
        this.stateNewUserModal.visible = false;

        this.setState({
            visible: false,
        });
    };

    // Part Edit User
    showModalEditUserModal = e =>{
        console.log(e);
        axios.get('http://www.holy-driver.tools:4000/users/'+e.currentTarget.id,{ headers: {"Access-Control-Allow-Origin": "*"}})
            .then(res => {
                console.log(res.data);
                const user = res.data;
                this.selectedUserEdit = user;
                this.stateEditUserModal.visible = true;
                this.setState({
                    visible: true,
                    userEmail: user.email
                });
            })
    };

    handleOkEditUserModal = e => {
        if (document.getElementById('EditUserEmail').value !== "") {
            if (document.getElementById('EditUserPassword').value === document.getElementById('EditUserConfirmPassword').value) {
                const user = {
                    '_id': this.selectedUserEdit._id.$oid,
                    'email': document.getElementById('EditUserEmail').value,
                    'pwd': document.getElementById('EditUserPassword').value,
                    'banned': this.selectedUserEdit.banned,
                    'administrator': this.selectedUserEdit.administrator
                };
                console.log(JSON.stringify(user));
                axios.put(`http://www.holy-driver.tools:4000/users`, user)
                    .then(res => {
                        console.log(res);
                        console.log(res.data);
                        window.location.reload();
                        this.stateNewUserModal.visible = false;
                        this.setState({
                            visible: false,
                        });
                    });
            } else {
                alert("Please check password");
            }
        } else {
            alert("Please enter email");

        }
    };

    handleCancelEditUserModal = e => {
        console.log(e);
        this.stateEditUserModal.visible = false;

        this.setState({
            visible: false,
        });
    };

    onEditEmailChange(value){
        this.setState({
            userEmail: value
        });
    }

    onChangeStateBan(e) {
        axios.get('http://www.holy-driver.tools:4000/users/'+e.target.id,{ headers: {"Access-Control-Allow-Origin": "*"}})
            .then(res => {
                console.log(res.data);
                const user = res.data;
                const userData = {
                    '_id': user._id.$oid,
                    'email': user.email,
                    'pwd': '',
                    'banned': !user.banned,
                    'administrator': user.administrator
                };
                console.log(JSON.stringify(userData));
                axios.put(`http://www.holy-driver.tools:4000/users`, userData)
                    .then(res => {
                        console.log(res);
                        console.log(res.data);
                        window.location.reload();
                    });
            });
    }

    onDeleteUser = e => {
        axios.delete('http://www.holy-driver.tools:4000/users/'+e.currentTarget.id,{ headers: {"Access-Control-Allow-Origin": "*"}})
            .then(res => {
                window.location.reload();
            });
    };



    render() {
        return(
            <Layout>
                <Sider
                    style={{
                        overflow: 'auto',
                        height: '100vh',
                        position: 'fixed',
                        left: 0,
                    }}
                >
                    <div className="logo" />
                    <Menu theme="dark" mode="inline" defaultSelectedKeys={['2']}>
                        <Menu.Item key="1" >
                            <Icon type="unordered-list"/>
                            <span className="nav-text">List TODO</span>
                            <Link to={"./homeAdmin?show=All"}/>
                        </Menu.Item>
                        <Menu.Item key="2" >
                            <Icon type="user"/>
                            <span className="nav-text">Users</span>

                        </Menu.Item>
                        <Menu.Item key="3" >
                            <Icon type="poweroff"/>
                            <span className="nav-text">Disconnect</span>
                            <Link to={'./login'}/>

                        </Menu.Item>
                    </Menu>
                </Sider>
                <Layout style={{ marginLeft: 200 }}>
                    <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
                        <div style={{ padding: 24, background: '#fff', textAlign: 'center', height: '100%', alignItems: "center"}}>
                            <div style={{display: "inline"}}>
                                <h3 style={{display: "inline", float: "left"}}>Users</h3>
                            </div>

                            <div>
                                <Icon type="plus" style={{float: "right", fontSize: "20px", cursor: "pointer"}} onClick={this.showModalNewUserModal}/>
                            </div>
                            <br />
                            <br />
                            <Row >
                                {
                                    this.state.users.map(user =>

                                        <Col  span={8} key={'Col'+user._id.$oid} >
                                            <Card bordered={true} style={{width: 300, marginBottom: '2%'}} className={"User"}>
                                                <Icon type="edit" style={{
                                                    float: "left",
                                                    fontSize: "20px",
                                                    cursor: "pointer",
                                                    display: "inline"
                                                }} onClick={this.showModalEditUserModal} id={user._id.$oid}/>

                                                <Icon type="user-delete"
                                                      style={{float: "right", fontSize: "20px", cursor: "pointer"}} id={user._id.$oid} onClick={this.onDeleteUser}/>
                                                <br/>
                                                <h3 className={"userEmail"}>{user.email}</h3>
                                                <Checkbox onChange={this.onChangeStateBan} id={"Done"}
                                                          style={{float: "right"}} checked={user.banned} id={user._id.$oid}>Ban</Checkbox>
                                            </Card>
                                        </Col>
                                    )
                                }
                            </Row>
                            <Modal
                                title="New User"
                                visible={this.stateNewUserModal.visible}
                                onOk={this.handleOkNewUserModal}
                                onCancel={this.handleCancelNewUserModal}
                                okText={'Create'}
                            >
                                <Form >
                                    <Form.Item>
                                        <Input
                                            prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                            placeholder="Email" id={"NewUserEmail"}
                                        />
                                    </Form.Item>
                                    <Form.Item>
                                        <Input
                                            prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                            type="password"
                                            placeholder="Password" id={"NewUserPassword"}
                                        />
                                    </Form.Item>
                                    <Form.Item>
                                        <Input
                                            prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                            type="password"
                                            placeholder="ConfirmPassword" id={"NewUserConfirmPassword"}
                                        />
                                    </Form.Item>
                                </Form>
                            </Modal>

                            <Modal
                                title="Edit User"
                                visible={this.stateEditUserModal.visible}
                                onOk={this.handleOkEditUserModal}
                                onCancel={this.handleCancelEditUserModal}
                                okText={'Edit'}
                            >
                                <Form >
                                    <Form.Item>
                                        <Input
                                            prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                            placeholder="Email" id={"EditUserEmail"} value={this.state.userEmail}

                                            onChange={e => this.onEditEmailChange(e.target.value)}
                                        />
                                    </Form.Item>
                                    <Form.Item>
                                        <Input
                                            prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                            type="password"
                                            placeholder="Password" id={"EditUserPassword"}
                                        />
                                    </Form.Item>
                                    <Form.Item>
                                        <Input
                                            prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                            type="password"
                                            placeholder="ConfirmPassword" id={"EditUserConfirmPassword"}
                                        />
                                    </Form.Item>
                                </Form>
                            </Modal>
                        </div>
                    </Content>
                    <Footer style={{ textAlign: 'center' }}>Designed By Epi Team  </Footer>
                </Layout>
            </Layout>)
    }
}