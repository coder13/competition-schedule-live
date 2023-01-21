import { FormEventHandler, useState } from 'react';

interface LoginPageProps {
  setJwt: (x: string) => void;
}

function Login({ setJwt }: LoginPageProps) {
  const [input, setInput] = useState('');

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setJwt(input);
  };

  return (
    <>
      <p>Enter your jwt to continue:</p>
      <p>
        Click <a target="_blank">here</a> to get your jwt
      </p>
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={(e) => setInput(e.target.value)} />
      </form>
    </>
  );
}

export default Login;
