import { FormEvent, useCallback, useState } from 'react';
import { Block, Button, Container, Form, Panel } from 'react-bulma-components';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { useSnackbar } from 'notistack';
import { useAuth } from '../Providers/UserProvider';
import { notifApiFetch } from '../notifapi';

function Login() {
  const { enqueueSnackbar } = useSnackbar();
  const { setUser } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState(
    localStorage.getItem('compNotify.phoneNumber') || ''
  );
  const [codeSent, setCodeSent] = useState(
    JSON.parse(localStorage.getItem('compNotify.codeSent') || 'false')
  );
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<undefined | string>();

  const handleSubmitNumber = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      localStorage.setItem('compNotify.phoneNumber', phoneNumber);

      try {
        await notifApiFetch('/v0/internal/auth/number', {
          method: 'POST',
          body: JSON.stringify({
            number: phoneNumber,
          }),
        });

        localStorage.setItem('compNotify.codeSent', 'true');
        setCodeSent(true);
      } catch (e) {
        console.error(e);
      }
    },
    [phoneNumber]
  );

  const handleSubmitCode = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!code) {
        setError('Please enter a code');
        return;
      }

      try {
        const { user } = await notifApiFetch('/v0/internal/auth/number/code', {
          method: 'POST',
          body: JSON.stringify({
            code,
          }),
        });

        if (user) {
          setUser(user as User);
        }
      } catch (e) {
        console.error(e);
      }
    },
    [code]
  );

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
        <Panel.Header style={{ backgroundColor: '#efefef' }}>
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
              <form onSubmit={(e) => void handleSubmitNumber(e)}>
                <Form.Field>
                  <Form.Control>
                    <Form.Label>Phone Number</Form.Label>
                    <PhoneInput
                      placeholder="Enter phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e || '')}
                    />
                  </Form.Control>
                </Form.Field>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button>{codeSent ? 'Resend Code' : 'Send Code'}</Button>
                </div>
              </form>
              {codeSent ? (
                <>
                  <Block style={{ marginTop: '1em' }}>
                    We sent you a code. Enter it below to login.
                  </Block>
                  <form onSubmit={(e) => void handleSubmitCode(e)}>
                    <Form.Field>
                      <Form.Control>
                        <Form.Label>Code</Form.Label>
                        <Form.Input
                          type="text"
                          placeholder="Enter code"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                        />
                      </Form.Control>
                    </Form.Field>
                  </form>
                </>
              ) : null}
            </Block>
          </Panel.Block>
        </Panel>
      </Container>
    </div>
  );
}

export default Login;
