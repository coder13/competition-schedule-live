import { Panel } from 'react-bulma-components';
import styled from 'styled-components';

export default styled(Panel.Block)`
  display: flex;
  align-items: flex-start;
  flex-direction: row;
  :hover {
    cursor: pointer;
    background-color: rgba(0, 0, 0, 0.05);
  }
`;
