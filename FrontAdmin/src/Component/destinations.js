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

export default class Destinations extends React.Component {

    state = {
        destinations: [],
        destinationToUpdate: {},
        destination_parent: [],
        destinationsTree: TreeState.createEmpty(),
        load: true,
        visibleNewDestination: false,
        visibleUpdateDestination: false,
        uploadDone: false,
        titleToUpdate: ""
    };

    header;

    componentDidMount() {
        if (Cookies.get('jwt') !== undefined && Cookies.get('jwt') !== "") {
            this.header = {headers: {"Authorization": 'Bearer ' + Cookies.get('jwt')}};
            axios.get('http://www.holy-driver.tools:4000/destinations').then(async res => {
                this.setState({destinations: res.data});
                await this.convertDestinationsToTree();
                this.setState({uploadDone: true});
            }).catch(err => {
                console.error(err);
            });
        } else {
            window.location = 'login';
        }
    }

    async convertDestinationsToTree() {
        let all_dests = [];
        for (let dest of this.state.destinations) {
            let new_dest = {height: 40, data: {"DestinationID": dest['DestinationID'], "title": dest['title']}};
            if (dest['sub_destinations'] !== undefined && dest['sub_destinations'].length > 0) {
                new_dest['children'] = [];
                for (let sub_dest of dest['sub_destinations']) {
                    new_dest['children'].push({
                        height: 40,
                        data: {
                            "DestinationID": sub_dest['DestinationID'],
                            "title": sub_dest['title']
                        }
                    });
                }
            }
            all_dests.push(new_dest);
        }
        await this.setState({destinationsTree: TreeState.expandAll(TreeState.create(all_dests))});
    }

    renderTitleCell = (row) => {
        if (row.data !== undefined) {
            return (
                <div style={{paddingLeft: (row.metadata.depth * 50) + 'px'}}>
                    <Input type="text" style={{width: "80%"}} value={row.data.title} onChange={(e) => {
                        row.data.title = e.target.value;
                        this.setState(this.state.destinationsTree)
                    }}/>
                </div>
            );
        }
    };

    addChild = async () => {
        await this.setState({uploadDone: false});
        let dests = this.state.destinations;
        let new_dest = {'title': ' '};

        await axios.post(`http://www.holy-driver.tools:4000/destinations`, new_dest, this.header)
            .then(async res => {
                new_dest['DestinationID'] = res.data.DestinationID;
                toast.info("Catégorie créée");
            }).catch(err => {
                console.error(err);
                toast.error("Erreur lors de l'ajout");
        });
        dests.push(new_dest);
        await this.setState({destinations: dests});
        await this.setState({uploadDone: true});
        await this.convertDestinationsToTree();
    };

    renderButtonCell = (row) => {
        return (
            <div>
                <Icon type="check" style={{float: "right", fontSize: "20px", cursor: "pointer"}}
                      onClick={() => this.updateDestination(row.data)}/>
                <Icon type="delete" style={{float: "right", fontSize: "20px", cursor: "pointer"}}
                      onClick={() => this.deleteDestination(row.data.DestinationID)}/>
            </div>
        );
    };

    updateDestination = async (data) => {
        await this.setState({uploadDone: false});
        console.log(data);
        axios.put(`http://www.holy-driver.tools:4000/destinations`, data, this.header)
            .then(async () => {
                toast.info("Modification effectuée");
            }).catch(async () => {
                toast.error("Erreur lors de l'ajout");
            }
        );
        for (let dest of this.state.destinations) {
            if (dest.DestinationID === data.DestinationID) {
                dest.title = data.title;
            }
        }
        await this.setState({uploadDone: false});
    };

    deleteDestination = async (id) => {
        await this.setState({uploadDone: false});
        await axios.delete(`http://www.holy-driver.tools:4000/destinations/` + id, this.header)
            .then(async () => {
                let newDestinationsList = this.state.destinations;
                for (let i = 0; i < this.state.destinations.length; i++) {
                    if (this.state.destinations[i]['DestinationID'] === parseInt(id)) {
                        newDestinationsList.splice(i, 1);
                        break;
                    }
                }
                this.setState({destinations: newDestinationsList});
                await this.convertDestinationsToTree();
                toast.info("Catégorie supprimée");
            }).catch(err => {
                console.error(err);
                toast.error("Erreur lors de la suppression");
            });
        this.setState({uploadDone: true});
    };

    handleOnChange = (newValue) => {
        this.setState({destinationsTree: newValue});
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
                    <Menu theme="dark" mode="inline" defaultSelectedKeys={['3']}>
                        <Menu.Item key="1">
                            <Icon type="picture"/>
                            <span className="nav-text">Photos</span>
                            <Link to={"./photos"}/>
                        </Menu.Item>
                        <Menu.Item key="2">
                            <Icon type="unordered-list"/>
                            <span className="nav-text">Catégories</span>
                            <Link to={"./categories"}/>
                        </Menu.Item>
                        <Menu.Item key="3">
                            <Icon type="car"/>
                            <span className="nav-text">Destinations</span>
                        </Menu.Item>
                        <Menu.Item key="4">
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
                                <h3 style={{textAlign: "left"}}>Destinations</h3>
                            </div>
                            <div>
                                <Icon type="plus" style={{float: "right", fontSize: "20px", cursor: "pointer"}}
                                      onClick={() => this.addChild()}/>
                                <img alt="Loading" style={{float: "right"}}
                                     src=" https://apacphotosite.s3.eu-west-3.amazonaws.com/transparent-welcome-gif-background-3.gif"
                                     hidden={this.state.uploadDone}
                                     width={"2%"}/>
                            </div>
                            <br/>

                            <Row style={{height: "100%"}}>
                                <TreeTable value={this.state.destinationsTree}
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