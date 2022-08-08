import React from 'react';

import GroupAddIcon from '@mui/icons-material/GroupAdd';
import withModal from '../../../hoc/withModal';
import Search from '../../ui/search/Search';
import NewConversation from './NewConversation';

const Header = ({ modal, onSearch}) => {
  return (
    <>
      <header className="flex justify-between items-center w-full py-1 text-slate-600">
        <div className="w-full flex items-center gap-x-2 ">
          <span className="font-bold">Inbox</span>
          <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-400 font-bold">
            2 New
          </span>
        </div>
        <GroupAddIcon
          className="cursor-pointer"
          sx={{ fontSize: 25 }}
          onClick={modal.open}
        />
      </header>
      <div className="text-[14px] w-full">
        <Search
          onSearch={onSearch}
          bgColor="bg-slate-200 text-[14px]"
          placeholder="search chat..."
        />
      </div>
    </>
  );
};

export default withModal(Header, NewConversation);
