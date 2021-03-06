// @flow

import './ShortcutIcon.scss';

import React from 'react';

type PropsType = {
  text: string,
  tooltipText: string,
};

const ShortcutIcon = ({ text, tooltipText }: PropsType) => (
  <span className="shortcut-icon" data-for="main" data-tip={tooltipText}>{text}</span>
);

export default ShortcutIcon;
