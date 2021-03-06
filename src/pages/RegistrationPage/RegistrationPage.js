import './RegistrationPage.css';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

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
import { USER_URL } from 'Constants';
import { validateEmail, validatePassword, validateName, makeRequest } from 'Utils';

export const RegistrationPage = () => {
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const snackBarHideDelay = useRef(3000).current;

  const resetForm = useCallback(() => {
    setName('');
    setEmail('');
    setPassword('');
    setRepeatPassword('');
  }, []);

  useEffect(() => {
    if (registrationStatus === 'success') {
      resetForm();
    }
  }, [registrationStatus]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (isLoading) {
        return;
      }
      try {
        setIsLoading(true);

        const response = await makeRequest({
          url: USER_URL,
          method: 'POST',
          expectedStatuses: [201],
          body: JSON.stringify({ name, email, password }),
        });

        const userId = await response.json();

        setIsLoading(false);

        if (userId) {
          setRegistrationStatus('success');
          return;
        }
        throw new Error();
      } catch (error) {
        setIsLoading(false);
        setRegistrationStatus('error');
      }
    },
    [isLoading, name, email, password]
  );

  const inputsModel = useMemo(
    () => [
      {
        isError: validateName(name),
        id: 'registration-page-text-field__name',
        label: 'form.label.name',
        errorText: 'form.error.name',
        type: 'text',
        onChange: (e) => setName(e.target.value),
        value: name,
      },
      {
        isError: validateEmail(email),
        id: 'registration-page-text-field__email',
        label: 'form.label.email',
        errorText: 'form.error.email',
        type: 'text',
        onChange: (e) => setEmail(e.target.value),
        value: email,
      },
      {
        isError: validatePassword(password),
        id: 'registration-page-text-field__password',
        label: 'form.label.password',
        errorText: 'form.error.password',
        type: 'password',
        onChange: (e) => setPassword(e.target.value),
        value: password,
      },
      {
        isError: !!password && !!repeatPassword && password !== repeatPassword,
        id: 'registration-page-text-field__password-repeat',
        label: 'form.label.password.repeat',
        errorText: 'form.error.password.repeat',
        type: 'password',
        onChange: (e) => setRepeatPassword(e.target.value),
        value: repeatPassword,
      },
    ],
    [name, email, password, repeatPassword]
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
    () =>
      !name || !email || !password || !repeatPassword || inputsModel.some(({ isError }) => isError),
    [name, email, password, repeatPassword]
  );

  const header = useMemo(() => <Header />, []);

  const spinner = useMemo(() => (isLoading ? <Spinner /> : null), [isLoading]);

  const content = useMemo(
    () => (
      <section className='registration-page__content'>
        <form onSubmit={(e) => !isInvalid && handleSubmit(e)} className='registration-page__form'>
          {inputsModel.map((inputModel) => renderInput(inputModel))}
          <Button
            type='submit'
            disabled={isInvalid}
            color='secondary'
            variant='contained'
            disableElevation
            endIcon={spinner}
          >
            {t('link.registration')}
          </Button>
        </form>
      </section>
    ),
    [t, isLoading, name, email, password, repeatPassword]
  );

  const snackBar = useMemo(
    () => (
      <Snackbar
        className='registration-page__snackbar'
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={!!registrationStatus}
        autoHideDuration={snackBarHideDelay}
        onClose={() => setRegistrationStatus(null)}
      >
        {registrationStatus ? (
          <Alert
            onClose={() => setRegistrationStatus(null)}
            severity={registrationStatus}
            variant='filled'
          >
            {t(`registration.${registrationStatus}`)}
          </Alert>
        ) : null}
      </Snackbar>
    ),
    [registrationStatus, t]
  );

  return (
    <Page>
      <main className='registration-page__container'>
        {header}
        {content}
        {snackBar}
      </main>
    </Page>
  );
};
