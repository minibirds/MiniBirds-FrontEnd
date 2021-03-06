import React, { Component } from "react";
import Main from "../MainPage/Main";
import Mypage from "../Mypage/Mypage";
import axios from "axios";
import { BrowserRouter, Route, Switch, withRouter } from "react-router-dom";
import Header from "../../Components/Share/Header";
import base_url from "../../base_url";
class MainService extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.CheckToken();
    this.handleConnect();
  }

  //토큰이 있는지 없는지 검사하는 함수
  CheckToken = () => {
    const { history } = this.props;
    if (localStorage.getItem("token") === "") {
      history.push("/signin");
    }
  };

  //사용자의 아이디, 닉네임, 패스워드, 정보를 가져오는 함수
  handleConnect = () => {
    axios
      .get(`${base_url}/auth/token`, {
        headers: {
          token: `${localStorage.getItem("token")}`
        }
      })
      .then(res => {
        this.props.getUserData(
          res.data.id,
          res.data.nickname,
          res.data.password,
          res.data.intro
        );
      })
      .catch(res => {
        this.setState({
          isError: true
        });
        console.log(res);
        console.log("에러");
      });
  };

  render() {
    const { history, id, nickname } = this.props;
    return (
      <div className="main-service">
        <BrowserRouter>
          <React.Fragment>
            <Header history={history} />
            <Switch>
              <Route
                path="/"
                component={() => <Main id={id} nickname={nickname} />}
                exact
              />
              <Route path="/mypage" component={Mypage} exact />
            </Switch>
          </React.Fragment>
        </BrowserRouter>
      </div>
    );
  }
}

export default withRouter(MainService);
