// @flow

import './Logged.scss';

import React, { Component } from 'react';
import { Route, Switch, NavLink, Redirect } from 'react-router-dom';
import { observable, reaction } from 'mobx';
import { observer, Provider } from 'mobx-react';
import ReactTooltip from 'react-tooltip';

import Loader from 'components/Loader';
import Avatar from 'components/Avatar';
import PersonModal from 'components/PersonModal';

import NotFound from '../NotFound';
import Home from './screens/Home';
import Matches from './screens/Matches';
import Person from './screens/Person';
import History from './screens/History';
import Discussion from './screens/Discussion';
import Settings from './screens/Settings';

import currentUser from 'models/CurrentUser';
import recsStore from 'stores/RecsStore';
import matchStore from 'stores/MatchStore';

import { purge } from 'utils/database.v2';
import LS from 'utils/localStorage';
import { purge as runtimePurge, getFacebookToken} from 'utils/runtime';

import type { RouterHistory, Location } from 'react-router-dom';

type PropsType = {
  location: Location,
  history: RouterHistory,
};

const onFocus = () => currentUser.fetch();

@observer
class Welcome extends Component {
  props: PropsType;

  loggedHandler: () => void;
  previousLocation: Object;

  @observable isModalVisible: boolean = false;

  constructor(props: PropsType) {
    super(props);
    this.previousLocation = props.location;

    this.loggedHandler = reaction(
      () => ({ id: currentUser._id, isAuthenticated: currentUser.is_authenticated }),
      ({ isAuthenticated }) => {
        if (isAuthenticated === true) {
          this.onSuccesLogin();
        } else if (isAuthenticated === false) {
          this.onErrorLogin();
        }
      },
    );
  }

  componentDidMount() {
    currentUser.fetch();
  }

  componentWillUpdate(nextProps: PropsType) {
    const { location } = this.props;
    // set previousLocation if props.location is not modal
    if (
      nextProps.history.action !== 'POP' &&
      (!location.state || !location.state.modal)
    ) {
      this.previousLocation = this.props.location;
    }
  }

  componentWillUnmount() {
    this.loggedHandler();

    window.onfocus = n => n;
  }

  onErrorLogin() {
    window.onfocus = onFocus;
  }

  onSuccesLogin() {
    matchStore.getFromDb();
    matchStore.initUpdater(() => {
      currentUser.is_authenticated = false;
      matchStore.destroyUpdater();
    });

    matchStore.setCurrentUserId(currentUser._id);

    window.onfocus = n => n;

    window.ms = matchStore;
  }

  handleLogout = () => {
    purge();
    runtimePurge();
    LS.clear();

    this.props.history.replace('/welcome');
  }

  handleConnect = () => {
    getFacebookToken();
  }

  renderWhenLogged() {
    const { location } = this.props;
    const isModal = !!(
      location.state &&
      location.state.modal &&
      this.previousLocation !== location // not initial render
    );

    return (
      currentUser.is_authenticated ? (
        <div className="logged">
          <Switch location={isModal ? this.previousLocation : location}>
            <Route exact path="/" component={Home} />
            <Route path="/home" component={Home} />
            <Route path="/matches" component={Matches} />
            <Route path="/history" component={History} />
            <Route path="/discussion" component={Discussion} />
            <Route path="/settings" component={Settings} />
            <Route path="/user/:id" component={Person} />
            <Route component={NotFound} />
          </Switch>

          {isModal ? <Route path="/user/:id" component={PersonModal} /> : null}
        </div>
      ) : (
        <div className="not-logged">
          <h1>Your Tinder session has expired or first visit. <br />Refresh it here:</h1>
          <button className="button blue" onClick={this.handleConnect}>Refresh</button>
        </div>
      )
    );
  }

  render() {
    return (
      <Provider currentUser={currentUser} matchStore={matchStore}>
        <div className="logged">
          <ReactTooltip id="main" place="top" effect="solid" />
          <div className="logged__nav-bar">
            <ul>
              <li>
                <div className="logo">
                  <div className="logo-m-white" />
                </div>
              </li>
              <li>
                <NavLink to="/home" activeClassName="active">
                  <i className="fa fa-home" />
                </NavLink>
              </li>
              <li>
                <NavLink to="/matches" activeClassName="active">
                  <div className="badge">
                    <i className="fa fa-heart" />
                    {!!matchStore.unreadCount && <span>{matchStore.unreadCount}</span>}
                  </div>
                </NavLink>
              </li>
              <li>
                <NavLink to="/history" activeClassName="active">
                  <i className="fa fa-history" />
                </NavLink>
              </li>
              <li>
                <NavLink to="/settings" activeClassName="active">
                  <i className="fa fa-cog" />
                </NavLink>
              </li>
              <li>
                <NavLink to="/discussion" activeClassName="active">
                  <i className="fa fa-comments-o" />
                </NavLink>
              </li>
              <li className="separator" />
              <li className="profile">
                <NavLink to={`/user/${currentUser._id}`} activeClassName="active">
                  {currentUser.avatarUrl && <Avatar url={currentUser.avatarUrl} />}
                  <div className="name">
                    {currentUser.name}
                  </div>
                  {currentUser.plusAccount && <div className="profile__plus">Plus!</div>}
                </NavLink>
              </li>
              <li>
                <div
                  className="logout"
                  onClick={this.handleLogout}
                  data-tip="Logout"
                  data-for="main"
                >
                  <i className="fa fa-sign-out" />
                </div>
              </li>
            </ul>
          </div>
          <div className="logged__content">
            {currentUser.is_fetching && !currentUser.is_authenticated && <Loader />}
            {!currentUser.is_fetching && this.renderWhenLogged()}
          </div>
        </div>
      </Provider>
    );
  }
}

export default Welcome;
