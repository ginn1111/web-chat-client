import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WallAvatar from '../../components/wall/WallAvatar';
import Biography from '../wall/Biography';
import Friend from '../wall/Friend';
import { useSelector, useDispatch } from 'react-redux';
import {
  getUser,
  getFriendInformation,
  getFriendStatus,
  getStatus,
} from '../../store/selectors';
import { getFriend, resetStatus } from '../../store/friend-slice';

const Wall = () => {
  const user = useSelector(getUser);
  const [
    { firstName, lastName, dob, slogan, join, friendList },
    setInformationOfWall,
  ] = useState(user);

  const friend = useSelector(getFriendInformation);
  const navigate = useNavigate();

  const status = useSelector(getFriendStatus);
  const userStatus = useSelector(getStatus);
  const { id } = useParams();
  const dispatch = useDispatch();

  const isOwn = id === user.id || id === 'me';

  const isFriend = useMemo(() => {
    return user.friendList?.some((friend) => friend._id === id);
  }, [user.friendList, id]);

  const isPending = useMemo(() => {
    return user.friendRequest?.some((friendId) => friendId === id);
  }, [user.friendRequest, id]);

  const isResponse = useMemo(() => {
    return user.friendResponse?.some((friendId) => friendId === id);
  }, [user.friendResponse, id]);

  useEffect(() => {
    if (status === 'get-friend/success') {
      setInformationOfWall(friend);
      dispatch(resetStatus());
    }
    if (status === 'get-friend/failed') {
      navigate(`/wall/me`);
      dispatch(resetStatus());
    }
  }, [status, friend, dispatch, navigate]);

  useEffect(() => {
    setInformationOfWall(isOwn ? user : friend);
  }, [userStatus, isOwn, user, friend]);

  useEffect(() => {
    if (!isOwn) {
      dispatch(getFriend(id));
    }
  }, [id, isOwn, dispatch]);

  return (
    <div className="format-page-size flex items-center flex-col mt-[-10px]">
      <WallAvatar
        fullName={`${firstName} ${lastName}`}
        avatar=""
        isOwned={isOwn}
        isFriend={isFriend}
        isPending={isPending}
        isResponse={isResponse}
      />
      <section className="text-slate-600 mt-[150px] flex items-start gap-x-5 w-full h-full pb-5">
        <Biography join={join} slogan={slogan} dob={dob} />
        <Friend friendList={friendList} />
      </section>
    </div>
  );
};

export default Wall;
