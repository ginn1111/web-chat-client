import { createSlice } from '@reduxjs/toolkit';
import { privateRequest, publicRequest } from '../axios';
import { getLocal, setLocal, removeLocal } from '../services/localServices';
import { showLoading, hideLoading } from './ui-slice';
import { getNotifications } from './notification-slice';
import * as authenticationService from '../services/authentication';
import * as userService from '../services/user';

const convertData = (data) => ({
  accessToken: data.accessToken,
  userInformation: {
    slogan: data.biography,
    dob: data.birthday,
    email: data.email,
    gender: data.gender,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    id: data._id,
    join: data.createdAt,
    address: data.address,
    friendRequest: data.friendRequest,
    friendResponse: data.friendResponse,
  },
});

const INIT_STATE = {
  accessToken: localStorage.getItem('accessToken'),
  userInformation: {
    avatar: '',
    coverPicture: '',
    id: '',
    firstName: '',
    lastName: '',
    phone: '',
    gender: '',
    email: '',
    dob: '',
    slogan: '',
    address: '',
    join: '',
  },
  status: 'idle',
};

const authenticationSlice = createSlice({
  name: 'authentication',
  initialState: INIT_STATE,
  reducers: {
    resetStatus(state) {
      state.status = 'idle';
    },
    setToken(state, action) {
      state.accessToken = action.payload;
    },
    addFriendRequest(state, action) {
      state.userInformation.friendRequest.push(action.payload);
    },
    removeFriendResponse(state, action) {
      const friendResponseList = state.userInformation.friendResponse;
      state.userInformation.friendResponse = friendResponseList.filter(
        (friendId) => friendId !== action.payload,
      );
    },
    removeFriendList(state, action) {
      const { friendList } = state.userInformation;
      state.userInformation.friendList = friendList.filter(
        (friend) => friend._id !== action.payload,
      );
    },
    addFriendList(state, action) {
      console.log(action.payload);
      state.userInformation.friendList = [
        ...state.userInformation.friendList,
        action.payload,
      ];
      // state.userInformation.friendList.push(action.payload);
    },
    setLogout(state) {
      state.accessToken = null;
      state.userInformation = {};
    },
    setUser(state, action) {
      state.userInformation = action.payload.userInformation;
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
  },
});

export const login =
  ({ email, password }) =>
  async (dispatch) => {
    dispatch(showLoading());
    try {
      const { data } = await authenticationService.login(email, password);
      dispatch(setToken(data.accessToken));

      const userData = convertData(data);
      const userId = userData?.userInformation?.id;

      const getFriendList = userService.getFriendListOfUser(userId);

      const getNotificationsOfUser = dispatch(getNotifications(userId));

      const { data: friendList } = await getFriendList;
      await getNotificationsOfUser;

      userData.userInformation.friendList = friendList;

      setLocal('userId', userId);
      dispatch(setUser(userData));
      dispatch(setStatus('login/success'));
    } catch (error) {
      console.log('login error', error);
      dispatch(setStatus('login/failed'));
    } finally {
      dispatch(hideLoading());
    }
  };

export const register =
  ({ firstName, lastName, email, password }) =>
  async (dispatch) => {
    dispatch(showLoading());
    try {
      await authenticationService.register({
        firstName,
        lastName,
        email,
        password,
      });
      dispatch(setStatus('register/success'));
    } catch (error) {
      console.log('register error: ', error);
      dispatch(setStatus('register/failed'));
    } finally {
      dispatch(hideLoading());
    }
  };

export const refreshToken = (userId) => async (dispatch) => {
  try {
    const response = await authenticationService.refreshToken(userId);
    console.log(response.data.accessToken);
    dispatch(setToken(response.data.accessToken));
    return response.data.accessToken;
  } catch (error) {
    console.log('refreshToken error: ', error);
    dispatch(logout(userId));
  }
};

export const logout = (userId) => async (dispatch) => {
  removeLocal('userId');
  try {
    await authenticationService.logout(userId);
    dispatch(setLogout());
  } catch (error) {
    console.log('logout error: ', error);
  }
};

export const getUserInformation = (userId) => async (dispatch) => {
  dispatch(showLoading());
  try {
    const responseUserInfor = userService.getUser(userId);
    const responseFriendList = userService.getFriendListOfUser(userId);
    const getNotificationsOfUser = dispatch(getNotifications(userId));

    const { data: user } = await responseUserInfor;
    const friendList = await responseFriendList;
    await getNotificationsOfUser;

    const userData = convertData(user);
    userData.userInformation.friendList = friendList;

    dispatch(setUser(userData));
  } catch (error) {
    console.log('get user error', error);
  } finally {
    dispatch(hideLoading());
  }
};

export const updateUser = (userInfor) => async (dispatch, getState) => {
  dispatch(showLoading());
  try {
    const userId = getState().authentication?.userInformation?.id;
    const { data } = await userService.updateUser(userId, userInfor);

    dispatch(setUser(convertData(data)));
    dispatch(setStatus('update-user/success'));
  } catch (error) {
    console.log('update-user error: ', error);
    dispatch(setStatus('update-user/failed'));
  } finally {
    dispatch(hideLoading());
  }
};

export const persist = () => async (dispatch, getState) => {
  const userId = getLocal('userId');
  dispatch(showLoading());
  try {
    await dispatch(refreshToken(userId));
    // await dispatch(getUserInformation(userId));
  } catch (error) {
    console.log(`persist error ${error}`);
  } finally {
    dispatch(hideLoading());
  }
};

export const {
  resetStatus,
  setAccessToken,
  addFriendRequest,
  removeFriendResponse,
  addFriendList,
  removeFriendList,
  setUser,
  setStatus,
  setToken,
  setLogout,
} = authenticationSlice.actions;
export default authenticationSlice.reducer;
