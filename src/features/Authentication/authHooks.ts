import { useCallback } from 'react';
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query';
import { useDispatch, useSelector } from 'react-redux';

import { useAppDispatch } from '../../hooks/useAppDispatch';
import { logger } from '../../../utils';
import { storage, STORAGE_KEYS } from '../../../helpers/storage';

import {
  useConfirmLoginMutation,
  useAuthenticateMutation,
  useConfirmRegistrationSmsMutation,
  useRegisterMobileUserMutation,
  useValidateIdentityMutation,
  useConfirmLoginSmsMutation,
  useUpdatePasscodeMutation,
  useRequestSmsCodeMutation,
} from '../../../services/alphapoint/authApi';
import { LastUsedService } from '../../../services/lastUsed';
import { useAuthenticateMerchantPOSUserMutation } from '../../../services/alphapoint/posApi';

import {
  ConfirmLoginRequestType,
  ConfirmRegistrationSmsRequestType,
  RegisterMobileUserRequestType,
  UpdatePasscodeRequestType,
  RequestSmsCodeRequestType,
} from '../../../types/alphapoint/apiRequests';
import { PostResponseType } from '../../../types/alphapoint/apiResponses';
import { AuthProfileType } from '../types';

import {
  setApiConnection,
  setSessionToken,
} from '../../../stores/apiConnectionSlice';
import { setAuthenticated } from '../../../stores/appStateSlice';
import { selectUser, setAccountId, setUser } from '../../../stores/userSlice';
import { setPosUser } from '../../../stores/posUserSlice';

export function useConfirmLoginSms() {
  const user = useSelector(selectUser);

  const [mutate, queryData] = useConfirmLoginSmsMutation();

  const confirmLoginSms = useCallback(
    async ({ Code, PinRecovery }: { Code: string; PinRecovery: boolean }) => {
      if (user?.phoneNumber && user?.userId) {
        logger('debug', 'Start validate code', 'AuthHooks.useConfirmLoginSms');
        try {
          await mutate({
            MobileNumber: user.phoneNumber,
            UserId: user.userId,
            Code,
            PinRecovery,
          }).unwrap();
        } catch (err) {
          logger('error', err, 'AuthHooks.useConfirmLoginSms');
          throw err;
        }
      }
    },
    [mutate, user],
  );

  return [confirmLoginSms, queryData] as const;
}

export function useRegisterPhoneSaveUser() {
  const dispatch = useAppDispatch();
  const [registerMobileUser, { isLoading, error, data }] =
    useRegisterMobileUserMutation();

  /**
   * Call useRegisterMobileUserMutation and then save its results into a redux
   * User slice.
   *
   * @param requestBody object of type RegisterMobileUserRequestType.
   */
  const registerPhoneSaveUser = useCallback(
    async (requestBody: Omit<RegisterMobileUserRequestType, 'OperatorId'>) => {
      const result = await registerMobileUser({
        ...requestBody,
        OperatorId: 1,
      }).unwrap();

      dispatch(
        setUser({
          user: {
            userId: result.UserId,
            phoneNumber: requestBody.MobileNumber,
            profileType:
              'UserProfileType' in result ? result.UserProfileType : undefined,
          },
        }),
      );
      return result;
    },
    [registerMobileUser, dispatch],
  );

  return { registerPhoneSaveUser, isLoading, error, data };
}

export function usePosLogin() {
  const dispatch = useAppDispatch();
  const [auth, { isLoading }] = useAuthenticateMerchantPOSUserMutation();

  const posLogin = useCallback(
    async (user: string, pin: string) => {
      const posRes = await auth({
        Username: user.trim(),
        LoginCode: pin.trim(),
      }).unwrap();
      storage.set(STORAGE_KEYS.IS_POS, true);
      LastUsedService.reset();
      dispatch(
        setUser({
          user: {
            accountId: posRes.ApexAccountId,
            userId: posRes.MerchantPOSUserId,
            profileType: 'MerchantId',
          },
        }),
      );
      dispatch(setPosUser(posRes));
      dispatch(setSessionToken(posRes.SessionToken));
      dispatch(setAuthenticated(true));
    },
    [auth, dispatch],
  );

  return { isLoading, posLogin };
}

