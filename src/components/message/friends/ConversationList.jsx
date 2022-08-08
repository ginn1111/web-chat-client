import React, { useRef, useEffect, useMemo, useState, memo } from 'react';
import ConversationItem from './ConversationItem';
import { useParams } from 'react-router-dom';
import Header from './Header';
import { useDispatch, useSelector } from 'react-redux';
import {
  getConversationList,
  getConversationsStatus,
  getUser,
  isGroup,
} from '../../../store/selectors';
import {
  updateStateConversation,
  setIsGroup,
  getConversation,
} from '../../../store/conversation-slice';
import getSocketIO, {
  initConversations,
  removeGetUserOnline,
  getUserOnline,
  getStateConversations,
  removeGetStateConversations,
  updateStateConversation as updateStateConversationToSocket,
} from '../../../services/socketIO';
import useSearch from '../../../hooks/useSearch';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';

const ConversationList = () => {
  const dispatch = useDispatch();
  const isGroupTab = useSelector(isGroup);
  const status = useSelector(getConversationsStatus);
  const navigate = useNavigate();
  const conversationList = useSelector(getConversationList);
  const { id: userId } = useSelector(getUser);
  const { id: conversationId } = useParams();

  const [usersOnline, setUsersOnline] = useState({});
  const [stateConversations, setStateConversations] = useState({});
  const [filterConversation, setFilterConversation] = useState('');
  const searchHandler = useSearch(setFilterConversation);

  const divRef = useRef();
  const groupRef = useRef();
  const personRef = useRef();

  useEffect(() => {
    setFilterConversation('');
  }, [isGroupTab])

  useEffect(() => {
    status === 'conversation-get/success' &&
      navigate(`/message/${conversationList?.[0]?._id}`, { replace: true });
  }, [status]);

  useEffect(() => {
    conversationId &&
      dispatch(updateStateConversation({ conversationId, isUnSeen: false }));
  }, [conversationId]);

  useEffect(() => {
    dispatch(getConversation({ userId, isGroup: isGroupTab }));
  }, [isGroupTab]);

  useEffect(() => {
    let parent = null;
    isGroupTab ? (parent = groupRef.current) : (parent = personRef.current);

    divRef.current.style.left = parent?.offsetLeft + 'px';
    divRef.current.style.width = parent?.offsetWidth + 'px';
  }, [isGroupTab]);

  useEffect(() => {
    const socket = getSocketIO();
    socket?.connected &&
      conversationId &&
      updateStateConversationToSocket({ conversationId, isSeen: true }, socket);
  }, [getSocketIO()?.connected, conversationId]);

  useEffect(() => {
    const socket = getSocketIO();

    if (socket?.connected) {
      initConversations(userId, socket);
      getStateConversations(setStateConversations, socket);
      getUserOnline(setUsersOnline, socket);

      return () => {
        removeGetStateConversations(setStateConversations, socket);
        removeGetUserOnline(setUsersOnline, socket);
      };
    }
  }, [getSocketIO()?.connected]);

  const conversationListWithOnline = useMemo(() => {
    const usersIdOnline = Object.keys(usersOnline);
    const stateConversationsId = Object.keys(stateConversations);
    return conversationList.map((con) => {
      const memberId = con.members.find(
        ({ memberId }) =>
          memberId !== userId && usersIdOnline.includes(memberId),
      )?.memberId;
      return {
        ...con,
        fromOnline: memberId ? usersOnline[memberId] : con.fromOnline,
        isUnSeen:
          con?.isUnSeen ??
          (stateConversationsId.includes(con._id)
            ? !stateConversations[con._id]
            : false),
      };
    });
  }, [usersOnline, conversationList, stateConversations]);

  const filterList = useMemo(() => {
    if (filterConversation === '') return conversationListWithOnline;
    return conversationListWithOnline.filter((con) =>
      con.title.toLowerCase().includes(filterConversation.trim().toLowerCase()),
    );
  }, [conversationListWithOnline, filterConversation]);

  function selectGroupTabHandler(isGroup) {
    dispatch(setIsGroup(isGroup));
  }

  let conversationListRender = (
    <ul className="h-full w-full flex flex-col overflow-auto pr-1">
      {filterList?.length === 0 && (
        <p className="text-center text-[16px] font-[500] text-slate-600">
          No conversation found!
        </p>
      )}
      {filterList?.map((conversation) => {
        return (
          <ConversationItem
            key={conversation._id}
            name={conversation?.title}
            avatar={conversation?.avatar}
            fromOnline={
              conversation?.isOnline ? null : conversation?.fromOnline
            }
            conversationId={conversation._id}
            lastMsg={conversation?.lastMsg}
            isUnSeen={conversation?.isUnSeen}
            isGroup={conversation?.isGroup}
            members={conversation?.members}
          />
        );
      })}
    </ul>
  );

  if (status === 'conversation-get/pending')
    conversationListRender = <p>Loading</p>;
  if (status === 'conversation-get/error')
    conversationListRender = <p>Something went wrong :(</p>;

  return (
    <>
      <Header onSearch={searchHandler} />
      <div className="w-full h-[30px] flex gap-x-2 text-slate-600 px-2 relative">
        <span
          onClick={() => selectGroupTabHandler(false)}
          ref={personRef}
          className="px-2 py-1 flex items-center cursor-pointer"
        >
          <PersonIcon sx={{ fontSize: 25 }} />
        </span>
        <span
          onClick={() => selectGroupTabHandler(true)}
          ref={groupRef}
          className="px-2 py-1 flex items-center cursor-pointer"
        >
          <GroupsIcon sx={{ fontSize: 25 }} />
        </span>
        <span
          ref={divRef}
          className="absolute duration-300 h-full border-t-2 bg-slate-100 border-solid border-sky-600 z-[-1] rounded-b-sm"
        ></span>
      </div>
      {conversationListRender}
    </>
  );
};

export default memo(ConversationList);
