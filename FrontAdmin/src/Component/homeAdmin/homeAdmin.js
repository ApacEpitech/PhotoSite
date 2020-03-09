import React from "react";
import {Icon, Layout, Menu, Card, Modal, Form, Input, Row, Col} from 'antd';
import './homeAdmin.css'
import 'antd/dist/antd.css';
import {Link} from "react-router-dom";
import axios from "axios";
import Cookies from 'js-cookie';
import Select from "react-dropdown-select";
import 'react-toastify/dist/ReactToastify.min.css';
import {toast} from "react-toastify";

const {Content, Footer, Sider} = Layout;

export default class HomeAdmin extends React.Component {

    state = {
        photos: [],
        allCategories: [],
        allDestinations: [],
        destinationFilter: [],
        destinationToAdd: [],
        subCategoryToAdd: [],
        categoryFilter: [],
        sub_categoriesFilter: [],
        sub_categories: [],
        sub_categories_to_add: [],
        categoryToAdd: [],
        load: true,
        addedFile: false,
        categChosen: false,
        destChosen: false,
        visibleNewPhoto: false
    };

    selectedTasksEdit;

    //, "Authorization": 'Bearer ' + Cookies.get('jwt')}

    componentDidMount() {
        if (Cookies.get('jwt') !== undefined && Cookies.get('jwt') !== "") {
            axios.get('http://www.holy-driver.tools:4000/photos').then(res => {
                this.setState({photos: res.data});
            }).catch(err => {
                console.error(err);
            });
            axios.get('http://www.holy-driver.tools:4000/categories').then(res => {
                this.setState({allCategories: res.data});
            }).catch(err => {
                console.error(err);
            });
            axios.get('http://www.holy-driver.tools:4000/destinations').then(res => {
                this.setState({allDestinations: res.data});
                this.setState({load: false});
            }).catch(err => {
                console.error(err);
            });
        } else {
            window.location = 'login';
        }
    }

    // Part add Task
    showModalNewTaskModal = () => {
        this.setState({
            visibleNewPhoto: true,
        });
    };

    handleOkNewTaskModal = () => {
        if (document.getElementById('NewImageDesc').value === "") {
            alert("Merci de rentrer un titre");
            return;
        }
        const photo = {
            'category':  this.state.subCategoryToAdd.length > 0 ? this.state.subCategoryToAdd[0]['CategoryID'] : this.state.categoryToAdd[0]['CategoryID'],
            'destination': this.state.destinationToAdd[0]['DestinationID'],
            'description': document.getElementById('NewImageDesc').value,
            'title': this.state.fileName,
            'binary': this.state.fileBin
        };
        axios.post(`http://www.holy-driver.tools:4000/photos`, photo, {headers: {"Authorization": 'Bearer ' + Cookies.get('jwt')}})
            .then(async res => {
                this.state.photos.push(res.data);
                await this.setState({'visibleNewPhoto': false});
                toast.info("Photo ajoutée");
            }).catch(err => {
                console.error(err);
        });
    };

    handleCancelNewTaskModal = e => {
        this.setState({'visibleNewPhoto': false});
    };

    // Part Edit Task
    showModalEditTaskModal = e => {
        axios.get('http://www.holy-driver.tools:4000/photos/' + e.currentTarget.id, {headers: {"Access-Control-Allow-Origin": "*"}})
            .then(res => {
                const photo = res.data;
                this.selectedTasksEdit = photo;
                this.stateEditTaskModal.visible = true;
                this.selectedPhoto = photo['PhotoID'];
                axios.get('http://www.holy-driver.tools:4000/photos/' + this.selectedPhoto, {headers: {"Access-Control-Allow-Origin": "*"}})
                    .then(res => {
                        const user = res.data;
                        this.setState({
                            visible: true,
                            titleEdit: photo.title,
                            contentEdit: photo.content,
                            userAssigned: user.email
                        });
                    });
            });
    };


    create_body() {
        // CATEGORIES
        let cat_id = [];
        if (this.state.sub_categoriesFilter.length > 0) {
            for (let cat of this.state.sub_categoriesFilter) {
                cat_id.push(cat['CategoryID']);
            }
        } else {
            for (let cat of this.state.categoryFilter) {
                cat_id.push(cat['CategoryID']);
                for (let sub_cat of cat['sub_categories']) {
                    cat_id.push(sub_cat['CategoryID']);
                }
            }
        }

        // DESTINATIONS
        let dest_id = [];
        for (let dest of this.state.destinationFilter) {
            dest_id.push(dest['DestinationID']);
        }

        // CREATION BODY
        const body = {};
        body.categories = cat_id;
        body.destinations = dest_id;
        return body;
    }

