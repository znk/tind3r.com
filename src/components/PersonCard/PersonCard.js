// @flow

import './PersonCard.scss';

import React from 'react';
import { observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import { compose, withHandlers, withState, pure, mapProps } from 'recompose';
import cx from 'classnames';
import map from 'lodash/map';

import Gallery from 'components/Gallery';
import ActionButtons from 'components/ActionButtons';

import withHotkeys from 'hoc/withHotkeys';
import { ACTION_TYPES } from 'const';

import Person from 'models/Person';

import type { ActionsType } from 'types/person';

const keyCodes = { d: 68, s: 83, a: 65 };

const callAction = (props, actionType: ActionsType) => {
  props.onButtonClick({
    type: actionType,
    name: props.person.name,
    _id: props.person._id,
  });

  props.person.callAction(actionType, props.onSuperlike, props.onMatch, props.onError);
};

const enhance = compose(
  mapProps(({ limitations, ...props }) => ({
    ...props,
    limitations,
    isLikeDisabled: !!limitations.likeResetsAt,
    isSuperlikeDisabled: limitations.superlikeRemaining === 0 && !!limitations.superlikeResetsAt,
  })),
  withState('isHovering', 'toggleHover', false),
  withHotkeys({
    [keyCodes.d]: props => {
      if (props.isLikeDisabled) return;
      callAction(props, ACTION_TYPES.LIKE);
    },
    [keyCodes.s]: props => {
      if (props.isSuperlikeDisabled) return;
      callAction(props, ACTION_TYPES.SUPERLIKE);
    },
    [keyCodes.a]: props => {
      callAction(props, ACTION_TYPES.PASS);
    },
  }),
  withHandlers({
    onActionClick: props => (actionType: ActionsType) => {
      callAction(props, actionType);
    },
    onCardMouseEnter: ({ toggleHover }) => () => toggleHover(true),
    onCardMouseLeave: ({ toggleHover }) => () => toggleHover(false),
  }),
  pure,
);

const renderInstagramLink = (link, name, small) => (
  <a href={link} target="_blank" title={name}>
    <i className="fa fa-instagram" />
    {!small && <div className="instaname">{name}</div>}
  </a>
);

type PersonCardType = {
  person: Person,
  small?: boolean,
  isHovering: boolean,
  onButtonClick: (payload: Object) => void,
  onCardMouseEnter: Function,
  onCardMouseLeave: Function,
  onActionClick: (type: ActionsType) => void,
  onError: (reason: ActionsType) => void,
  isLikeDisabled: boolean,
  isSuperlikeDisabled: boolean,
  limitations: {
    superlikeRemaining: number,
    superlikeResetsAt: ?string,
    likeResetsAt: ?string,
  }
};

const PersonCard = ({
  person, small, onActionClick, onCardMouseEnter, onCardMouseLeave, isHovering,
  limitations: { superlikeRemaining, superlikeResetsAt, likeResetsAt },
  isLikeDisabled, isSuperlikeDisabled,
}: PersonCardType) => {
  const shouldShowActionButtons = !small || (small && isHovering);
  const hasInterests = person.common_interests && person.common_interests.length > 0;

  return (
    <div
      className={cx('person-card', { 'person-card--large': !small })}
      onMouseEnter={onCardMouseEnter}
      onMouseLeave={onCardMouseLeave}
      onMouseOver={onCardMouseEnter}
      onMouseMove={onCardMouseEnter}
    >
      <div className="person-card__gallery">
        <Gallery
          withArrowNav={false}
          scrolling={!small}
          images={person.photos}
          width={small ? 220 : 400}
        />
      </div>
      <div className="person-card__content">
        <div className="person-card__name">
          <Link
            to={{
              pathname: `/user/${person._id}`,
              state: {
                modal: true,
                person: person.toJSON,
              },
            }}
          >
            {person.name}, {person.age}
          </Link>
        </div>
        <div className="person-card__bio">
          {person.bio}
        </div>
        {!small && hasInterests && <div className="person-card__common">
          Interests:
          {map(person.common_interests, i => <span key={i.name}>{i.name}</span>)}
        </div>}

        {!small && <div className="person-card__school">
          <span>{person.school}</span>
        </div>}
        <div className="person-card__employ">
          {!shouldShowActionButtons && <span>{person.school}</span>}
          {shouldShowActionButtons && <div className="person-card__employ__actions">
            <ActionButtons
              superLikeResetsAt={superlikeResetsAt}
              superlikeRemaining={superlikeRemaining}
              superlikeDisabled={isSuperlikeDisabled}
              likeResetsAt={likeResetsAt}
              likeDisabled={isLikeDisabled}
              onButtonClick={onActionClick}
              hideTimer={small}
              size={small ? 'small' : 'large'}
            />
          </div>}
        </div>

        <div className="person-card__footer">
          <div className="person-card__footer--distance">{person.distanceKm}</div>
          <div className="person-card__footer--instagram">
            {
              person.instagramProfileLink ?
              renderInstagramLink(person.instagramProfileLink, person.instagramUsername, small) :
              <i className="fa fa-instagram" />
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default enhance(observer(PersonCard));
