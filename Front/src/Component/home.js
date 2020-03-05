import React from "react";
import {Layout, Card, Row, Col} from 'antd';
import 'antd/dist/antd.css';
import "./home.css";
import Select from "react-dropdown-select";

const {Content, Footer} = Layout;

export default class Home extends React.Component {

    state = {
        tasks: [],
        categories: [],
        categoriesSelected: [],
        destinations: []
    };

    componentDidMount() {
        this.setState({categories: [{id: 0, name: ' '}, {id: 1, name: 'Musée'}, {id: 2, name: 'Monuments'}]});
    }

    setValues = categoriesSelected => this.setState({categoriesSelected});

    render() {
        return (
            <Layout>
                <Layout>
                    <Content style={{margin: '24px 16px 0', overflow: 'initial'}}>
                        <div style={{padding: 24, background: '#fff', textAlign: 'center'}}>
                            <div style={{display: "inline"}}>
                                <h3 style={{display: "inline", float: "left"}}>Photos</h3>
                            </div>
                            <div style={{display: "inline"}}>
                                <Select onChange={(values) => this.setValues(values)}
                                        options={this.state.categories}
                                        labelField={'name'}
                                        loading={true}
                                        searchBy={'name'}
                                        multi={true}
                                        valueField={'id'}
                                        clearable={true}
                                        values={this.state.categoriesSelected}/>
                                <Select onChange={(values) => this.setValues(values)}
                                        options={this.state.categories}
                                        labelField={'name'}
                                        loading={true}
                                        searchBy={'name'}
                                        multi={true}
                                        valueField={'id'}
                                        clearable={true}
                                        values={this.state.categoriesSelected}/>
                            </div>
                            <br/>

                            <Row>
                                {
                                    this.state.tasks.map(task =>
                                        <Col span={8}>
                                            <Card bordered={true} style={{width: 300, marginBottom: '2%'}}
                                                  title={task.title}>
                                                <br/>
                                                <p>{task.content}</p>
                                            </Card>
                                        </Col>
                                    )
                                }
                            </Row>
                        </div>

                    </Content>
                    <Footer style={{textAlign: 'center'}}>Designed By CUEVAS Alexandre</Footer>
                </Layout>
            </Layout>)
    }
}