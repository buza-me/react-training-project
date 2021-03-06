import './LoginPage.css';
import React, { useState, useContext, useCallback, useMemo, useRef } from 'react';

import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Snackbar from '@material-ui/core/Snackbar';

import Alert from '@material-ui/lab/Alert';

import { Page } from 'Containers';
import { Header, Spinner, PasswordInput } from 'Components';
import { useTranslation } from 'react-i18next';
import { LOGIN_URL, FILES_ROUTE } from 'Constants';
import { validateEmail, validatePassword, makeRequest } from 'Utils';
import { LoginContext } from 'Contexts';
import { Redirect } from 'react-router-dom';

export const LoginPage = () => {
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [loginStatus, setIsLoginStatus] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { logIn } = useContext(LoginContext);

  const snackBarAutoHide = useRef(3000).current;

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (isLoading) {
        return;
      }
      try {
        setIsLoading(true);

        const response = await makeRequest({
          url: LOGIN_URL,
          method: 'POST',
          expectedStatuses: [201],
          body: JSON.stringify({ email, password }),
        });

        const parsedResponse = await response.json();

        if (!parsedResponse) {
          throw new Error();
        }

        const { access_token: token, userId, willExpireTime } = parsedResponse;

        setIsLoading(false);
        logIn({ token, willExpireTime, userId });
        setIsLoginStatus('success');
      } catch (error) {
        setIsLoading(false);
        setIsLoginStatus('error');
      }
    },
    [isLoading, email, password]
  );

  const inputsModel = useMemo(
    () => [
      {
        isError: validateEmail(email),
        id: 'login-page-text-field__email',
        label: 'form.label.email',
        errorText: 'form.error.email',
        type: 'email',
        onChange: (e) => setEmail(e.target.value),
        value: email,
      },
      {
        isError: validatePassword(password),
        id: 'login-page-text-field__password',
        label: 'form.label.password',
        errorText: 'form.error.password',
        type: 'password',
        onChange: (e) => setPassword(e.target.value),
        value: password,
      },
    ],
    [email, password]
  );

  const renderInput = useCallback(
    ({ isError, errorText, onChange, id, label, type, value }) => (
      <FormControl error={isError} key={id}>
        <InputLabel htmlFor={id}>{t(label)}</InputLabel>
        {type !== 'password' ? (
          <Input
            required
            id={id}
            type={type}
            onChange={onChange}
            color='primary'
            autoComplete='off'
            value={value}
          />
        ) : (
          <PasswordInput
            required
            id={id}
            onChange={onChange}
            color='primary'
            autoComplete='off'
            value={value}
          />
        )}
        {isError ? <FormHelperText>{t(errorText)}</FormHelperText> : null}
      </FormControl>
    ),
    [t]
  );

  const isInvalid = useMemo(
    () => !email || !password || inputsModel.some(({ isError }) => isError),
    [email, password]
  );

  const header = useMemo(() => <Header />, []);

  const spinner = useMemo(() => (isLoading ? <Spinner /> : null), [isLoading]);

  const content = useMemo(
    () => (
      <section className='login-page__content'>
        <form onSubmit={(e) => !isInvalid && handleSubmit(e)} className='login-page__form'>
          {inputsModel.map((inputModel) => renderInput(inputModel))}
          <Button
            type='submit'
            disabled={isInvalid}
            color='secondary'
            variant='contained'
            disableElevation
            endIcon={spinner}
          >
            {t('link.login')}
          </Button>
        </form>
      </section>
    ),
    [isLoading, email, password, t]
  );

  const loginStatusDependentNodes = useMemo(
    () => (
      <>
        <Snackbar
          className='login-page__snackbar'
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={loginStatus === 'error'}
          autoHideDuration={snackBarAutoHide}
          onClose={() => setIsLoginStatus(null)}
        >
          {loginStatus === 'error' ? (
            <Alert onClose={() => setIsLoginStatus(null)} severity='error' variant='filled'>
              {t('login.error')}
            </Alert>
          ) : null}
        </Snackbar>
        {loginStatus === 'success' ? <Redirect to={FILES_ROUTE} /> : null}
      </>
    ),
    [t, loginStatus]
  );

  return (
    <Page>
      <main className='login-page__container'>
        {header}
        {content}
        {loginStatusDependentNodes}
      </main>
    </Page>
  );
};
