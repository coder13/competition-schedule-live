import { Block, Button, Menu, Panel, Section } from 'react-bulma-components';
import { formatPhoneNumber } from 'react-phone-number-input';
import { Link } from 'react-router-dom';
import { useAuth } from '../Providers/UserProvider';

function Home() {
  const { user } = useAuth();

  return (
    <Section>
      <Block className="has-text-justified">
        <p>Hello</p>
        {user?.phoneNumber && (
          <p>Signed in with number {formatPhoneNumber(user?.phoneNumber)}</p>
        )}
      </Block>
      <hr />
      <Menu>
        <Menu.List title="My Notifications">
          <Menu.List.Item renderAs={Link} to="/profile/notifications">
            Manage Current
          </Menu.List.Item>
        </Menu.List>
        <Menu.List title="More Notifications">
          <Menu.List.Item renderAs={Link} to="/competitions">
            Search Competitions
          </Menu.List.Item>
          <Menu.List.Item renderAs={Link} to="/competitors">
            Search Competitors
          </Menu.List.Item>
        </Menu.List>
        <Menu.List title={<hr />}>
          <Menu.List.Item
            onClick={() => {
              console.log('Logging out...');
            }}>
            Logout
          </Menu.List.Item>
        </Menu.List>
      </Menu>
    </Section>
  );
}

export default Home;
