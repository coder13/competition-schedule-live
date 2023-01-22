import { formatDateRange } from '@notifycomp/frontend-common/lib';
import React from 'react';
import { Panel } from 'react-bulma-components';
import FlagIconFactory from 'react-flag-icon-css';
import { Link } from 'react-router-dom';
import { Competition } from '../generated/graphql';
import PanelBlockWithHover from './PanelBlockWithHover';

const FlagIcon = FlagIconFactory(React, { useCssModules: false });

interface CompetitionListProps {
  competitions: Competition[];
}

function CompetitionList({ competitions }: CompetitionListProps) {
  return (
    <Panel>
      {competitions.map((competition) => (
        <PanelBlockWithHover
          renderAs={Link}
          key={competition.id}
          to={competition.id}
          relative="path">
          <div
            style={{
              padding: '0.5em',
              paddingLeft: 0,
              height: '100%',
              textAlign: 'center',
            }}>
            <FlagIcon
              code={competition.country.toLowerCase()}
              size="2x"
              className="is-size-3"
            />
          </div>
          <div>
            <span className="is-size-6">{competition.name}</span>
            <br />
            <span className="is-size-7">
              {formatDateRange(competition.startDate, competition.endDate)}
            </span>
          </div>
        </PanelBlockWithHover>
      ))}
    </Panel>
  );
}

export default CompetitionList;
