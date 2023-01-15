import { FormEvent, useCallback, useState } from 'react';
import { Block, Button, Container, Form, Panel } from 'react-bulma-components';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { useSnackbar } from 'notistack';

function Login() {
  const { enqueueSnackbar } = useSnackbar();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<undefined | string>();

  console.log(phoneNumber);

  const handleSubmitNumber = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const res = await fetch(
        `${import.meta.env.VITE_NOTIFAPI_ORIGIN}/auth/number`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            number: phoneNumber,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        setError(err.message);
        enqueueSnackbar(err.message, { variant: 'error' });
        return;
      }

      setCodeSent(true);
    },
    [phoneNumber]
  );

  const handleSubmitCode = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const res = await fetch(
        `${import.meta.env.VITE_NOTIFAPI_ORIGIN}/auth/number/code`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        setError(err.message);
        enqueueSnackbar(err.message, { variant: 'error' });
        return;
      }
    },
    [phoneNumber]
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
                  <Button>Send Code</Button>
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
