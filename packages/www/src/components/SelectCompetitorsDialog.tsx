import { Modal } from 'react-bulma-components';
import { useParams } from 'react-router-dom';
import useWCIF from '../hooks/useWCIF';
import { List, ListItem } from './List';

interface SelectCompetitorsDialogProps {
  open: boolean;
  onClose: () => void;
}

function SelectCompetitorsDialog({
  open,
  onClose,
}: SelectCompetitorsDialogProps) {
  const params = useParams();
  const competitionId = params.competitionId as string; // It is *going* to exist
  const { wcif } = useWCIF(competitionId);

  return (
    <Modal show={open} onClose={onClose} showClose={false}>
      <Modal.Card>
        <Modal.Card.Header>
          <Modal.Card.Title>Select Competitors</Modal.Card.Title>
        </Modal.Card.Header>
        <Modal.Card.Body>
          <List>
            {wcif?.persons?.map((person) => (
              <ListItem key={person.registrantId} primaryText={person.name} />
            ))}
          </List>
        </Modal.Card.Body>
      </Modal.Card>
    </Modal>
  );
}

export default SelectCompetitorsDialog;
