import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Block, Button, Container, Form, Panel } from 'react-bulma-components';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { useSnackbar } from 'notistack';
import { useAuth } from '../Providers/UserProvider';
import { notifApiFetch } from '../notifapi';
import { useQuery } from '@tanstack/react-query';

function Login() {
  const { submitCode } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [phoneNumber, setPhoneNumber] = useState(
    localStorage.getItem('compNotify.phoneNumber') || ''
  );
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState<string>('');
  const [setError] = useState<undefined | string>();

  useQuery({
    queryKey: ['session'],
    queryFn: () => notifApiFetch('/v0/internal/auth/session'),
    onSuccess: (data) => {
      if (data.session) {
        setCodeSent(data.session.code);
        setPhoneNumber(data.session.number);
      }
    },
  });

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
        enqueueSnackbar((e as Error).message, { variant: 'error' });
      }
    },
    [phoneNumber]
  );

  useEffect(() => {
    if (code && code.length === 6) {
      handleSubmitCode();
    }
  }, [code]);

  const handleSubmitCode = useCallback(
    async (e?: FormEvent<HTMLFormElement>) => {
      e?.preventDefault();

      if (!code) {
        setError('Please enter a code');
        return;
      }

      submitCode?.mutate(code, {
        onError: (e) => {
          enqueueSnackbar(e.message, { variant: 'error' });
        },
      });
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
              No password required. You'll be sent a text message with a code to
              login with.
            </Block>
            <Block style={{ width: '100%' }}>
              <form onSubmit={(e) => void handleSubmitNumber(e)}>
                <Form.Field>
                  <Form.Control>
                    <Form.Label>Phone Number</Form.Label>
                    <PhoneInput
                      defaultCountry="US"
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
                    You were sent you a code. Enter it below to login.
                  </Block>
                  <form onSubmit={(e) => void handleSubmitCode(e)}>
                    <Form.Field>
                      <Form.Control>
                        <Form.Label>Code</Form.Label>
                        <Form.Input
                          type="tel"
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
