import { useState } from 'react';
import { Block, Container, Form, Panel } from 'react-bulma-components';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';

function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');

  console.log(phoneNumber);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        flex: 1,
        height: '100%',
        margin: '1em',
        marginTop: '-5em',
      }}>
      <Container breakpoint="tablet" className="is-flex-grow-0">
        <Panel.Header style={{ backgroundColor: '#4CC9F0' }}>
          Login using your phone
        </Panel.Header>
        <Panel>
          <Panel.Block
            className="is-flex is-flex-direction-column"
            style={{ backgroundColor: 'white' }}>
            <Block>
              No password required. We'll send you a text message with a code to
              login with.
            </Block>
            <Block style={{ width: '100%' }}>
              <Form.Field>
                <Form.Control>
                  <Form.Label>Phone Number</Form.Label>
                  <PhoneInput
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={setPhoneNumber}
                  />
                </Form.Control>
              </Form.Field>
            </Block>
          </Panel.Block>
        </Panel>
      </Container>
    </div>
  );
}

export default Login;
