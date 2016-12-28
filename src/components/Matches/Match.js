import React, { Component } from 'react';
import CSSModules from 'react-css-modules'
import autobind from 'autobind-decorator'
import _ from 'lodash'
import cx from 'classnames'
import { observer } from 'mobx-react'
import styles from './match.scss'
import MatchStore from '../../stores/MatchStore'
import Data from '../../data'

@observer
@CSSModules(styles)
export default class Match extends Component {
  constructor(props) {
    super(props)
  }

  @autobind
  handleSelect() {
    const { match } = this.props
    this.props.handleSelect(match.id)
  }

  @autobind
  remove() {
    const { match } = this.props
    Data.db().matches.where('_id').equals(match.id).delete()
  }

  renderLastMessageContent() {
    const { match } = this.props
    const { last } = match.messageStore

    return last.type === 'gif' ? '[ GIF ]' : last.message
  }

  renderIcon() {
    const { match } = this.props

    if (!match.messageStore.last.message) {
      return null
    }

    if (match.messageStore.last.isAuthor) {
      return <i className="fa fa-arrow-down" aria-hidden="true" />
    }

    return <i className="fa fa-arrow-up" aria-hidden="true"></i>
  }

  renderTypeIcon() {
    const { match } = this.props

    if (match.isSuperLike) {
      return <i className="fa fa-star" />
    }

    if (match.isBoostMatch) {
      return <i className="fa fa-bolt" />
    }

    if (match.isBlocked) {
      return <i className="fa fa-ban" />
    }

    return null
  }

  render() {
    const { match } = this.props
    const className = cx({
      unread: match.areUnread,
      'super': match.isSuperLike,
      blocked: match.isBlocked,
    })

    return (
      <div styleName="match" className={className} onClick={this.handleSelect}>
        <div styleName="type-icon">{this.renderTypeIcon()}</div>
        <div styleName="avatar">
          <img src={match.user.photos[0].url} />
        </div>
        <div styleName="name">{match.user.name}</div>
        <div styleName="message">
          <span>{this.renderIcon()} {this.renderLastMessageContent()}</span>
          <div styleName="date">{match.ago}</div>
        </div>
      </div>
    );
  }
}