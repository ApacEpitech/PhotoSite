import React from "react";
import {Checkbox, Icon, Layout, Menu, Card, Modal, Form, Input, Row, Col, Select } from 'antd';

import 'antd/dist/antd.css';
import {Link} from "react-router-dom";
import axios from "axios";
import Cookies from 'js-cookie';
import TextArea from "antd/es/input/TextArea";
const { Option } = Select;
const { Content, Footer, Sider } = Layout;

export default class HomeAdmin extends React.Component{

    state = {
        tasks: [],
        allCategories: [],
        allDestinations: []
    };

    stateNewTaskModal = { visible: false };
    stateEditTaskModal = { visible: false };

    showAll = false;
    showDone = false;
    showUnDone = false;
    selectedTasksEdit;
    selectedUser;

    //, "Authorization": 'Bearer ' + Cookies.get('jwt')}

    componentDidMount() {
        if (Cookies.get('jwt') !== undefined && Cookies.get('jwt') !== "") {
            axios.get('http://www.holy-driver.tools:4000/photos',
                { headers: {"Access-Control-Allow-Origin": "*"}}, {}).then(res => {
                console.log(res.data);
            }).catch(err => {
                console.log(err);
            });
            axios.get('http://www.holy-driver.tools:4000/categories',
                { headers: {"Access-Control-Allow-Origin": "*"}}, {}).then(res => {
                this.setState({allCategories:res.data});
            }).catch(err => {
                console.log(err);
            });
            axios.get('http://www.holy-driver.tools:4000/destinations',
                { headers: {"Access-Control-Allow-Origin": "*"}}, {}).then(res => {
                this.setState({allDestinations:res.data});
            }).catch(err => {
                console.log(err);
            });
        } else {
            window.location = 'login';
        }
    }

    onChange(e) {
        console.log(`checked`, e.target.id);
        switch (e.target.id) {
            case "Done":
                window.location = './homeAdmin?show=Done';
                break;
            case "UnDone":
                window.location = "./homeAdmin?show=UnDone";
                break;
            case "All":
                window.location = "./homeAdmin?show=All";
                break;
            default:
                window.location = "./homeAdmin?show=All";
                break;
        }
    }

    onChangeUserSelect  = (value, event) =>  {
        console.log(`checked`, value);
        this.selectedUser = value;
    };

    // Part add Task
    showModalNewTaskModal = () => {
        this.stateNewTaskModal.visible = true;
        this.selectedUser = -1;
        this.selectedUser = -1;
        this.setState({
            visible: true,
        });
    };

    handleOkNewTaskModal = e => {
        if (document.getElementById('NewTitleTask').value !== "") {
            if (this.selectedUser !== -1) {
                const task = {
                    'title': document.getElementById('NewTitleTask').value,
                    'user_id': this.selectedUser
                };
                console.log(task);
                axios.post(`http://www.holy-driver.tools:4000/tasks`, task)
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
                alert("Please select an user!!!!!!");
            }
        } else {
            alert("Please enter title");

        }
    };

    handleCancelNewTaskModal = e => {
        console.log(e);
        this.stateNewTaskModal.visible = false;

        this.setState({
            visible: false,
        });
    };

    // Part Edit Task
    showModalEditTaskModal = e => {
        axios.get('http://www.holy-driver.tools:4000/tasks/'+e.currentTarget.id,{ headers: {"Access-Control-Allow-Origin": "*"}})
            .then(res => {
                console.log(res.data);
                const task = res.data;
                this.selectedTasksEdit = task;
                this.stateEditTaskModal.visible = true;
                this.selectedUser = task.user_id;
                axios.get('http://www.holy-driver.tools:4000/users/'+this.selectedUser,{ headers: {"Access-Control-Allow-Origin": "*"}})
                    .then(res => {
                        console.log(res.data);
                        const user = res.data;
                        this.setState({
                            visible: true,
                            titleEdit: task.title,
                            contentEdit: task.content,
                            userAssigned: user.email
                        });
                    });
            });

    };

    handleOkEditTaskModal = e => {
        if (document.getElementById('EditTitleTask').value !== "") {
            const task = {
                '_id': this.selectedTasksEdit._id.$oid,
                'title': document.getElementById('EditTitleTask').value,
                'content': document.getElementById('EditContentTask').value,
                'user_id': this.selectedUser,
                'done': this.selectedTasksEdit.done
            };
            console.log(task);
            axios.put(`http://www.holy-driver.tools:4000/tasks`, task)
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
            alert("Please enter title");
        }
    };

    handleCancelEditTaskModal = e => {
        console.log(e);
        this.stateEditTaskModal.visible = false;

        this.setState({
            visible: false,
        });
    };

    onEditTitleChange(value){
        this.setState({
            titleEdit: value
        });
    }

    onEditContentChange(value){
        this.setState({
            contentEdit: value
        });
    }

    onChangeStateDone = e => {
        axios.get('http://www.holy-driver.tools:4000/tasks/'+e.target.id,{ headers: {"Access-Control-Allow-Origin": "*"}})
            .then(res => {
                console.log(res.data);
                const task = res.data;
                const taskData = {
                    '_id': task._id.$oid,
                    'title': task.title,
                    'content': task.content,
                    'user_id': task.user_id,
                    'done': !task.done
                };
                console.log(JSON.stringify(taskData));
                axios.put(`http://www.holy-driver.tools:4000/tasks`, taskData)
                    .then(res => {
                        console.log(res);
                        console.log(res.data);
                        window.location.reload();
                    });
            });
    };