export function useValidateCredentialsSaveApiKeys() {
  const dispatch = useAppDispatch();

  const [
    confirmLogin,
    { isLoading: isLoadingConfirmLogin, error: confirmError },
  ] = useConfirmLoginMutation();
  const [authenticate, { isLoading: isLoadingAuthenticate, error: authError }] =
    useAuthenticateMutation();

  const validateCredentialsSaveApiKeys = async (
    requestBody: ConfirmLoginRequestType,
  ) => {
    try {
      if (requestBody.UserProfileType === 'MerchantId') {
        requestBody.UserIdentifier = requestBody.UserIdentifier.replace(
          /\D/g,
          '',
        );
      }
      const loginResult = await confirmLogin(requestBody).unwrap();
      if (loginResult) {
        logger(
          'debug',
          'Successfull login',
          'AuthHooks.useValidateCredentialsSaveApiKeys',
        );
        const { APIKey, APISecret } = loginResult;
        dispatch(
          setApiConnection({
            apiKey: APIKey,
            apiSecret: APISecret,
          }),
        );
        const authResult = await authenticate().unwrap();
        if (authResult.Authenticated) {
          logger(
            'debug',
            'Authentication successful',
            'AuthHooks.useValidateCredentialsSaveApiKeys',
          );
          dispatch(setSessionToken(authResult.SessionToken));
          dispatch(setAccountId(authResult.User.AccountId));
          LastUsedService.reset();
        }
      }
      return true;
    } catch (error) {
      logger('error', error, 'AuthHooks.useValidateCredentialsSaveApiKeys');
      throw error;
    }
  };

  return {
    validateCredentialsSaveApiKeys,
    isLoading: isLoadingConfirmLogin || isLoadingAuthenticate,
    error: confirmError || authError,
  };
}

export function useRegisterValidateOTP() {
  const dispatch = useDispatch();
  const [verifyOTP, { isLoading: isConfirmLoading, error }] =
    useConfirmRegistrationSmsMutation();

  const [authenticate, { isLoading: isLoadingAuthenticate, error: authError }] =
    useAuthenticateMutation();

  const confirmOTP = useCallback(
    async (requestBody: ConfirmRegistrationSmsRequestType) => {
      logger(
        'debug',
        'Start OTP confirmation: ' + JSON.stringify(requestBody),
        'useRegisterValidateOTP',
      );
      try {
        const result = await verifyOTP(requestBody).unwrap();
        logger(
          'debug',
          'OTP OK! ' + JSON.stringify(result),
          'useRegisterValidateOTP',
        );
        if (result) {
          dispatch(
            setApiConnection({
              apiKey: result.APIKey,
              apiSecret: result.APISecret,
            }),
          );
        }

        const authResult = await authenticate().unwrap();
        logger(
          'debug',
          'Authenticated successfully. ' + JSON.stringify(result),
          'useRegisterValidateOTP',
        );
        if (authResult.Authenticated) {
          dispatch(setSessionToken(authResult.SessionToken));
          dispatch(setAccountId(authResult.User.AccountId));
        }
      } catch (err) {
        logger('error', JSON.stringify(err), 'useRegisterValidateOTP');
        throw err;
      }
    },
    [verifyOTP, authenticate, dispatch],
  );

  return [
    confirmOTP,
    {
      isLoading: isConfirmLoading || isLoadingAuthenticate,
      error: error || authError,
    },
  ] as const;
}

export function useValidateIdentity(accountType: AuthProfileType) {
  const [mutation, queryState] = useValidateIdentityMutation();

  const handler = useCallback(
    async (payload: {
      identifier: string;
      duiRepresent?: string;
      dob: string;
    }) => {
      logger(
        'debug',
        `validate ${accountType} starting`,
        'AuthHooks.useValidateIdentity',
      );
      try {
        return await mutation({ accountType, ...payload }).unwrap();
      } catch (err) {
        logger('error', err, 'AuthHooks.useValidateIdentity');
        throw err;
      }
    },
    [mutation, accountType],
  );

  return [handler, queryState] as const;
}

export function useConfirmSmsSaveApiKeys() {
  const [confirmRegistrationSms, { isLoading }] =
    useConfirmRegistrationSmsMutation();

  const confirmSmsSaveApiKeys = async (
    requestBody: ConfirmRegistrationSmsRequestType,
  ) => {
    try {
      const result = await confirmRegistrationSms(requestBody).unwrap();

      console.log('confirmRegistrationSms: ' + JSON.stringify(result));
    } catch (error) {
      const errorData = (error as FetchBaseQueryError).data as PostResponseType;

      console.log('confirmRegistrationSms ERROR MSG: ' + errorData.errormsg);

      return false;
    }

    // TODO: Come up with standardized api call response structure.
    return true;
  };

  return { confirmSmsSaveApiKeys, isLoading };
}

export function useUpdatePasscode() {
  const [mutation, queryState] = useUpdatePasscodeMutation();

  const updatePasscode = useCallback(
    async (body: UpdatePasscodeRequestType) => {
      logger(
        'debug',
        `update passcode starting`,
        'AuthHooks.useUpdatePasscode',
      );
      try {
        return await mutation(body).unwrap();
      } catch (err) {
        logger('error', err, 'AuthHooks.useUpdatePasscode');
        throw err;
      }
    },
    [mutation],
  );

  return [updatePasscode, queryState] as const;
}

export function useRequestSmsCode() {
  const [mutation, queryState] = useRequestSmsCodeMutation();

  const requestSmsCode = useCallback(
    async (body: RequestSmsCodeRequestType) => {
      logger(
        'debug',
        `request sms code(otp) starting`,
        'AuthHooks.useRequestSmsCode',
      );
      try {
        return await mutation(body).unwrap();
      } catch (err) {
        logger('error', err, 'AuthHooks.useRequestSmsCode');
        throw err;
      }
    },
    [mutation],
  );

  return [requestSmsCode, queryState] as const;
}