    setCategoryFilter = async categoriesSelected => {
        await this.setState({categoryFilter: categoriesSelected});
        let sub_categories = [];
        for (let cat of categoriesSelected) {
            for (let sub_cat of cat['sub_categories']) {
                sub_categories.push(sub_cat);
            }
        }
        await this.setState({sub_categories});
        let sub_cat_new = [];
        for (let sub_cat_av of this.state.sub_categories) {
            if (this.state.sub_categoriesFilter.includes(sub_cat_av)) {
                sub_cat_new.push(sub_cat_av);
            }
        }
        await this.setState({sub_categoriesFilter: sub_cat_new});
        this.update_photo_list();

    };

    setSubCategoryFilter = async categoriesSelected => {
        await this.setState({sub_categoriesFilter: categoriesSelected});
        this.update_photo_list();
    };


    update_photo_list() {
        let body = this.create_body();
        axios.post('http://www.holy-driver.tools:4000/photos/filter', body).then(res => {
            this.setState({photos: res.data});
        }).catch(err => {
            console.error(err);
        });
    }

    setDestinationFilter = async destinationsSelected => {
        await this.setState({destinationFilter: destinationsSelected});
        this.update_photo_list();
    };

    setCategoryAdd = async categoryToAdd => {
        if (categoryToAdd.length > 0) {
            await this.setState({categChosen: true});
            await this.setState({sub_categories_to_add: categoryToAdd[0]['sub_categories']});
            let sub_cat_new = [];
            for (let sub_cat_av of this.state.subCategoryToAdd) {
                if (this.state.sub_categories_to_add.includes(sub_cat_av)) {
                    sub_cat_new.push(sub_cat_av);
                }
            }
            await this.setState({subCategoryToAdd: sub_cat_new});
        } else {
            await this.setState({categChosen: false});
            await this.setState({sub_categories_to_add: []});
            await this.setState({subCategoryToAdd: []});
        }
        await this.setState({categoryToAdd});
    };

    setSubCategoryAdd = async subCategoryToAdd => {
        this.setState({subCategoryToAdd: subCategoryToAdd});
    };

    setDestinationAdd = async destinationToAdd => {
        if (destinationToAdd.length > 0) {
            await this.setState({destChosen: true});
        } else {
            await this.setState({destChosen: false});
        }
        this.setState({destinationToAdd});
    };

    toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    addFile = async event => {
        this.setState({addedFile: false});
        let file = event.target.files[0];
        this.setState({fileName: file.name});
        this.setState({fileBin: await this.toBase64(file)});
        this.setState({addedFile: true});
    };

    onDeletePhoto = e => {
        axios.delete('http://www.holy-driver.tools:4000/photos/' + e.currentTarget.id, {headers: {"Access-Control-Allow-Origin": "*"}})
            .then(res => {
                window.location.reload();
            });
    };