    onDeleteTask = e => {
        axios.delete('http://www.holy-driver.tools:4000/tasks/'+e.currentTarget.id,{ headers: {"Access-Control-Allow-Origin": "*"}})
            .then(res => {
                console.log(res.data);
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
                    <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
                        <Menu.Item key="1" >
                            <Icon type="unordered-list"/>
                            <span className="nav-text">List Todo Admin</span>

                        </Menu.Item>
                        <Menu.Item key="2" >
                            <Icon type="user"/>
                            <span className="nav-text" >Users</span>
                            <Link to={"./users"}/>
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
                        <div style={{ padding: 24, background: '#fff', textAlign: 'center' }}>
                            <div style={{display: "inline"}}>
                                <h3 style={{display: "inline", float: "left"}}>Tasks</h3>
                            </div>
                            <div style={{display: "inline"}}>
                                <Checkbox onChange={this.onChange} id={"Done"} checked={this.showDone}>Done</Checkbox>
                                <Checkbox onChange={this.onChange} id={"UnDone"} checked={this.showUnDone}>UnDone</Checkbox>
                                <Checkbox onChange={this.onChange} id={"All"} checked={this.showAll}>All</Checkbox>
                            </div>
                            <div>
                                <Icon type="plus" style={{float: "right", fontSize: "20px", cursor: "pointer"}} onClick={this.showModalNewTaskModal}/>
                            </div>
                            <br />

                            <Row >
                                {
                                    this.state.tasks.map(task =>
                                        <Col  span={8} >
                                            <Card bordered={true} style={{width: 300, marginBottom: '2%'}} title={task.title} className={"Task"} extra={<Icon type="close" style={{float: "right", fontSize: "20px", cursor: "pointer"}} onClick={this.onDeleteTask} id={task._id.$oid}/> }>
                                                <p>{task.content}</p>
                                                <Icon type="edit" style={{float: "left", fontSize: "20px", cursor: "pointer"}} onClick={this.showModalEditTaskModal} id={task._id.$oid}/>
                                                <Checkbox onChange={this.onChangeStateDone} id={"Done"}
                                                          style={{float: "right"}} checked={task.done} id={task._id.$oid}>Done</Checkbox>
                                            </Card>
                                        </Col>
                                    )
                                }
                            </Row>
                        </div>

                        <Modal
                            title="Ajouter une image"
                            visible={this.stateNewTaskModal.visible}
                            onOk={this.handleOkNewTaskModal}
                            onCancel={this.handleCancelNewTaskModal}
                            cancelText="Annuler"
                            okText={'Ajouter'}>
                            <Form id="insertImage">
                                <Form.Item>
                                    <Input
                                        prefix={<Icon type="project" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                        placeholder="Description" id={"NewImageDesc"}
                                    />
                                </Form.Item>
                                <Form.Item>
                                    <Select
                                        style={{ width: 120, marginRight: 10 }}
                                        placeholder="Catégorie"
                                        onSelect={(value, event) => this.onChangeUserSelect(value, event)}>
                                        {
                                            this.state.allCategories.map(val => (
                                                <Option key={val.CategoryID} value={val.CategoryID}>
                                                    {val.title}
                                                </Option>
                                            ))}
                                    </Select>
                                </Form.Item>
                                <Form.Item>
                                    <Select
                                        defaultValue={this.state.userAssigned}
                                        placeholder="Destination"
                                        style={{ width: 120, marginRight: 10 }}
                                        onSelect={(value, event) => this.onChangeUserSelect(value, event)}>
                                        {
                                            this.state.allDestinations.map(val => (
                                                <Option key={val.DestinationID} value={val.DestinationID}>
                                                    {val.name}
                                                </Option>
                                            ))}
                                    </Select>
                                </Form.Item>
                            </Form>
                        </Modal>

                        <Modal
                            title="Modifier image"
                            visible={this.stateEditTaskModal.visible}
                            onOk={this.handleOkEditTaskModal}
                            onCancel={this.handleCancelEditTaskModal}
                            okText={'Modifier'}
                        >
                            <Form >
                                <Form.Item>
                                    <Input
                                        prefix={<Icon type="project" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                        placeholder="Title" id={"EditTitleTask"} value={this.state.titleEdit} onChange={e => this.onEditTitleChange(e.target.value)}
                                    />
                                </Form.Item>
                                <Form.Item>
                                    <TextArea
                                        prefix={<Icon type="project" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                        placeholder="Content" id={"EditContentTask"} value={this.state.contentEdit} onChange={e => this.onEditContentChange(e.target.value)}
                                    />
                                </Form.Item>
                                <Form.Item>
                                    <Select
                                        defaultValue={this.state.userAssigned}
                                        style={{ width: 120, marginRight: 10 }}
                                        onSelect={(value, event) => this.onChangeUserSelect(value, event)}
                                    >
                                        {
                                            this.state.allCategories.map(val => (
                                            <Option key={val.CategoryID} value={val.CategoryID}>
                                                {val.email}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Form>
                        </Modal>
                    </Content>
                    <Footer style={{ textAlign: 'center' }}>Designed By CUEVAS Alexandre  </Footer>
                </Layout>
            </Layout>)
    }
}