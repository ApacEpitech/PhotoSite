import React from "react";
import {Layout, Card, Row, Col} from 'antd';
import 'antd/dist/antd.css';
import "./home.css";
import axios from "axios";
import Select from "react-dropdown-select";

const {Content, Footer} = Layout;

export default class Home extends React.Component {

    state = {
        images: [],
        categories: [],
        categoriesSelected: [],
        destinations: [],
        destinationsSelected: [],
        sub_categories: [],
        sub_categories_selected: []
    };

    componentDidMount() {
        axios.get('http://localhost:5000/categories').then(res => {
            this.setState({categories: res.data});
        });
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
                                        labelField={'title'}
                                        loading={true}
                                        searchBy={'title'}
                                        multi={true}
                                        valueField={'CategoryID'}
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
                        </div>

                    </Content>
                    <Footer style={{textAlign: 'center'}}>Designed By CUEVAS Alexandre</Footer>
                </Layout>
            </Layout>)
    }
}