    render() {
        return (
            <Layout id={"test"}>
                <Sider
                    style={{
                        overflow: 'auto',
                        height: '100vh',
                        position: 'fixed',
                        left: 0,
                    }}>
                    <div className="logo"/>
                    <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
                        <Menu.Item key="1">
                            <Icon type="unordered-list"/>
                            <span className="nav-text">Photos</span>

                        </Menu.Item>
                        <Menu.Item key="2">
                            <Icon type="user"/>
                            <span className="nav-text">Catégories</span>
                            <Link to={"./users"}/>
                        </Menu.Item>
                        <Menu.Item key="3">
                            <Icon type="poweroff"/>
                            <span className="nav-text">Déconnexion</span>
                            <Link to={'./login'}/>

                        </Menu.Item>
                    </Menu>
                </Sider>
                <Layout style={{marginLeft: 200}}>
                    <Content style={{margin: '24px 16px 0', overflow: 'initial'}}>
                        <div style={{padding: 24, background: '#fff', textAlign: 'center'}}>
                            <div>
                                <h3 style={{textAlign: "left"}}>Photos</h3>
                            </div>
                            <div>
                                <Select onChange={(values) => this.setDestinationFilter(values)}
                                        options={this.state.allDestinations}
                                        labelField={'name'}
                                        loading={this.state.load}
                                        searchBy={'name'}
                                        multi={true}
                                        valueField={'DestinationID'}
                                        clearable={true}
                                        values={this.state.destinationFilter}/>
                                <Select onChange={(values) => this.setCategoryFilter(values)}
                                        options={this.state.allCategories}
                                        labelField={'title'}
                                        loading={this.state.load}
                                        searchBy={'title'}
                                        multi={true}
                                        valueField={'CategoryID'}
                                        clearable={true}
                                        values={this.state.categoryFilter}/>
                                <Select onChange={(values) => this.setSubCategoryFilter(values)}
                                        options={this.state.sub_categories}
                                        labelField={'title'}
                                        loading={this.state.load}
                                        disabled={this.state.sub_categories.length === 0}
                                        searchBy={'title'}
                                        multi={true}
                                        valueField={'CategoryID'}
                                        clearable={true}
                                        values={this.state.sub_categoriesFilter}/>
                            </div>
                            <div>
                                <Icon type="plus" style={{float: "right", fontSize: "20px", cursor: "pointer"}}
                                      onClick={this.showModalNewTaskModal}/>
                            </div>
                            <br/>

                            <Row>
                                {
                                    this.state.photos.map(photo =>
                                        <Col span={8} key={photo['PhotoID']}>
                                            <Card bordered={true}
                                                  style={{width: 300, marginBottom: '2%'}}
                                                  title={photo.description} className={"Task"}
                                                  extra={
                                                      <Icon type="close"
                                                            style={{
                                                                float: "right",
                                                                fontSize: "20px",
                                                                cursor: "pointer"
                                                            }}
                                                            onClick={this.onDeletePhoto}
                                                            id={photo['PhotoID']}/>
                                                  }
                                            >
                                                <img alt={photo.description} src={photo.url}
                                                     style={{width: '100%', marginBottom: '6px'}}/>
                                                <Icon type="edit"
                                                      style={{float: "right", fontSize: "20px", cursor: "pointer"}}
                                                      onClick={this.showModalEditTaskModal}
                                                      id={photo['PhotoID']}/>
                                            </Card>
                                        </Col>
                                    )
                                }
                            </Row>
                        </div>

                        <Modal
                            title="Ajouter une image"
                            visible={this.state.visibleNewPhoto}
                            onOk={this.handleOkNewTaskModal}
                            onCancel={this.handleCancelNewTaskModal}
                            cancelText="Annuler"
                            okButtonProps={{disabled: (!this.state.addedFile || !this.state.categChosen || !this.state.destChosen)}}
                            okText={'Ajouter'}>
                            <Form id="insertImage">
                                <Form.Item>
                                    <Input
                                        prefix={<Icon type="project" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                        placeholder="Description" id={"NewImageDesc"}/>
                                </Form.Item>
                                <Form.Item>
                                    <Select onChange={(value) => this.setDestinationAdd(value)}
                                            options={this.state.allDestinations}
                                            labelField={'name'}
                                            loading={this.state.load}
                                            searchBy={'name'}
                                            valueField={'DestinationID'}
                                            values={this.state.destinationToAdd}/>
                                </Form.Item>
                                <Form.Item>
                                    <Select onChange={(value) => this.setCategoryAdd(value)}
                                            options={this.state.allCategories}
                                            labelField={'title'}
                                            loading={this.state.load}
                                            searchBy={'title'}
                                            valueField={'CategoryID'}
                                            values={this.state.categoryToAdd}/>
                                </Form.Item>
                                <Form.Item>
                                    <Select onChange={(value) => this.setSubCategoryAdd(value)}
                                            options={this.state.sub_categories_to_add}
                                            disabled={this.state.sub_categories_to_add.length === 0}
                                            labelField={'title'}
                                            loading={this.state.load}
                                            searchBy={'title'}
                                            valueField={'CategoryID'}
                                            values={this.state.subCategoryToAdd}/>
                                </Form.Item>
                                <Form.Item>
                                    <input id="upload" type="file" name="file" onChange={this.addFile}/>
                                </Form.Item>
                            </Form>
                        </Modal>
                    </Content>
                    <Footer style={{textAlign: 'center', position: "sticky", bottom: "0"}}>
                        Designed By CUEVAS Alexandre
                    </Footer>
                </Layout>
            </Layout>
        )
    }
}