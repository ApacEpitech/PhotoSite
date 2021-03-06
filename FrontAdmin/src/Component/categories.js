import React from "react";
import {Icon, Layout, Menu, Row, Input} from 'antd';
import 'antd/dist/antd.css';
import {Link} from "react-router-dom";
import axios from "axios";
import Cookies from 'js-cookie';
import {TreeTable, TreeState} from 'cp-react-tree-table';
import {toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.min.css';

const {Content, Footer, Sider} = Layout;

export default class Categories extends React.Component {

    state = {
        categories: [],
        categoryToUpdate: {},
        category_parent: [],
        categoriesTree: TreeState.createEmpty(),
        load: true,
        visibleNewCategory: false,
        visibleUpdateCategory: false,
        uploadDone: false,
        titleToUpdate: ""
    };

    header;

    componentDidMount() {
        if (Cookies.get('jwt') !== undefined && Cookies.get('jwt') !== "") {
            this.header = {headers: {"Authorization": 'Bearer ' + Cookies.get('jwt')}};
            axios.get('http://www.holy-driver.tools:4000/categories').then(async res => {
                this.setState({categories: res.data});
                await this.convertCategoriesToTree();
                this.setState({uploadDone: true});
            }).catch(err => {
                console.error(err);
            });
        } else {
            window.location = 'login';
        }
    }

    async convertCategoriesToTree() {
        let all_cats = [];
        for (let cat of this.state.categories) {
            let new_cat = {height: 40, data: {"CategoryID": cat['CategoryID'], "title": cat['title']}};
            if (cat['sub_categories'] !== undefined && cat['sub_categories'].length > 0) {
                new_cat['children'] = [];
                for (let sub_cat of cat['sub_categories']) {
                    new_cat['children'].push({
                        height: 40,
                        data: {
                            "CategoryID": sub_cat['CategoryID'],
                            "title": sub_cat['title'],
                            "parent": cat['CategoryID']
                        }
                    });
                }
            }
            all_cats.push(new_cat);
        }
        await this.setState({categoriesTree: TreeState.expandAll(TreeState.create(all_cats))});
    }

    renderTitleCell = (row) => {
        if (row.data !== undefined) {
            return (
                <div style={{paddingLeft: (row.metadata.depth * 50) + 'px'}}
                     className={row.metadata.hasChildren ? 'with-children' : 'without-children'}>
                    {(row.metadata.hasChildren)
                        ? (
                            <button className="toggle-button" onClick={row.toggleChildren}/>
                        )
                        : ''
                    }
                    <Input type="text" style={{width: "80%"}} value={row.data.title} onChange={(e) => {
                        row.data.title = e.target.value;
                        this.setState(this.state.categoriesTree)
                    }}/>
                </div>
            );
        }
    };

    addChild = async (id) => {
        await this.setState({uploadDone: false});
        let cats = this.state.categories;
        let new_cat = {'title': ' '};
        if (id !== -1) {
            new_cat['parent'] = id;
        }

        await axios.post(`http://www.holy-driver.tools:4000/categories`, new_cat, this.header)
            .then(async res => {
                new_cat['CategoryID'] = res.data.CategoryID;
                toast.info("Catégorie créée");
            }).catch(err => {
                console.error(err);
                toast.error("Erreur lors de l'ajout");
        });

        if (id !== -1) {
            for (let cat of cats) {
                if (cat['CategoryID'] === id) {
                    if (cat['sub_categories'] === undefined) {
                        cat['sub_categories'] = [];
                    }
                    cat['sub_categories'].push(new_cat);
                }
            }
        } else {
            cats.push(new_cat);
        }
        await this.setState({categories: cats});
        await this.setState({uploadDone: true});
        await this.convertCategoriesToTree();
    };

    renderButtonCell = (row) => {
        return (
            <div>
                <Icon type={"plus"} onClick={async () => {
                    await this.addChild(row.data.CategoryID)
                }}
                      style={{visibility: row.metadata.depth === 0 ? "visible" : "hidden"}}/>
                <Icon type="check" style={{float: "right", fontSize: "20px", cursor: "pointer"}}
                      onClick={() => this.updateCategory(row.data)}/>
                <Icon type="delete" style={{float: "right", fontSize: "20px", cursor: "pointer"}}
                      onClick={() => this.deleteCategory(row.data.CategoryID)}/>
            </div>
        );
    };

    updateCategory = async (data) => {
        await this.setState({uploadDone: false});
        axios.put(`http://www.holy-driver.tools:4000/categories`, data, this.header)
            .then(async () => {
                toast.info("Modification effectuée");
            }).catch(async () => {
                toast.error("Erreur lors de l'ajout");
            }
        );
        for (let cat of this.state.categories) {
            if (cat.CategoryID === data.CategoryID) {
                cat.title = data.title;
                break;
            } else if (cat['sub_categories'].length > 0) {
                for (let j = 0; j < cat['sub_categories'].length; j++) {
                    if (cat['sub_categories'][j]['CategoryID'] === parseInt(data.CategoryID)) {
                        cat['sub_categories'][j].title = data.title;
                        break;
                    }
                }
            }
        }
        await this.setState({uploadDone: false});
    };

    deleteCategory = async (id) => {
        await this.setState({uploadDone: false});
        for (let cat of this.state.categories) {
            if (cat.CategoryID === id) {
                const bar = new Promise((resolve) => {
                    cat['sub_categories'].forEach((value) => {
                        console.log(value);
                        let res = this.deleteCatByID(value.CategoryID);
                        if (res === false) {
                            toast.error("Erreur lors de la suppression de la catégorie " + value.title);
                            return false;
                        }
                    });
                    resolve();
                });
                await bar.then(async () => {
                    this.deleteCatByID(id);
                });
            }
        }
    };

    deleteCatByID = async (id) => {
        await axios.delete(`http://www.holy-driver.tools:4000/categories/` + id, this.header)
            .then(async () => {
                let newCategoriesList = this.state.categories;
                for (let i = 0; i < this.state.categories.length; i++) {
                    if (this.state.categories[i]['CategoryID'] === parseInt(id)) {
                        newCategoriesList.splice(i, 1);
                        break;
                    } else if (this.state.categories[i]['sub_categories'].length > 0) {
                        for (let j = 0; j < this.state.categories[i]['sub_categories'].length; j++) {
                            if (this.state.categories[i]['sub_categories'][j]['CategoryID'] === parseInt(id)) {
                                newCategoriesList[i]['sub_categories'].splice(j, 1);
                                break;
                            }
                        }
                    }
                }
                await this.setState({categories: newCategoriesList});
                toast.info("Catégorie supprimée");
                this.setState({uploadDone: true});
                await this.convertCategoriesToTree();
                return true;
            }).catch(err => {
                console.error(err);
                toast.error("Erreur lors de la suppression");
                this.setState({uploadDone: true});
                return false;
            });
    };

    handleOnChange = (newValue) => {
        this.setState({categoriesTree: newValue});
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
                    <Menu theme="dark" mode="inline" defaultSelectedKeys={['2']}>
                        <Menu.Item key="1">
                            <Icon type="picture"/>
                            <span className="nav-text">Photos</span>
                            <Link to={"./photos"}/>
                        </Menu.Item>
                        <Menu.Item key="2">
                            <Icon type="unordered-list"/>
                            <span className="nav-text">Catégories</span>
                        </Menu.Item>
                        <Menu.Item key="3">
                            <Icon type="car"/>
                            <span className="nav-text">Destinations</span>
                            <Link to={'./destination'}/>
                        </Menu.Item>
                        <Menu.Item key="4">
                            <Icon type="poweroff"/>
                            <span className="nav-text">Déconnexion</span>
                            <Link to={'./login'}/>
                        </Menu.Item>
                    </Menu>
                </Sider>
                <Layout style={{marginLeft: 200, height:'100vh'}}>
                    <Content style={{margin: '24px 16px 0', overflow: 'initial'}}>
                        <div style={{padding: 24, background: '#fff', textAlign: 'center'}}>
                            <div>
                                <h3 style={{textAlign: "left"}}>Categories</h3>
                            </div>
                            <div>
                                <Icon type="plus" style={{float: "right", fontSize: "20px", cursor: "pointer"}}
                                      onClick={() => this.addChild(-1)}/>
                                <img alt="Loading" style={{float: "right"}}
                                     src=" https://apacphotosite.s3.eu-west-3.amazonaws.com/transparent-welcome-gif-background-3.gif"
                                     hidden={this.state.uploadDone}
                                     width={"2%"}/>
                            </div>
                            <br/>

                            <Row style={{height: "100%"}}>
                                <TreeTable value={this.state.categoriesTree}
                                           onChange={this.handleOnChange}>
                                    <TreeTable.Column
                                        renderCell={this.renderTitleCell}
                                        renderHeaderCell={() => <span>Titre</span>}/>
                                    <TreeTable.Column
                                        renderCell={this.renderButtonCell}
                                        renderHeaderCell={() => <span>Actions</span>}/>

                                </TreeTable>
                            </Row>
                        </div>
                    </Content>
                    <Footer style={{textAlign: 'center', position: "sticky", bottom: "0"}}>
                        Designed By CUEVAS Alexandre
                    </Footer>
                </Layout>
            </Layout>
        )
    }
}